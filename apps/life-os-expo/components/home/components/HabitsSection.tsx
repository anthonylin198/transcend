import { useMemo, useState } from "react";
import { api } from "@transcend/convex";
import { useMutation } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { Pressable, View } from "react-native";
import Text from "@/components/ui/Text";
import { getHabitWeekdayName, toHabitDateKey } from "@/utils/habitDate";

type HomeHabit = {
  _id: string;
  name: string;
  description?: string;
  habitType: "scheduled" | "anytime";
  targetDays?: string[];
  targetCompletions?: number;
  orderIndex: number;
};

type HomeHabitCompletion = {
  habitId: string;
  dateKey: string;
};

type HabitsSectionProps = {
  habits: HomeHabit[];
  habitCompletions: HomeHabitCompletion[];
  selectedDate: Date;
};

export default function HabitsSection({
  habits,
  habitCompletions,
  selectedDate,
}: HabitsSectionProps) {
  const router = useRouter();
  const setHabitCompletion = useMutation(
    api.habits.setHabitCompletion.setHabitCompletion,
  );
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const dateKey = useMemo(() => toHabitDateKey(selectedDate), [selectedDate]);
  const weekdayName = useMemo(
    () => getHabitWeekdayName(selectedDate),
    [selectedDate],
  );

  const completionSet = useMemo(() => {
    const completedHabitIds = new Set<string>();
    for (const completion of habitCompletions) {
      if (completion.dateKey === dateKey) {
        completedHabitIds.add(completion.habitId);
      }
    }
    return completedHabitIds;
  }, [dateKey, habitCompletions]);

  const visibleHabits = useMemo(() => {
    return habits
      .filter((habit) => {
        if (habit.habitType === "anytime") return true;
        return (habit.targetDays ?? []).includes(weekdayName);
      })
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [habits, weekdayName]);

  const onToggleHabit = async (habitId: string) => {
    if (updatingIds.has(habitId)) return;
    const currentlyCompleted = completionSet.has(habitId);

    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setUpdatingIds((prev) => new Set(prev).add(habitId));
    try {
      await setHabitCompletion({
        habitId: habitId as never,
        dateKey,
        completed: !currentlyCompleted,
      });
    } finally {
      setUpdatingIds((prev) => {
        const next = new Set(prev);
        next.delete(habitId);
        return next;
      });
    }
  };

  return (
    <View style={{ gap: 14 }}>
      <Text type="heading-4" color="#9CA3AF">
        Habits
      </Text>
      {visibleHabits.length === 0 ? (
        <Text type="text-regular" color="#9CA3AF">
          No habits for this day
        </Text>
      ) : (
        <View style={{ gap: 14 }}>
          {visibleHabits.map((habit) => {
            const isCompleted = completionSet.has(habit._id);
            const isUpdating = updatingIds.has(habit._id);
            return (
              <View
                key={habit._id}
                style={{ flexDirection: "row", alignItems: "center", gap: 10 }}
              >
                <Pressable
                  onPress={() => void onToggleHabit(habit._id)}
                  disabled={isUpdating}
                  style={{ opacity: isUpdating ? 0.75 : 1 }}
                >
                  <Ionicons
                    name={isCompleted ? "checkmark-circle" : "ellipse-outline"}
                    size={22}
                    color={isCompleted ? "#E5E7EB" : "#9CA3AF"}
                  />
                </Pressable>
                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: "/(authenticated)/habit/[habitId]" as never,
                      params: {
                        habitId: habit._id,
                        initialHabit: JSON.stringify(habit),
                      },
                    })
                  }
                  style={{ flex: 1 }}
                >
                  <Text
                    type="text-regular"
                    color="#E5E7EB"
                    style={
                      isCompleted
                        ? { flex: 1, textDecorationLine: "line-through" }
                        : { flex: 1 }
                    }
                  >
                    {habit.name}
                  </Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
