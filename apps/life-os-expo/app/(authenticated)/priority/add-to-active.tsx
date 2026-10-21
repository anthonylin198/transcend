import { api } from "@transcend/convex";
import type { OptimisticLocalStore } from "convex/browser";
import { useMutation, useQuery } from "convex/react";
import type { FunctionArgs } from "convex/server";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/ui/Text";
import { getHomeBootstrapRange } from "@/utils/homeBootstrapRange";

type PriorityItem = {
  _id: string;
  projectId?: string;
  name: string;
  status: "todo" | "next_up" | "done";
  isActive: boolean;
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
  groups.push({
    key: "unlinked",
    title: "Unlinked Priorities",
    priorities: unlinked.sort((a, b) => a.orderIndex - b.orderIndex),
  });

  const onToggleActive = async (priority: PriorityItem) => {
    const nextIsActive = !priority.isActive;
    const activatedAtMs = nextIsActive ? getActivationTimestampMs() : undefined;
    const activeDateKey = nextIsActive ? toDateKey(selectedDateMs) : undefined;
    try {
      await setPriorityActive({
        priorityId: priority._id as never,
        isActive: nextIsActive,
        activatedAtMs,
        activeDateKey,
      } as never);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to activate priority";
      Alert.alert("Could not add priority", message);
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
              Select priorities to work on this day
            </Text>
          </View>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}
      >
        {groups.length === 0 ? (
          <Text type="text-regular" color="#9CA3AF">
            No next priorities available.
          </Text>
        ) : (
          groups.map((group) => (
            <View
              key={group.key}
              style={{
                borderRadius: 12,
                borderWidth: 1,
                borderColor: "#1F2937",
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: "#1F2937",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Text type="text-semibold">{group.title}</Text>
                {group.key !== "unlinked" ? (
                  <Pressable
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
                    style={{ padding: 4 }}
                  >
                    <Ionicons name="add" size={20} color="#9CA3AF" />
                  </Pressable>
                ) : null}
              </View>
              <View>
                {group.priorities.length === 0 ? (
                  <Text
                    type="text-detail"
                    color="#6B7280"
                    style={{ paddingHorizontal: 14, paddingVertical: 12 }}
                  >
                    No priorities
                  </Text>
                ) : (
                  group.priorities.map((priority, index) => {
                    const actionLabel = priority.isActive ? "Remove" : "Add";
                    return (
                      <View
                        key={priority._id}
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 12,
                          borderTopWidth: index === 0 ? 0 : 1,
                          borderTopColor: "#1F2937",
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 10,
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
                        <Pressable
                          onPress={() => void onToggleActive(priority)}
                          style={{
                            borderWidth: 1,
                            borderColor: priority.isActive
                              ? "#7F1D1D"
                              : "#374151",
                            borderRadius: 8,
                            paddingHorizontal: 12,
                            paddingVertical: 5,
                          }}
                        >
                          <Text
                            type="text-detail"
                            color={priority.isActive ? "#FCA5A5" : "#D1D5DB"}
                          >
                            {actionLabel}
                          </Text>
                        </Pressable>
                      </View>
                    );
                  })
                )}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
