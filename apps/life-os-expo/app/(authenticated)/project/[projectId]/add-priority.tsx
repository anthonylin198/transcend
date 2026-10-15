import { useMemo, useState } from "react";
import { api } from "@transcend/convex";
import type { OptimisticLocalStore } from "convex/browser";
import { useMutation, useQuery } from "convex/react";
import type { FunctionArgs } from "convex/server";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/ui/Text";
import { appFonts } from "@/constants/fonts";
import { getHomeBootstrapRange } from "@/utils/homeBootstrapRange";

const STATUS_OPTIONS = [
  { key: "todo", label: "Todo" },
  { key: "next_up", label: "Next up" },
  { key: "done", label: "Complete" },
] as const;

type PriorityStatus = (typeof STATUS_OPTIONS)[number]["key"];
function toDateKey(value: Date | number) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function normalizeStatus(value?: string): PriorityStatus {
  if (value === "next_up" || value === "done" || value === "todo") {
    return value;
  }
  return "todo";
}

function getActivatedAtMsForSelectedDay(selectedDateMs?: number) {
  const now = Date.now();
  if (selectedDateMs === undefined) return now;
  return now;
}

type HomeBootstrapRange = ReturnType<typeof getHomeBootstrapRange>;
type CreatePriorityArgs = FunctionArgs<
  typeof api.priorities.createPriority.createPriority
>;

function applyCreatePriorityOptimisticUpdate(
  localStore: OptimisticLocalStore,
  args: CreatePriorityArgs,
  bootstrapRange: HomeBootstrapRange,
) {
  const current = localStore.getQuery(
    api.home.bootstrap.bootstrap,
    bootstrapRange,
  );
  if (!current || !current.profile) return;

  const now = Date.now();
  const optimisticId = `optimistic-priority-${now}-${Math.random()}`;
  const maxOrderIndex = current.priorities.reduce(
    (max, item) => Math.max(max, item.orderIndex),
    -1,
  );
  const maxActiveOrderIndex = current.priorities.reduce(
    (max, item) =>
      item.activeOrderIndex !== undefined
        ? Math.max(max, item.activeOrderIndex)
        : max,
    -1,
  );
  const completedAt =
    args.status === "done" ? (args.completedAtMs ?? now) : undefined;
  const optimisticPriority = {
    _id: optimisticId as never,
    _creationTime: now,
    profileId: current.profile._id,
    projectId: args.projectId,
    name: args.name,
    description: args.description,
    status: args.status ?? "todo",
    isActive: args.isActive ?? false,
    orderIndex: maxOrderIndex + 1,
    activeOrderIndex:
      args.isActive === true ? maxActiveOrderIndex + 1 : undefined,
    activatedAt:
      args.isActive === true ? (args.activatedAtMs ?? now) : undefined,
    activeDateKey:
      args.isActive === true
        ? (args.activeDateKey ?? toDateKey(args.activatedAtMs ?? now))
        : undefined,
    completedAt,
    completedDateKey:
      args.status === "done"
        ? (args.completedDateKey ?? toDateKey(completedAt ?? now))
        : undefined,
    createdAt: now,
    updatedAt: now,
  } as (typeof current.priorities)[number];

  localStore.setQuery(api.home.bootstrap.bootstrap, bootstrapRange, {
    ...current,
    priorities: [...current.priorities, optimisticPriority],
    categories:
      optimisticPriority.status === "next_up" && optimisticPriority.isActive
        ? [...current.categories, optimisticPriority]
        : current.categories,
  });
}

export default function AddPriorityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const bootstrapRange = useMemo(() => getHomeBootstrapRange(), []);
  const params = useLocalSearchParams<{
    projectId?: string;
    defaultStatus?: string;
    defaultIsActive?: string;
    selectedDateMs?: string;
  }>();
  const createPriority = useMutation(
    api.priorities.createPriority.createPriority,
  ).withOptimisticUpdate((localStore, args) => {
    applyCreatePriorityOptimisticUpdate(localStore, args, bootstrapRange);
  });
  const projects = useQuery(
    api.projects.listProjectsForCurrentUser.listProjectsForCurrentUser,
    {},
  );

  const projectId = useMemo(() => {
    if (Array.isArray(params.projectId)) {
      return params.projectId[0] === "unlinked"
        ? undefined
        : params.projectId[0];
    }
    return params.projectId === "unlinked" ? undefined : params.projectId;
  }, [params.projectId]);

  const defaultStatus = useMemo(() => {
    const raw = Array.isArray(params.defaultStatus)
      ? params.defaultStatus[0]
      : params.defaultStatus;
    return normalizeStatus(raw);
  }, [params.defaultStatus]);
  const defaultIsActive = useMemo(() => {
    const raw = Array.isArray(params.defaultIsActive)
      ? params.defaultIsActive[0]
      : params.defaultIsActive;
    return raw === "true";
  }, [params.defaultIsActive]);
  const selectedDateMs = useMemo(() => {
    const raw = Array.isArray(params.selectedDateMs)
      ? params.selectedDateMs[0]
      : params.selectedDateMs;
    if (!raw) return undefined;
    const parsed = Number(raw);
    return Number.isFinite(parsed) ? parsed : undefined;
  }, [params.selectedDateMs]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<PriorityStatus>(defaultStatus);
  const [isActive, setIsActive] = useState(defaultIsActive);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    projectId ?? null,
  );
  const [projectModalOpen, setProjectModalOpen] = useState(false);

  const canSubmit = name.trim().length > 0;

  const onCreate = async () => {
    if (!canSubmit) return;
    const now = Date.now();
    const activatedAtMs =
      isActive && status === "next_up"
        ? getActivatedAtMsForSelectedDay(selectedDateMs)
        : undefined;
    const activeDateKey =
      isActive && status === "next_up"
        ? toDateKey(selectedDateMs ?? activatedAtMs ?? now)
        : undefined;
    const completedAtMs =
      status === "done" ? (selectedDateMs ?? now) : undefined;
    const createInput = selectedProjectId
      ? {
          projectId: selectedProjectId as never,
          name: name.trim(),
          description: description.trim() || undefined,
          status,
          isActive,
          activatedAtMs,
          activeDateKey,
          completedAtMs,
          completedDateKey:
            status === "done" ? toDateKey(completedAtMs ?? now) : undefined,
        }
      : {
          name: name.trim(),
          description: description.trim() || undefined,
          status,
          isActive,
          activatedAtMs,
          activeDateKey,
          completedAtMs,
          completedDateKey:
            status === "done" ? toDateKey(completedAtMs ?? now) : undefined,
        };

    router.back();
    try {
      await createPriority(createInput);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create priority";
      Alert.alert("Could not create priority", message);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1, backgroundColor: "black" }}
    >
      <View
        style={{
          paddingTop: insets.top,
          paddingHorizontal: 16,
          backgroundColor: "black",
        }}
      >
        <View
          style={{
            minHeight: 56,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Pressable onPress={() => router.back()} style={{ padding: 6 }}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </Pressable>
          <Text type="heading-4">Add Priority</Text>
          <Pressable onPress={() => router.back()} style={{ padding: 6 }}>
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: 16,
          gap: 18,
        }}
        keyboardDismissMode="on-drag"
        showsVerticalScrollIndicator={false}
      >
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Priority name"
          placeholderTextColor="#6B7280"
          autoFocus
          multiline
          scrollEnabled={false}
          style={{
            color: "#F9FAFB",
            fontFamily: appFonts.semiBold,
            fontSize: 34,
            lineHeight: 40,
          }}
        />

        <Pressable
          onPress={() => setProjectModalOpen(true)}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 4,
          }}
        >
          <Text type="text-regular" color="#9CA3AF">
            Project
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text type="text-regular" color="#E5E7EB">
              {selectedProjectId
                ? (projects?.find((item) => item._id === selectedProjectId)
                    ?.name ?? "Project")
                : "None"}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#6B7280" />
          </View>
        </Pressable>

        <View style={{ gap: 10 }}>
          <Text type="text-detail" color="#9CA3AF">
            Status
          </Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            {STATUS_OPTIONS.map((option) => {
              const selected = status === option.key;
              return (
                <Pressable
                  key={option.key}
                  onPress={() => setStatus(option.key)}
                  style={{
                    flex: 1,
                    borderRadius: 9,
                    backgroundColor: selected ? "#FFFFFF" : "#18181B",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 10,
                  }}
                >
                  <Text
                    type="text-detail"
                    color={selected ? "#000000" : "#9CA3AF"}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          onPress={() => setIsActive((value) => !value)}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 4,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="calendar-clear-outline" size={20} color="#9CA3AF" />
            <Text type="text-regular">Active</Text>
          </View>
          <Text type="text-semibold" color="#D1D5DB">
            {isActive ? "Yes" : "No"}
          </Text>
        </Pressable>

        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Add a description..."
          placeholderTextColor="#6B7280"
          multiline
          scrollEnabled={false}
          textAlignVertical="top"
          style={{
            minHeight: 120,
            color: "#E5E7EB",
            fontFamily: appFonts.regular,
            fontSize: 16,
            lineHeight: 24,
            paddingTop: 2,
          }}
        />
      </ScrollView>

      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: Math.max(insets.bottom, 12),
        }}
      >
        <Pressable
          disabled={!canSubmit}
          onPress={() => void onCreate()}
          style={{
            borderRadius: 10,
            minHeight: 52,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: canSubmit ? "#F3F4F6" : "#374151",
          }}
        >
          <Text type="text-semibold" color={canSubmit ? "#111827" : "#9CA3AF"}>
            Create Priority
          </Text>
        </Pressable>
      </View>

      <Modal visible={projectModalOpen} transparent animationType="fade">
        <Pressable
          onPress={() => setProjectModalOpen(false)}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
            padding: 16,
          }}
        >
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={{
              backgroundColor: "#111827",
              borderWidth: 1,
              borderColor: "#1F2937",
              borderRadius: 12,
              overflow: "hidden",
            }}
          >
            <Pressable
              onPress={() => {
                setSelectedProjectId(null);
                setProjectModalOpen(false);
              }}
              style={{ paddingHorizontal: 16, paddingVertical: 14 }}
            >
              <Text type="text-regular">None</Text>
            </Pressable>
            {projects?.map((project) => (
              <Pressable
                key={project._id}
                onPress={() => {
                  setSelectedProjectId(project._id);
                  setProjectModalOpen(false);
                }}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  borderTopWidth: 1,
                  borderTopColor: "#1F2937",
                }}
              >
                <Text type="text-regular">{project.name}</Text>
              </Pressable>
            ))}
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}
