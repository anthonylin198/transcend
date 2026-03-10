import { useMemo, useState } from "react";
import { api, useMutation } from "@transcend/convex";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/ui/Text";

const STATUS_OPTIONS = [
  { key: "todo", label: "Backlog" },
  { key: "next_up", label: "Next Up" },
  { key: "done", label: "Completed" },
] as const;

type PriorityStatus = (typeof STATUS_OPTIONS)[number]["key"];

function normalizeStatus(value?: string): PriorityStatus {
  if (value === "next_up" || value === "done" || value === "todo") {
    return value;
  }
  return "todo";
}

export default function AddPriorityScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    projectId: string;
    defaultStatus?: string;
  }>();
  const createPriority = useMutation(api.priorities.createPriority.createPriority);
  const setPriorityStatus = useMutation(
    api.priorities.setPriorityStatus.setPriorityStatus,
  );
  const setPriorityActive = useMutation(
    api.priorities.setPriorityActive.setPriorityActive,
  );

  const projectId = useMemo(() => {
    if (Array.isArray(params.projectId)) {
      return params.projectId[0];
    }
    return params.projectId;
  }, [params.projectId]);

  const defaultStatus = useMemo(() => {
    const raw = Array.isArray(params.defaultStatus)
      ? params.defaultStatus[0]
      : params.defaultStatus;
    return normalizeStatus(raw);
  }, [params.defaultStatus]);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<PriorityStatus>(defaultStatus);
  const [isActive, setIsActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = name.trim().length > 0 && !submitting && !!projectId;

  const onCreate = async () => {
    if (!canSubmit || !projectId) return;

    setSubmitting(true);
    try {
      const priorityId = await createPriority({
        projectId: projectId as never,
        name: name.trim(),
        description: description.trim() || undefined,
      });

      if (status !== "todo") {
        await setPriorityStatus({
          priorityId,
          status,
        });
      }

      if (isActive) {
        await setPriorityActive({
          priorityId,
          isActive: true,
        });
      }

      router.back();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create priority";
      Alert.alert("Could not create priority", message);
    } finally {
      setSubmitting(false);
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
          <Pressable onPress={() => router.back()} style={{ padding: 6 }}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </Pressable>
          <Text type="heading-4">Add Priority</Text>
          <Pressable onPress={() => router.back()} style={{ padding: 6 }}>
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 20, gap: 18 }}>
        <View>
          <Text type="text-detail" color="#9CA3AF" style={{ marginBottom: 8 }}>
            Priority name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter priority name"
            placeholderTextColor="#6B7280"
            autoFocus
            style={{
              color: "#F9FAFB",
              borderBottomWidth: 1,
              borderBottomColor: "#374151",
              paddingVertical: 8,
              fontSize: 34,
              lineHeight: 40,
              fontWeight: "600",
            }}
          />
        </View>

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
                    borderWidth: 1,
                    borderColor: selected ? "#9CA3AF" : "#1F2937",
                    backgroundColor: selected ? "#374151" : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingVertical: 10,
                  }}
                >
                  <Text type="text-detail" color={selected ? "#F3F4F6" : "#9CA3AF"}>
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
            {isActive ? "Yes" : "No"}
          </Text>
        </Pressable>

        <View>
          <TextInput
            value={description}
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
      </View>

      <View
        style={{
          paddingHorizontal: 16,
          paddingTop: 10,
          paddingBottom: Math.max(insets.bottom, 12),
          borderTopWidth: 1,
          borderTopColor: "#1F2937",
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
            {submitting ? "Creating..." : "Create Priority"}
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
