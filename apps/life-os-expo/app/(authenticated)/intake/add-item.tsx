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
import { appFonts } from "@/constants/fonts";

export default function AddIntakeItemScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const createIntakeListItem = useMutation(
    api.intake.createIntakeListItem.createIntakeListItem,
  );

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const canCreate = title.trim().length > 0 && !saving;

  const onCreate = async () => {
    if (!canCreate) return;
    const trimmedTitle = title.trim();
    const normalizedDescription = description.trim();

    setSaving(true);
    try {
      await createIntakeListItem({
        title: trimmedTitle,
        description:
          normalizedDescription.length > 0 ? normalizedDescription : undefined,
      });
      router.back();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create intake item";
      Alert.alert("Could not create intake item", message);
    } finally {
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
          <Pressable onPress={() => router.back()} style={{ padding: 6 }}>
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </Pressable>
          <Text type="heading-4">Add Intake Item</Text>
          <Pressable
            onPress={() => void onCreate()}
            disabled={!canCreate}
            style={{ padding: 6, opacity: canCreate ? 1 : 0.5 }}
          >
            <Text type="text-semibold" color="#F3F4F6">
              Add
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 20, gap: 18 }}>
        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="What's on your mind?"
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

        <TextInput
          value={description}
          onChangeText={setDescription}
          placeholder="Add details..."
          placeholderTextColor="#6B7280"
          multiline
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
      </View>
    </KeyboardAvoidingView>
  );
}
