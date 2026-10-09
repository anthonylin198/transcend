import { useMemo, useState } from "react";
import { api } from "@transcend/convex";
import { useQuery } from "convex/react";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CalorieLogList from "@/components/calories/CalorieLogList";
import LogCaloriesModal from "@/components/calories/LogCaloriesModal";
import WeekAverageValue from "@/components/calories/WeekAverageValue";
import Text from "@/components/ui/Text";
import { useLocalToday } from "@/hooks/useLocalToday";
import { getHomeBootstrapRange } from "@/utils/homeBootstrapRange";
import {
  addDays,
  averageLoggedDays,
  formatCalories,
  formatLongDate,
  formatProtein,
  formatWeekRange,
  getSundayWeek,
  toLocalDateKey,
} from "@/utils/calorieWeek";

export default function CalorieCounterScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [logOpen, setLogOpen] = useState(false);
  const today = useLocalToday();
  const todayKey = toLocalDateKey(today);
  const week = getSundayWeek(today);
  const bootstrapRange = useMemo(() => getHomeBootstrapRange(today), [today]);
  const homeBootstrap = useQuery(api.home.bootstrap.bootstrap, bootstrapRange);
  const loading = homeBootstrap === undefined;
  const weekLogs = useMemo(
    () =>
      (homeBootstrap?.calorieLogs ?? []).filter(
        (log) => log.date >= week.startKey && log.date <= week.endKey,
      ),
    [homeBootstrap?.calorieLogs, week.endKey, week.startKey],
  );
  const todayLogs = weekLogs.filter((log) => log.date === todayKey);
  const todayCalories = todayLogs.reduce((sum, log) => sum + log.calories, 0);
  const todayProtein = todayLogs.reduce((sum, log) => sum + log.proteinG, 0);
  const throughYesterday = toLocalDateKey(addDays(today, -1));
  const weekAverage = loading
    ? null
    : averageLoggedDays(weekLogs, week.startKey, throughYesterday, todayKey);

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          width: "100%",
          maxWidth: 640,
          alignSelf: "center",
          paddingTop: insets.top + 8,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 36,
        }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Back"
          onPress={() => router.back()}
          hitSlop={8}
          style={{
            alignSelf: "flex-start",
            padding: 6,
            marginLeft: -6,
          }}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </Pressable>

        <View
          style={{
            marginTop: 8,
            flexDirection: "row",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Text
            type="heading-4"
            accessibilityRole="header"
            style={{ flexShrink: 1 }}
          >
            Calorie Counter
          </Text>
          <Text type="text-detail" color="#9CA3AF" style={{ marginTop: 4 }}>
            {formatLongDate(today)}
          </Text>
        </View>

        <Text
          type="text-detail"
          color="#9CA3AF"
          style={{ marginTop: 28, letterSpacing: 1.1 }}
        >
          TODAY
        </Text>
        <View style={{ flexDirection: "row", marginTop: 8 }}>
          <View style={{ width: "46%" }}>
            <Text type="heading-2">
              {loading ? "—" : formatCalories(todayCalories)}
            </Text>
            <Text type="text-detail" color="#9CA3AF">
              Calories
            </Text>
          </View>
          <View style={{ width: "46%", alignItems: "center" }}>
            <Text type="heading-2">
              {loading ? "—" : `${formatProtein(todayProtein)}g`}
            </Text>
            <Text type="text-detail" color="#9CA3AF">
              Protein
            </Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Log calories"
          onPress={() => setLogOpen(true)}
          style={({ pressed }) => ({
            marginTop: 24,
            minHeight: 52,
            borderRadius: 10,
            backgroundColor: "#18181B",
            alignItems: "center",
            justifyContent: "center",
            opacity: pressed ? 0.72 : 1,
          })}
        >
          <Text type="text-semibold" color="#F3F4F6">
            + Log calories
          </Text>
        </Pressable>

        {weekAverage ? (
          <View
            style={{
              marginTop: 32,
              flexDirection: "row",
              alignItems: "flex-start",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <View style={{ flex: 1 }}>
              <Text type="text-semibold">This week&apos;s average</Text>
              <Text type="text-detail" color="#9CA3AF">
                {formatWeekRange(week.start, week.end)}
              </Text>
            </View>
            <WeekAverageValue
              calories={weekAverage.calories}
              proteinG={weekAverage.proteinG}
              pending={weekAverage.pending}
            />
          </View>
        ) : null}

        <View
          style={{
            marginTop: 32,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <Text type="text-semibold">Recent logs</Text>
          <Text type="text-detail" color="#9CA3AF">
            This week
          </Text>
        </View>
        {loading ? (
          <Text type="text-detail" color="#9CA3AF">
            Loading...
          </Text>
        ) : (
          <CalorieLogList logs={weekLogs} todayKey={todayKey} />
        )}

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Previous weeks"
          onPress={() =>
            router.push("/(authenticated)/calorie-counter/previous-weeks")
          }
          style={({ pressed }) => ({
            marginTop: 28,
            minHeight: 52,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            borderTopWidth: 1,
            borderTopColor: "#1F2937",
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Text type="text-medium" color="#9CA3AF">
            Previous weeks
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </Pressable>
      </ScrollView>

      <LogCaloriesModal visible={logOpen} onClose={() => setLogOpen(false)} />
    </View>
  );
}
