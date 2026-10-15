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
import {
  DescriptionTextInput,
  KeyboardAwareFormScroll,
} from "@/components/ui/KeyboardAwareFormScroll";
import Text from "@/components/ui/Text";
import { appFonts } from "@/constants/fonts";
import { getHomeBootstrapRange } from "@/utils/homeBootstrapRange";

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const DAY_ABBREVIATIONS: Record<(typeof WEEK_DAYS)[number], string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

function formatTargetDays(days: string[]) {
  if (days.length === 0) return "Select days";
  const ordered = WEEK_DAYS.filter((day) => days.includes(day));
  if (ordered.length === WEEK_DAYS.length) return "Every day";
  return ordered.map((day) => DAY_ABBREVIATIONS[day]).join(", ");
}
type InitialHabit = {
  _id: string;
  name: string;
  description?: string;
  targetDays?: string[];
};

export default function HabitDetailScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const bootstrapRange = useMemo(() => getHomeBootstrapRange(), []);
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
  const deleteHabit = useMutation(
    api.habits.deleteHabit.deleteHabit,
  ).withOptimisticUpdate((localStore, args) => {
    const bootstrap = localStore.getQuery(
      api.home.bootstrap.bootstrap,
      bootstrapRange,
    );
    if (bootstrap !== undefined && bootstrap.profile) {
      localStore.setQuery(api.home.bootstrap.bootstrap, bootstrapRange, {
        ...bootstrap,
        habits: bootstrap.habits.filter((item) => item._id !== args.habitId),
        habitCompletions: bootstrap.habitCompletions.filter(
          (item) => item.habitId !== args.habitId,
        ),
      });
    }

    const habitsForUser = localStore.getQuery(
      api.habits.listHabitsForCurrentUser.listHabitsForCurrentUser,
      {},
    );
    if (habitsForUser !== undefined) {
      localStore.setQuery(
        api.habits.listHabitsForCurrentUser.listHabitsForCurrentUser,
        {},
        habitsForUser.filter((item) => item._id !== args.habitId),
      );
    }
  });

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
    router.back();
    void (async () => {
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
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to update habit";
        Alert.alert("Could not save changes", message);
      }
    })();
  };

  const onDelete = async () => {
    if (!habit || saving) return;
    setSaving(true);
    setMenuOpen(false);
    router.back();
    void (async () => {
      try {
        await deleteHabit({ habitId: habit._id as never });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to delete habit";
        Alert.alert("Could not delete habit", message);
      }
    })();
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

      <KeyboardAwareFormScroll
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 20,
          paddingBottom: Math.max(insets.bottom, 16) + 80,
          flexGrow: 1,
        }}
      >
        <TextInput
          value={currentName}
          onChangeText={setName}
          placeholder="Habit name"
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

        <Pressable
          onPress={() => setDaysModalOpen(true)}
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
            paddingVertical: 4,
          }}
        >
          <Text type="text-regular" color="#9CA3AF" style={{ flexShrink: 0 }}>
            Days
          </Text>
          <View
            style={{
              flex: 1,
              minWidth: 0,
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "flex-end",
              gap: 6,
            }}
          >
            <Text
              type="text-regular"
              color="#E5E7EB"
              numberOfLines={1}
              style={{ flexShrink: 1, textAlign: "right" }}
            >
              {formatTargetDays(currentTargetDays)}
            </Text>
            <Ionicons name="chevron-forward" size={18} color="#6B7280" />
          </View>
        </Pressable>

        <DescriptionTextInput
          value={currentDescription}
          onChangeText={setDescription}
          placeholder="Write a description of the habit here..."
          placeholderTextColor="#6B7280"
          style={{
            color: "#E5E7EB",
            fontFamily: appFonts.regular,
            fontSize: 16,
            lineHeight: 24,
          }}
        />
      </KeyboardAwareFormScroll>

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
