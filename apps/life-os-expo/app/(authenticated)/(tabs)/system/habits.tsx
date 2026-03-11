import Text from "@/components/ui/Text";
import { api } from "@transcend/convex";
import { useMutation, useQuery } from "convex/react";
import type { FunctionArgs } from "convex/server";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, View, useWindowDimensions } from "react-native";
import Sortable from "react-native-sortables";
import { getHomeBootstrapRange } from "@/utils/homeBootstrapRange";

type HabitId = FunctionArgs<
  typeof api.habits.reorderHabits.reorderHabits
>["habitIds"][number];

type HabitRow = {
  _id: HabitId;
  name: string;
  habitType: "scheduled" | "anytime";
  targetDays?: string[];
  targetCompletions?: number;
};

export default function SystemHabitsScreen() {
  const router = useRouter();
  const { width: screenWidth } = useWindowDimensions();
  const reorderHabits = useMutation(api.habits.reorderHabits.reorderHabits);
  const { rangeStartDateKey, rangeEndDateKey } = getHomeBootstrapRange();
  const homeBootstrap = useQuery(api.home.bootstrap.bootstrap, {
    rangeStartDateKey,
    rangeEndDateKey,
  });
  const habits = homeBootstrap?.habits ?? [];
  const rowWidth = Math.max(screenWidth - 32, 0);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        <Pressable
          onPress={() =>
            router.push("/(authenticated)/habit/add-habit" as never)
          }
          style={{
            backgroundColor: "#18181B",
            borderRadius: 10,
            minHeight: 56,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <Ionicons name="add-circle-outline" size={20} color="#F3F4F6" />
          <Text type="text-semibold" color="#F3F4F6">
            Add Habit
          </Text>
        </Pressable>

        <View style={{ marginTop: 18, gap: 18 }}>
          {habits.length === 0 ? (
            <Text type="text-detail" color="#6B7280">
              No habits yet.
            </Text>
          ) : (
            <View style={{ width: "100%", alignSelf: "stretch" }}>
              <Sortable.Flex
                flexDirection="column"
                flexWrap="nowrap"
                gap={18}
                dragActivationDelay={220}
                onDragEnd={({ order }) => {
                  const nextHabits = order(habits as HabitRow[]);

                  void reorderHabits({
                    habitIds: nextHabits.map((habit) => habit._id),
                  });
                }}
              >
                {(habits as HabitRow[]).map((habit) => (
                  <Pressable
                    key={habit._id}
                    onPress={() =>
                      router.push({
                        pathname: "/(authenticated)/habit/[habitId]" as never,
                        params: {
                          habitId: habit._id,
                          initialHabit: JSON.stringify(habit),
                        },
                      })
                    }
                    style={{
                      flexDirection: "row",
                      direction: "ltr",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: rowWidth,
                      alignSelf: "stretch",
                    }}
                  >
                    <Text
                      type="text-regular"
                      color="#E5E7EB"
                      style={{ flex: 1, minWidth: 0 }}
                    >
                      {habit.name}
                    </Text>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <Text
                        type="text-detail"
                        color="#9CA3AF"
                        style={{ textAlign: "right" }}
                      >
                        {habit.habitType === "scheduled"
                          ? `${habit.targetDays?.length ?? 0} days/week`
                          : `${habit.targetCompletions ?? 1}/day`}
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color="#6B7280"
                      />
                    </View>
                  </Pressable>
                ))}
              </Sortable.Flex>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
