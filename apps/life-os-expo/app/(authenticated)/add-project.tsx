import { useState } from "react";
import { api } from "@transcend/convex";
import { useMutation } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

export default function AddProjectScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const createProject = useMutation(api.projects.createProject.createProject);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const canSubmit = name.trim().length > 0;

  const onCreate = async () => {
    if (!canSubmit) return;
    const input = {
      name: name.trim(),
      description: description.trim() || undefined,
    };
    router.back();
    try {
      await createProject(input);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create project";
      Alert.alert("Could not create project", message);
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
          <Text type="heading-4">Add Project</Text>
          <Pressable onPress={() => router.back()} style={{ padding: 6 }}>
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 20, gap: 18 }}>
        <View>
          <Text type="text-detail" color="#9CA3AF" style={{ marginBottom: 8 }}>
            Project name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Enter project name"
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

        <View>
          <Text type="text-detail" color="#9CA3AF" style={{ marginBottom: 8 }}>
            Description
          </Text>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Add a description..."
            placeholderTextColor="#6B7280"
            multiline
            textAlignVertical="top"
            style={{
              minHeight: 120,
              borderWidth: 1,
              borderColor: "#1F2937",
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 10,
              color: "#E5E7EB",
              fontSize: 16,
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
            Create Project
          </Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
