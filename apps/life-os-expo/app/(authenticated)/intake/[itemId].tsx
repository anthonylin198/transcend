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

export default function IntakeItemDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    itemId: string;
    initialItem?: string;
  }>();
  const itemId = Array.isArray(params.itemId)
    ? params.itemId[0]
    : params.itemId;
  const initialItemParam = Array.isArray(params.initialItem)
    ? params.initialItem[0]
    : params.initialItem;
  const initialItem = useMemo(() => {
    if (!initialItemParam) return null;
    try {
      return JSON.parse(initialItemParam) as {
        _id: string;
        title: string;
        description?: string;
        completed?: boolean;
      };
    } catch {
      return null;
    }
  }, [initialItemParam]);

  const intakeListItems = useQuery(
    api.intake.listIntakeListItemsForCurrentUser
      .listIntakeListItemsForCurrentUser,
    initialItem ? "skip" : {},
  );
  const intakeListItem =
    intakeListItems?.find((item) => item._id === itemId) ??
    (initialItem && initialItem._id === itemId ? initialItem : undefined);

  const updateIntakeListItem = useMutation(
    api.intake.updateIntakeListItem.updateIntakeListItem,
  );
  const setIntakeListItemCompletion = useMutation(
    api.intake.setIntakeListItemCompletion.setIntakeListItemCompletion,
  );
  const deleteIntakeListItem = useMutation(
    api.intake.deleteIntakeListItem.deleteIntakeListItem,
  );

  const [title, setTitle] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [completed, setCompleted] = useState<boolean | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentTitle = title ?? intakeListItem?.title ?? "";
  const currentDescription = description ?? intakeListItem?.description ?? "";
  const currentCompleted = completed ?? intakeListItem?.completed ?? false;

  const persistAndGoBack = async () => {
    if (!intakeListItem || saving) return;
    const trimmedTitle = currentTitle.trim();
    const normalizedDescription = currentDescription.trim();

    if (!trimmedTitle) {
      Alert.alert("Title required", "Intake item title cannot be empty.");
      return;
    }

    setSaving(true);
    try {
      if (
        trimmedTitle !== intakeListItem.title ||
        normalizedDescription !== (intakeListItem.description ?? "")
      ) {
        await updateIntakeListItem({
          intakeListItemId: intakeListItem._id,
          title: trimmedTitle,
          description:
            normalizedDescription.length > 0 ? normalizedDescription : null,
        });
      }

      if (currentCompleted !== intakeListItem.completed) {
        await setIntakeListItemCompletion({
          intakeListItemId: intakeListItem._id,
          completed: currentCompleted,
        });
      }

      router.back();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update intake item";
      Alert.alert("Could not save changes", message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!intakeListItem || saving) return;
    setSaving(true);
    try {
      await deleteIntakeListItem({ intakeListItemId: intakeListItem._id });
      setMenuOpen(false);
      router.replace("/(authenticated)/intake");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete intake item";
      Alert.alert("Could not delete intake item", message);
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
            disabled={!intakeListItem || saving}
            style={{ padding: 6, opacity: !intakeListItem || saving ? 0.5 : 1 }}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </Pressable>
          <Text type="heading-4">Edit Intake Item</Text>
          <Pressable
            onPress={() => setMenuOpen(true)}
            disabled={!intakeListItem}
            style={{ padding: 6, opacity: !intakeListItem ? 0.5 : 1 }}
          >
            <Ionicons name="ellipsis-horizontal" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 20, gap: 18 }}>
        <TextInput
          value={currentTitle}
          onChangeText={setTitle}
          placeholder="What's on your mind?"
          placeholderTextColor="#6B7280"
          style={{
            color: "#F9FAFB",
            fontSize: 52,
            lineHeight: 56,
            fontWeight: "600",
          }}
        />

        <Pressable
          onPress={() => setCompleted(!currentCompleted)}
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
          <Text type="text-regular" color="#9CA3AF">
            Completed
          </Text>
          <Text type="text-semibold" color="#D1D5DB">
            {currentCompleted ? "Yes" : "No"}
          </Text>
        </Pressable>

        <TextInput
          value={currentDescription}
          onChangeText={setDescription}
          placeholder="Add details..."
          placeholderTextColor="#6B7280"
          multiline
          textAlignVertical="top"
          style={{
            minHeight: 120,
            color: "#E5E7EB",
            fontSize: 28,
            lineHeight: 34,
            paddingTop: 2,
          }}
        />
      </View>

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
                Delete Intake Item
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}
