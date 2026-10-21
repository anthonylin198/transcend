import { api } from "@transcend/convex";
import type { OptimisticLocalStore } from "convex/browser";
import { useMutation, useQuery } from "convex/react";
import type { FunctionArgs } from "convex/server";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ActiveDayField from "@/components/priorities/ActiveDayField";
import Eyebrow from "@/components/ui/Eyebrow";
import Text from "@/components/ui/Text";
import { getHomeBootstrapRange } from "@/utils/homeBootstrapRange";

type PriorityItem = {
  _id: string;
  projectId?: string;
  name: string;
  status: "todo" | "next_up" | "done";
  isActive: boolean;
  activeDateKey?: string;
  activatedAt?: number;
  orderIndex: number;
};

type Group = {
  key: string;
  title: string;
  priorities: PriorityItem[];
};

function toDateKey(value: Date | number) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getActivationTimestampMs() {
  return Date.now();
}

function readActiveDateKey(priority: PriorityItem) {
  if (!priority.isActive) return null;
  if (priority.activeDateKey) return priority.activeDateKey;
  if (priority.activatedAt !== undefined)
    return toDateKey(priority.activatedAt);
  return null;
}

type HomeBootstrapRange = ReturnType<typeof getHomeBootstrapRange>;
type SetPriorityActiveArgs = FunctionArgs<
  typeof api.priorities.setPriorityActive.setPriorityActive
>;

function applySetPriorityActiveOptimisticUpdate(
  localStore: OptimisticLocalStore,
  args: SetPriorityActiveArgs,
  bootstrapRange: HomeBootstrapRange,
) {
  const bootstrap = localStore.getQuery(
    api.home.bootstrap.bootstrap,
    bootstrapRange,
  );
  if (bootstrap === undefined || !bootstrap.profile) return;

  const now = Date.now();
  const maxActiveOrderIndex = bootstrap.priorities.reduce(
    (max, item) =>
      item.activeOrderIndex !== undefined
        ? Math.max(max, item.activeOrderIndex)
        : max,
    -1,
  );
  const nextPriorities = bootstrap.priorities.map((priority) => {
    if (priority._id !== args.priorityId) {
      return priority;
    }
    // Newly activated priorities append to the bottom of the active list;
    // an already-active priority keeps its position.
    const nextActiveOrderIndex = args.isActive
      ? priority.isActive
        ? priority.activeOrderIndex
        : maxActiveOrderIndex + 1
      : undefined;
    return {
      ...priority,
      isActive: args.isActive,
      activatedAt: args.isActive ? (args.activatedAtMs ?? now) : undefined,
      activeDateKey: args.isActive ? args.activeDateKey : undefined,
      activeOrderIndex: nextActiveOrderIndex,
      updatedAt: now,
    };
  });

  localStore.setQuery(api.home.bootstrap.bootstrap, bootstrapRange, {
    ...bootstrap,
    priorities: nextPriorities,
    categories: nextPriorities.filter(
      (priority) => priority.status === "next_up" && priority.isActive,
    ),
  });
}

export default function AddToActiveScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const bootstrapRange = useMemo(() => getHomeBootstrapRange(), []);
  const params = useLocalSearchParams<{
    selectedDateMs?: string;
  }>();
  const setPriorityActive = useMutation(
    api.priorities.setPriorityActive.setPriorityActive,
  ).withOptimisticUpdate((localStore, args) => {
    applySetPriorityActiveOptimisticUpdate(localStore, args, bootstrapRange);
  });

  const rawSelectedDateMs = Array.isArray(params.selectedDateMs)
    ? params.selectedDateMs[0]
    : params.selectedDateMs;
  const parsedSelectedDateMs = Number(rawSelectedDateMs);
  const [fallbackSelectedDateMs] = useState(() => Date.now());
  const selectedDateMs = Number.isFinite(parsedSelectedDateMs)
    ? parsedSelectedDateMs
    : fallbackSelectedDateMs;

  const homeBootstrap = useQuery(api.home.bootstrap.bootstrap, bootstrapRange);

  const projects = homeBootstrap?.projects ?? [];
  const priorities = homeBootstrap?.priorities ?? [];
  const nextPriorities = priorities.filter(
    (priority) => priority.status === "next_up",
  ) as PriorityItem[];

  const unlinked = nextPriorities.filter((priority) => !priority.projectId);
  const linked = nextPriorities.filter((priority) => priority.projectId);

  const groupsByProjectId = new Map<string, PriorityItem[]>();
  for (const priority of linked) {
    const bucket = groupsByProjectId.get(priority.projectId!) ?? [];
    bucket.push(priority);
    groupsByProjectId.set(priority.projectId!, bucket);
  }

  const projectGroups: Group[] = projects
    .map((project) => ({
      key: project._id,
      title: project.name,
      priorities: (groupsByProjectId.get(project._id) ?? []).sort(
        (a, b) => a.orderIndex - b.orderIndex,
      ),
    }))
    .filter((group) => group.priorities.length > 0);

  const groups: Group[] = [...projectGroups];
  if (unlinked.length > 0) {
    groups.push({
      key: "unlinked",
      title: "Unlinked Priorities",
      priorities: unlinked.sort((a, b) => a.orderIndex - b.orderIndex),
    });
  }

  const showingDateKey = toDateKey(selectedDateMs);

  const onSetActiveDate = async (
    priority: PriorityItem,
    nextDateKey: string | null,
  ) => {
    const turningOn = nextDateKey !== null;
    try {
      await setPriorityActive({
        priorityId: priority._id as never,
        isActive: turningOn,
        activatedAtMs: turningOn
          ? priority.isActive
            ? priority.activatedAt
            : getActivationTimestampMs()
          : undefined,
        activeDateKey: turningOn ? nextDateKey : undefined,
      } as never);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update priority";
      Alert.alert("Could not update priority", message);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <View
        style={{
          paddingTop: insets.top,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#1F2937",
          backgroundColor: "black",
        }}
      >
        <View
          style={{
            minHeight: 56,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <Pressable onPress={() => router.back()} style={{ padding: 6 }}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </Pressable>
          <View>
            <Text type="heading-4">Add to Active</Text>
            <Text type="text-detail" color="#9CA3AF">
              Set the active day for each priority
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 28,
          paddingBottom: 40,
          gap: 36,
        }}
      >
        {groups.length === 0 ? (
          <Text type="text-regular" color="#525252">
            No next priorities available.
          </Text>
        ) : (
          groups.map((group) => (
            <View key={group.key} style={{ gap: 14 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Eyebrow>{group.title.toUpperCase()}</Eyebrow>
                {group.key !== "unlinked" ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Add priority to ${group.title}`}
                    onPress={() =>
                      router.push({
                        pathname: "/(authenticated)/priority/add-priority",
                        params: {
                          projectId: group.key,
                          defaultStatus: "next_up",
                          defaultIsActive: "false",
                          selectedDateMs: String(selectedDateMs),
                        },
                      })
                    }
                    hitSlop={8}
                    style={{ padding: 2 }}
                  >
                    <Ionicons name="add" size={20} color="#525252" />
                  </Pressable>
                ) : null}
              </View>
              <View style={{ gap: 16 }}>
                {group.priorities.map((priority) => (
                  <View
                    key={priority._id}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={priority.name}
                      onPress={() =>
                        router.push({
                          pathname: "/(authenticated)/priority/[priorityId]",
                          params: {
                            priorityId: priority._id,
                            initialPriority: JSON.stringify(priority),
                            selectedDateMs: String(selectedDateMs),
                          },
                        })
                      }
                      style={({ pressed }) => ({
                        flex: 1,
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <Text type="text-regular">{priority.name}</Text>
                    </Pressable>
                    <ActiveDayField
                      variant="value"
                      activeDateKey={readActiveDateKey(priority)}
                      defaultDateKey={showingDateKey}
                      onChange={(nextDateKey) =>
                        void onSetActiveDate(priority, nextDateKey)
                      }
                    />
                  </View>
                ))}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
