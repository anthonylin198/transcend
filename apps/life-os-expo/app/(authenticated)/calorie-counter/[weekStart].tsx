import { useMemo } from "react";
import { api } from "@transcend/convex";
import { useQuery } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CalorieLogList from "@/components/calories/CalorieLogList";
import WeekAverageValue from "@/components/calories/WeekAverageValue";
import Text from "@/components/ui/Text";
import { useLocalToday } from "@/hooks/useLocalToday";
import {
  addDays,
  averageLoggedDays,
  eachDateKeyOfWeek,
  formatCalories,
  formatProtein,
  formatShortDate,
  formatWeekRange,
  getSundayWeek,
  parseLocalDateKey,
  toLocalDateKey,
} from "@/utils/calorieWeek";

function readWeekStart(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return null;
  try {
    return getSundayWeek(parseLocalDateKey(raw)).startKey;
  } catch {
    return null;
  }
}

export default function CalorieWeekScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ weekStart?: string | string[] }>();
  const weekStartKey = readWeekStart(params.weekStart);
  const today = useLocalToday();
  const todayKey = toLocalDateKey(today);
  const queryRange = useMemo(() => {
    if (!weekStartKey) return null;
    return {
      startDate: weekStartKey,
      endDate: toLocalDateKey(addDays(parseLocalDateKey(weekStartKey), 6)),
    };
  }, [weekStartKey]);
  const logs = useQuery(
    api.calorieLogs.listCalorieLogs.listCalorieLogs,
    queryRange ?? "skip",
  );

  const weekStart = weekStartKey ? parseLocalDateKey(weekStartKey) : null;
  const weekEnd = weekStart ? addDays(weekStart, 6) : null;
  const average =
    logs && queryRange
      ? averageLoggedDays(
          logs,
          queryRange.startDate,
          queryRange.endDate,
          todayKey,
        )
      : null;
  const dayKeys = weekStartKey ? eachDateKeyOfWeek(weekStartKey) : [];

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
            <Text type="heading-4" accessibilityRole="header" style={{ flex: 1 }}>
              {weekStart && weekEnd ? formatWeekRange(weekStart, weekEnd) : "Week"}
            </Text>
          </View>

          {!queryRange ? (
            <Text type="text-detail" color="#9CA3AF" style={{ marginTop: 12 }}>
              That week could not be opened.
            </Text>
          ) : logs === undefined || !average ? (
            <Text type="text-detail" color="#9CA3AF" style={{ marginTop: 12 }}>
              Loading...
            </Text>
          ) : (
            <View style={{ marginTop: 8, gap: 28 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  gap: 12,
                }}
              >
                <Text type="text-semibold" style={{ flex: 1 }}>
                  Weekly average
                </Text>
                <WeekAverageValue
                  calories={average.calories}
                  proteinG={average.proteinG}
                  pending={average.pending}
                />
              </View>

              <View style={{ gap: 10 }}>
                <Text type="text-semibold">Daily totals</Text>
                {dayKeys.map((dateKey) => {
                  const dayLogs = logs.filter((log) => log.date === dateKey);
                  const calories = dayLogs.reduce(
                    (sum, log) => sum + log.calories,
                    0,
                  );
                  const protein = dayLogs.reduce(
                    (sum, log) => sum + log.proteinG,
                    0,
                  );
                  return (
                    <View
                      key={dateKey}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        minHeight: 32,
                      }}
                    >
                      <Text type="text-regular" color="#E5E7EB">
                        {formatShortDate(parseLocalDateKey(dateKey))}
                      </Text>
                      <Text type="text-regular" color="#9CA3AF">
                        {formatCalories(calories)} cal · {formatProtein(protein)}g
                      </Text>
                    </View>
                  );
                })}
              </View>

              <View style={{ gap: 8 }}>
                <Text type="text-semibold">Logs</Text>
                <CalorieLogList logs={logs} todayKey={todayKey} />
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
