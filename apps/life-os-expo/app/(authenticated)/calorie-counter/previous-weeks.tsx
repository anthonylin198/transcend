import { useMemo } from "react";
import { api } from "@transcend/convex";
import { useQuery } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/ui/Text";
import { useLocalToday } from "@/hooks/useLocalToday";
import {
  addDays,
  formatCalories,
  formatProtein,
  formatWeekRange,
  getSundayWeek,
  groupLogsByWeek,
  parseLocalDateKey,
  toLocalDateKey,
} from "@/utils/calorieWeek";

const HISTORY_START = "1970-01-01";

export default function PreviousWeeksScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const today = useLocalToday();
  const currentWeek = getSundayWeek(today);
  const endDate = toLocalDateKey(addDays(currentWeek.start, -1));
  const queryRange = useMemo(
    () => ({ startDate: HISTORY_START, endDate }),
    [endDate],
  );
  const logs = useQuery(
    api.calorieLogs.listCalorieLogs.listCalorieLogs,
    queryRange,
  );
  const weeks = logs ? groupLogsByWeek(logs) : [];

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 28,
          alignItems: "center",
        }}
      >
        <View style={{ width: "100%", maxWidth: 640 }}>
          <View
            style={{
              minHeight: 56,
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back"
              onPress={() => router.back()}
              hitSlop={8}
              style={{ padding: 6, marginLeft: -6 }}
            >
              <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
            </Pressable>
            <Text type="heading-4" accessibilityRole="header">
              Previous weeks
            </Text>
          </View>

          {logs === undefined ? (
            <Text type="text-detail" color="#9CA3AF" style={{ marginTop: 8 }}>
              Loading...
            </Text>
          ) : weeks.length === 0 ? (
            <Text type="text-detail" color="#6B7280" style={{ marginTop: 8 }}>
              No previous weeks
            </Text>
          ) : (
            <View style={{ marginTop: 8 }}>
              {weeks.map((week) => {
                const rangeLabel = formatWeekRange(
                  parseLocalDateKey(week.startKey),
                  parseLocalDateKey(week.endKey),
                );
                return (
                  <Pressable
                    key={week.startKey}
                    accessibilityRole="button"
                    accessibilityLabel={`${rangeLabel}, ${formatCalories(week.average.calories)} calories, ${formatProtein(week.average.proteinG)} grams protein`}
                    onPress={() =>
                      router.push({
                        pathname: "/(authenticated)/calorie-counter/[weekStart]",
                        params: { weekStart: week.startKey },
                      })
                    }
                    style={({ pressed }) => ({
                      minHeight: 64,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      borderTopWidth: 1,
                      borderTopColor: "#1F2937",
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <View style={{ flex: 1 }}>
                      <Text type="text-semibold">{rangeLabel}</Text>
                      <Text type="text-detail" color="#9CA3AF">
                        {formatCalories(week.average.calories)} cal ·{" "}
                        {formatProtein(week.average.proteinG)}g protein
                      </Text>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
