import { useState } from "react";
import { api } from "@transcend/convex";
import { useMutation } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

export default function AddHabitScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const createHabit = useMutation(api.habits.createHabit.createHabit);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [targetDays, setTargetDays] = useState<string[]>([]);
  const [daysModalOpen, setDaysModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    name.trim().length > 0 && targetDays.length > 0 && !submitting;

  const onToggleDay = (day: string) => {
    setTargetDays((prev) =>
      prev.includes(day) ? prev.filter((item) => item !== day) : [...prev, day],
    );
  };

  const onCreate = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      await createHabit({
        name: name.trim(),
        description: description.trim() || undefined,
        habitType: "scheduled",
        targetDays,
      });
      router.back();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to create habit";
      Alert.alert("Could not create habit", message);
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
          <Text type="heading-4">Add Habit</Text>
          <Pressable onPress={() => router.back()} style={{ padding: 6 }}>
            <Ionicons name="close" size={22} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 20, gap: 18 }}>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Habit name"
          placeholderTextColor="#6B7280"
          autoFocus
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
              {targetDays.length === 0 ? "Select days" : targetDays.join(", ")}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#6B7280" />
          </View>
        </Pressable>

        <TextInput
          value={description}
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
            {submitting ? "Creating..." : "Create Habit"}
          </Text>
        </Pressable>
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
              const selected = targetDays.includes(day);
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
    </KeyboardAvoidingView>
  );
}
