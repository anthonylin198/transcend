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
import { appFonts } from "@/constants/fonts";
import { getHomeBootstrapRange } from "@/utils/homeBootstrapRange";

export default function IntakeItemDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const bootstrapRange = useMemo(() => getHomeBootstrapRange(), []);
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
  const deleteIntakeListItem = useMutation(
    api.intake.deleteIntakeListItem.deleteIntakeListItem,
  ).withOptimisticUpdate((localStore, args) => {
    const bootstrap = localStore.getQuery(
      api.home.bootstrap.bootstrap,
      bootstrapRange,
    );
    if (bootstrap !== undefined && bootstrap.profile) {
      localStore.setQuery(api.home.bootstrap.bootstrap, bootstrapRange, {
        ...bootstrap,
        intakeListItems: bootstrap.intakeListItems.filter(
          (item) => item._id !== args.intakeListItemId,
        ),
      });
    }

    const list = localStore.getQuery(
      api.intake.listIntakeListItemsForCurrentUser
        .listIntakeListItemsForCurrentUser,
      {},
    );
    if (list !== undefined) {
      localStore.setQuery(
        api.intake.listIntakeListItemsForCurrentUser
          .listIntakeListItemsForCurrentUser,
        {},
        list.filter((item) => item._id !== args.intakeListItemId),
      );
    }
  });

  const [title, setTitle] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentTitle = title ?? intakeListItem?.title ?? "";
  const currentDescription = description ?? intakeListItem?.description ?? "";

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
    setMenuOpen(false);
    router.back();
    void (async () => {
      try {
        await deleteIntakeListItem({ intakeListItemId: intakeListItem._id });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Failed to delete intake item";
        Alert.alert("Could not delete intake item", message);
      }
    })();
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
          value={currentDescription}
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
