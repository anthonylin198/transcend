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

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;
type InitialHabit = {
  _id: string;
  name: string;
  description?: string;
  targetDays?: string[];
};

export default function HabitDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    habitId: string;
    initialHabit?: string;
  }>();
  const habitId = Array.isArray(params.habitId)
    ? params.habitId[0]
    : params.habitId;
  const initialHabitParam = Array.isArray(params.initialHabit)
    ? params.initialHabit[0]
    : params.initialHabit;
  const initialHabit = useMemo<InitialHabit | null>(() => {
    if (!initialHabitParam) return null;
    try {
      return JSON.parse(initialHabitParam) as InitialHabit;
    } catch {
      return null;
    }
  }, [initialHabitParam]);

  const habits = useQuery(
    api.habits.listHabitsForCurrentUser.listHabitsForCurrentUser,
    initialHabit ? "skip" : {},
  );
  const habit =
    habits?.find((item) => item._id === habitId) ??
    (initialHabit && initialHabit._id === habitId ? initialHabit : undefined);

  const updateHabit = useMutation(api.habits.updateHabit.updateHabit);
  const deleteHabit = useMutation(api.habits.deleteHabit.deleteHabit);

  const [name, setName] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [targetDays, setTargetDays] = useState<string[] | null>(null);
  const [daysModalOpen, setDaysModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const currentName = name ?? habit?.name ?? "";
  const currentDescription = description ?? habit?.description ?? "";
  const currentTargetDays = targetDays ?? habit?.targetDays ?? [];

  const onToggleDay = (day: string) => {
    const base = targetDays ?? habit?.targetDays ?? [];
    const next = base.includes(day)
      ? base.filter((item) => item !== day)
      : [...base, day];
    setTargetDays(next);
  };

  const persistAndGoBack = async () => {
    if (!habit || saving) return;
    if (currentName.trim().length === 0) {
      Alert.alert("Name required", "Habit name cannot be empty.");
      return;
    }
    if (currentTargetDays.length === 0) {
      Alert.alert("Days required", "Select at least one day.");
      return;
    }
    setSaving(true);
    try {
      const trimmedName = currentName.trim();
      const normalizedDescription = currentDescription.trim();
      const originalTargetDays = habit.targetDays ?? [];
      const daysChanged =
        currentTargetDays.length !== originalTargetDays.length ||
        currentTargetDays.some((day) => !originalTargetDays.includes(day));

      if (
        trimmedName !== habit.name ||
        normalizedDescription !== (habit.description ?? "") ||
        daysChanged
      ) {
        await updateHabit({
          habitId: habit._id as never,
          name: trimmedName,
          description:
            normalizedDescription.length > 0 ? normalizedDescription : null,
          targetDays: currentTargetDays,
        });
      }
      router.back();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update habit";
      Alert.alert("Could not save changes", message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!habit || saving) return;
    setSaving(true);
    try {
      await deleteHabit({ habitId: habit._id as never });
      setMenuOpen(false);
      router.replace("/(authenticated)/(tabs)/system");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to delete habit";
      Alert.alert("Could not delete habit", message);
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
            disabled={!habit || saving}
            style={{ padding: 6, opacity: !habit || saving ? 0.5 : 1 }}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </Pressable>
          <View />
          <Pressable
            onPress={() => setMenuOpen(true)}
            disabled={!habit}
            style={{ padding: 6, opacity: !habit ? 0.5 : 1 }}
          >
            <Ionicons name="ellipsis-horizontal" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 20, gap: 18 }}>
        <TextInput
          value={currentName}
          onChangeText={setName}
          placeholder="Habit name"
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
          onPress={() => setDaysModalOpen(true)}
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
            Days
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text type="text-regular" color="#E5E7EB">
              {currentTargetDays.length === 0
                ? "Select days"
                : currentTargetDays.join(", ")}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#6B7280" />
          </View>
        </Pressable>

        <TextInput
          value={currentDescription}
          onChangeText={setDescription}
          placeholder="Write a description of the habit here..."
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

      <Modal visible={daysModalOpen} transparent animationType="fade">
        <Pressable
          onPress={() => setDaysModalOpen(false)}
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
            {WEEK_DAYS.map((day, index) => {
              const selected = currentTargetDays.includes(day);
              return (
                <Pressable
                  key={day}
                  onPress={() => onToggleDay(day)}
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderTopWidth: index === 0 ? 0 : 1,
                    borderTopColor: "#1F2937",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text type="text-regular">{day}</Text>
                  {selected ? (
                    <Ionicons name="checkmark" size={18} color="#E5E7EB" />
                  ) : null}
                </Pressable>
              );
            })}
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
                Delete Habit
              </Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </KeyboardAvoidingView>
  );
}
