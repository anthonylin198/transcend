import { useMemo, useState } from "react";
import { api } from "@transcend/convex";
import { useMutation, useQuery } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/ui/Text";
import { getHomeBootstrapRange } from "@/utils/homeBootstrapRange";

const STATUS_OPTIONS = [
  { key: "todo", label: "Backlog" },
  { key: "next_up", label: "Next Up" },
  { key: "done", label: "Completed" },
] as const;

type PriorityStatus = (typeof STATUS_OPTIONS)[number]["key"];
type InitialPriority = {
  _id: string;
  name: string;
  description?: string;
  status: PriorityStatus;
  isActive?: boolean;
  projectId?: string;
};

function toDateKey(value: Date | number) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function PriorityDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    priorityId: string;
    projectId?: string;
    initialPriority?: string;
  }>();
  const priorityId = Array.isArray(params.priorityId)
    ? params.priorityId[0]
    : params.priorityId;
  const fallbackProjectId = Array.isArray(params.projectId)
    ? params.projectId[0]
    : params.projectId;
  const initialPriorityParam = Array.isArray(params.initialPriority)
    ? params.initialPriority[0]
    : params.initialPriority;
  const initialPriority = useMemo<InitialPriority | null>(() => {
    if (!initialPriorityParam) return null;
    try {
      return JSON.parse(initialPriorityParam) as InitialPriority;
    } catch {
      return null;
    }
  }, [initialPriorityParam]);
  const bootstrapRange = useMemo(() => getHomeBootstrapRange(), []);

  const priorities = useQuery(
    api.priorities.listPrioritiesForCurrentUser.listPrioritiesForCurrentUser,
    initialPriority ? "skip" : {},
  );
  const homeBootstrap = useQuery(api.home.bootstrap.bootstrap, bootstrapRange);
  const projects = homeBootstrap?.projects ?? [];
  const priority =
    priorities?.find((item) => item._id === priorityId) ??
    (initialPriority && initialPriority._id === priorityId
      ? initialPriority
      : undefined);

  const [name, setName] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [status, setStatus] = useState<PriorityStatus | null>(null);
  const [isActive, setIsActive] = useState<boolean | null>(null);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const updatePriority = useMutation(
    api.priorities.updatePriority.updatePriority,
  );
  const setPriorityStatus = useMutation(
    api.priorities.setPriorityStatus.setPriorityStatus,
  );
  const setPriorityActive = useMutation(
    api.priorities.setPriorityActive.setPriorityActive,
  );
  const assignPriorityToProject = useMutation(
    api.priorities.assignPriorityToProject.assignPriorityToProject,
  );
  const unassignPriorityFromProject = useMutation(
    api.priorities.unassignPriorityFromProject.unassignPriorityFromProject,
  );
  const deletePriority = useMutation(
    api.priorities.deletePriority.deletePriority,
  );

  const currentName = name ?? priority?.name ?? "";
  const currentDescription = description ?? priority?.description ?? "";
  const currentStatus = status ?? priority?.status ?? "todo";
  const currentIsActive = isActive ?? priority?.isActive ?? false;
  const currentProjectId = useMemo(() => {
    if (projectId !== null) return projectId;
    if (priority?.projectId) return priority.projectId;
    return fallbackProjectId;
  }, [fallbackProjectId, priority?.projectId, projectId]);

  const currentProject = projects?.find(
    (item) => item._id === currentProjectId,
  );
  const hasLoaded = !!priority;

  const persistAndGoBack = async () => {
    if (!priority || saving) return;
    setSaving(true);
    try {
      const trimmedName = currentName.trim();
      const normalizedDescription = currentDescription.trim();

      if (
        trimmedName !== priority.name ||
        normalizedDescription !== (priority.description ?? "")
      ) {
        await updatePriority({
          priorityId: priority._id as never,
          name: trimmedName,
          description:
            normalizedDescription.length > 0 ? normalizedDescription : null,
        });
      }

      if (currentStatus !== priority.status) {
        await setPriorityStatus({
          priorityId: priority._id as never,
          status: currentStatus,
          completedDateKey:
            currentStatus === "done" ? toDateKey(new Date()) : undefined,
        });
      }

      if (currentIsActive !== priority.isActive) {
        await setPriorityActive({
          priorityId: priority._id as never,
          isActive: currentIsActive,
        });
      }

      if (currentProjectId !== (priority.projectId ?? undefined)) {
        if (currentProjectId) {
          await assignPriorityToProject({
            priorityId: priority._id as never,
            projectId: currentProjectId as never,
          });
        } else {
          await unassignPriorityFromProject({
            priorityId: priority._id as never,
          });
        }
      }

      router.back();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update priority";
      Alert.alert("Could not save changes", message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!priority || saving) return;
    setSaving(true);
    try {
      await deletePriority({ priorityId: priority._id as never });
      setMenuOpen(false);
      if (fallbackProjectId) {
        router.replace({
          pathname: "/(authenticated)/project/[projectId]",
          params: { projectId: fallbackProjectId },
        });
        return;
      }
      router.replace("/(authenticated)/(tabs)/system");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete priority";
      Alert.alert("Could not delete priority", message);
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1, backgroundColor: "black" }}
    >
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
            justifyContent: "space-between",
          }}
        >
          <Pressable
            onPress={() => void persistAndGoBack()}
            disabled={!hasLoaded || saving}
            style={{ padding: 6, opacity: !hasLoaded || saving ? 0.5 : 1 }}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </Pressable>
          <View />
          <Pressable
            onPress={() => setMenuOpen(true)}
            disabled={!hasLoaded}
            style={{ padding: 6, opacity: !hasLoaded ? 0.5 : 1 }}
          >
            <Ionicons name="ellipsis-horizontal" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 20, gap: 18 }}>
        <TextInput
          value={currentName}
          onChangeText={setName}
          placeholder="Priority name"
          placeholderTextColor="#6B7280"
          style={{
            color: "#F9FAFB",
            borderBottomWidth: 1,
            borderBottomColor: "#374151",
            paddingVertical: 8,
            fontSize: 40,
            lineHeight: 48,
            fontWeight: "600",
          }}
        />

        <Pressable
          onPress={() => setProjectModalOpen(true)}
          style={{
            borderBottomWidth: 1,
            borderBottomColor: "#1F2937",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingBottom: 14,
          }}
        >
          <Text type="text-regular" color="#9CA3AF">
            Project
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text type="text-regular" color="#E5E7EB">
              {currentProject?.name ?? "None"}
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
              const selected = currentStatus === option.key;
              return (
                <Pressable
                  key={option.key}
                  onPress={() => setStatus(option.key)}
                  style={{
                    flex: 1,
                    borderRadius: 9,
                    borderWidth: 1,
                    borderColor: selected ? "#9CA3AF" : "#1F2937",
                    backgroundColor: selected ? "#374151" : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 10,
                  }}
                >
                  <Text
                    type="text-detail"
                    color={selected ? "#F3F4F6" : "#9CA3AF"}
                  >
                    {option.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          onPress={() => setIsActive(!currentIsActive)}
          style={{
            borderTopWidth: 1,
            borderBottomWidth: 1,
            borderTopColor: "#1F2937",
            borderBottomColor: "#1F2937",
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: 14,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <Ionicons name="calendar-clear-outline" size={20} color="#9CA3AF" />
            <Text type="text-regular">Active</Text>
          </View>
          <Text type="text-semibold" color="#D1D5DB">
            {currentIsActive ? "Yes" : "No"}
          </Text>
        </Pressable>

        <TextInput
          value={currentDescription}
          onChangeText={setDescription}
          placeholder="Add a description..."
          placeholderTextColor="#6B7280"
          multiline
          textAlignVertical="top"
          style={{
            minHeight: 120,
            color: "#E5E7EB",
            fontSize: 18,
            lineHeight: 24,
            paddingTop: 2,
          }}
        />
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
                setProjectId("");
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
                  setProjectId(project._id);
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

      <Modal visible={menuOpen} transparent animationType="fade">
        <Pressable
          onPress={() => setMenuOpen(false)}
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
              onPress={() => void onDelete()}
              style={{ paddingHorizontal: 16, paddingVertical: 14 }}
            >
              <Text type="text-semibold" color="#F87171">
                Delete Priority
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}
