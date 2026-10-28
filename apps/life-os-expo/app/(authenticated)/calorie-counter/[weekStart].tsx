import { useMemo, useState } from "react";
import { api } from "@transcend/convex";
import { useQuery } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CalorieLogList from "@/components/calories/CalorieLogList";
import LogWeightModal from "@/components/calories/LogWeightModal";
import { LogOverlayHost } from "@/components/calories/LogOverlayHost";
import WeekAverageValue from "@/components/calories/WeekAverageValue";
import ShareWeekModal, {
  type ShareWeek,
} from "@/components/feed/ShareWeekModal";
import Text from "@/components/ui/Text";
import WorkoutLogList from "@/components/workouts/WorkoutLogList";
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
import {
  formatWeight,
  formatWeightComparison,
  priorWeight,
} from "@/utils/weight";

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
  const [shareOpen, setShareOpen] = useState(false);
  const [weightOpen, setWeightOpen] = useState(false);
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
  const workouts = useQuery(
    api.workoutLogs.listWorkoutLogs.listWorkoutLogs,
    queryRange ?? "skip",
  );
  const weightData = useQuery(api.weightLogs.listWeightLogs.listWeightLogs);
  const currentWeight =
    weightData?.weights.find((weight) => weight.weekStart === weekStartKey) ??
    null;
  const prior =
    weekStartKey && weightData
      ? priorWeight(weightData.weights, weekStartKey)
      : null;
  const comparison =
    currentWeight && prior && weekStartKey
      ? formatWeightComparison(currentWeight.pounds, prior, weekStartKey)
      : null;

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
  const canShare = Boolean(
    queryRange && logs && average && weightData && weekStartKey,
  );
  const shareWeek: ShareWeek | null =
    shareOpen && canShare && queryRange && average && weightData && weekStartKey
      ? {
          name: weightData.displayName?.trim() || "You",
          startKey: weekStartKey,
          endKey: queryRange.endDate,
          average: average.pending
            ? null
            : { calories: average.calories, proteinG: average.proteinG },
          weightPounds: currentWeight?.pounds ?? null,
          weightComparison: comparison,
        }
      : null;
  const dayKeys = weekStartKey ? eachDateKeyOfWeek(weekStartKey) : [];

  return (
    <LogOverlayHost>
      <View style={{ flex: 1, backgroundColor: "black" }}>
        <ScrollView
          showsVerticalScrollIndicator={false}
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
              <Text
                type="heading-4"
                accessibilityRole="header"
                style={{ flex: 1 }}
              >
                {weekStart && weekEnd
                  ? formatWeekRange(weekStart, weekEnd)
                  : "Week"}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Share week"
                disabled={!canShare}
                hitSlop={10}
                onPress={() => setShareOpen(true)}
                style={({ pressed }) => ({
                  width: 36,
                  height: 36,
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: !canShare ? 0.35 : pressed ? 0.55 : 1,
                })}
              >
                <Ionicons name="share-outline" size={22} color="#9CA3AF" />
              </Pressable>
            </View>

            {!queryRange ? (
              <Text
                type="text-detail"
                color="#9CA3AF"
                style={{ marginTop: 12 }}
              >
                That week could not be opened.
              </Text>
            ) : logs === undefined || weightData === undefined || !average ? (
              <Text
                type="text-detail"
                color="#9CA3AF"
                style={{ marginTop: 12 }}
              >
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

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    currentWeight
                      ? comparison
                        ? `Weight ${formatWeight(currentWeight.pounds)}, ${comparison}`
                        : `Weight ${formatWeight(currentWeight.pounds)}`
                      : "Add weight"
                  }
                  onPress={() => setWeightOpen(true)}
                  style={({ pressed }) => ({
                    minHeight: 44,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 12,
                    opacity: pressed ? 0.7 : 1,
                  })}
                >
                  <Text type="text-semibold">Weight</Text>
                  <View
                    style={{
                      flex: 1,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      gap: 8,
                    }}
                  >
                    <View style={{ alignItems: "flex-end", flexShrink: 1 }}>
                      <Text
                        type="text-semibold"
                        color={currentWeight ? "#FFFFFF" : "#9CA3AF"}
                      >
                        {currentWeight
                          ? formatWeight(currentWeight.pounds)
                          : "Add"}
                      </Text>
                      {comparison ? (
                        <Text
                          type="text-detail"
                          color="#9CA3AF"
                          style={{ textAlign: "right" }}
                        >
                          {comparison}
                        </Text>
                      ) : null}
                    </View>
                    <Ionicons
                      name="chevron-forward"
                      size={18}
                      color="#9CA3AF"
                    />
                  </View>
                </Pressable>

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
                          {formatCalories(calories)} cal ·{" "}
                          {formatProtein(protein)}g
                        </Text>
                      </View>
                    );
                  })}
                </View>

                <View style={{ gap: 8 }}>
                  <Text type="text-semibold">Logs</Text>
                  <CalorieLogList logs={logs} todayKey={todayKey} />
                </View>

                <View style={{ gap: 8 }}>
                  <Text type="text-semibold">Workouts</Text>
                  {workouts === undefined ? (
                    <Text type="text-detail" color="#9CA3AF">
                      Loading...
                    </Text>
                  ) : (
                    <WorkoutLogList logs={workouts} todayKey={todayKey} />
                  )}
                </View>
              </View>
            )}
          </View>
        </ScrollView>
        {weekStartKey && weekStart && weekEnd ? (
          <LogWeightModal
            visible={weightOpen}
            weekStart={weekStartKey}
            weekLabel={formatWeekRange(weekStart, weekEnd)}
            pounds={currentWeight?.pounds ?? null}
            onClose={() => setWeightOpen(false)}
          />
        ) : null}
        <ShareWeekModal week={shareWeek} onClose={() => setShareOpen(false)} />
      </View>
    </LogOverlayHost>
  );
}
