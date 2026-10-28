import { useMemo, useState } from "react";
import { api } from "@transcend/convex";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import PagerView from "react-native-pager-view";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CalorieLogList from "@/components/calories/CalorieLogList";
import LogCaloriesModal from "@/components/calories/LogCaloriesModal";
import { LogOverlayHost } from "@/components/calories/LogOverlayHost";
import WeekAverageValue from "@/components/calories/WeekAverageValue";
import Eyebrow from "@/components/ui/Eyebrow";
import Text from "@/components/ui/Text";
import { appFonts } from "@/constants/fonts";
import LogWorkoutModal from "@/components/workouts/LogWorkoutModal";
import WorkoutLogList from "@/components/workouts/WorkoutLogList";
import { useLocalToday } from "@/hooks/useLocalToday";
import { getHomeBootstrapRange } from "@/utils/homeBootstrapRange";
import {
  addDays,
  averageLoggedDays,
  formatCalories,
  formatProtein,
  formatWeekRange,
  getFitnessLogDays,
  getSundayWeek,
  toLocalDateKey,
} from "@/utils/calorieWeek";

type HomeBootstrap = FunctionReturnType<typeof api.home.bootstrap.bootstrap>;

function dayTitle(day: Date, today: Date) {
  const dayKey = toLocalDateKey(day);
  if (dayKey === toLocalDateKey(today)) return "Today";
  if (dayKey === toLocalDateKey(addDays(today, -1))) return "Yesterday";
  return new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(day);
}

function dayDateLabel(day: Date) {
  return [
    new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(day),
    new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
    }).format(day),
  ]
    .join(" · ")
    .toUpperCase();
}

function FitnessDayPage({
  day,
  today,
  loading,
  calorieLogs,
  workoutLogs,
  weekAverage,
  weekLabel,
  weekStartKey,
  topInset,
}: {
  day: Date;
  today: Date;
  loading: boolean;
  calorieLogs: HomeBootstrap["calorieLogs"];
  workoutLogs: HomeBootstrap["workoutLogs"];
  weekAverage: { calories: number; proteinG: number; pending: boolean } | null;
  weekLabel: string;
  weekStartKey: string;
  topInset: number;
}) {
  const router = useRouter();
  const [logOpen, setLogOpen] = useState(false);
  const [workoutOpen, setWorkoutOpen] = useState(false);
  const dayKey = toLocalDateKey(day);
  const title = dayTitle(day, today);
  const dayLogs = calorieLogs.filter((log) => log.date === dayKey);
  const dayWorkouts = workoutLogs.filter((log) => log.date === dayKey);
  const dayCalories = dayLogs.reduce((sum, log) => sum + log.calories, 0);
  const dayProtein = dayLogs.reduce((sum, log) => sum + log.proteinG, 0);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "transparent" }}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        width: "100%",
        maxWidth: 640,
        alignSelf: "center",
        paddingTop: topInset + 28,
        paddingHorizontal: 24,
        paddingBottom: 36,
      }}
    >
      <View style={{ gap: 10 }}>
        <Eyebrow color="#737373">{dayDateLabel(day)}</Eyebrow>
        <Text
          accessibilityRole="header"
          style={{
            fontFamily: appFonts.semiBold,
            fontSize: 36,
            lineHeight: 42,
            letterSpacing: -1.2,
          }}
        >
          {title}
        </Text>
      </View>

      <View style={{ flexDirection: "row", marginTop: 32 }}>
        <View style={{ width: "46%" }}>
          <Text type="heading-2">
            {loading ? "—" : formatCalories(dayCalories)}
          </Text>
          <Text type="text-detail" color="#9CA3AF">
            Calories
          </Text>
        </View>
        <View style={{ width: "46%", alignItems: "center" }}>
          <Text type="heading-2">
            {loading ? "—" : `${formatProtein(dayProtein)}g`}
          </Text>
          <Text type="text-detail" color="#9CA3AF">
            Protein
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Log calories for ${title}`}
        onPress={() => setLogOpen(true)}
        style={({ pressed }) => ({
          marginTop: 24,
          minHeight: 52,
          borderRadius: 10,
          backgroundColor: "#FFFFFF",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          opacity: pressed ? 0.72 : 1,
        })}
      >
        <Ionicons name="add" size={20} color="#000000" />
        <Text type="text-semibold" color="#000000">
          Log calories
        </Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Log workout for ${title}`}
        onPress={() => setWorkoutOpen(true)}
        style={({ pressed }) => ({
          marginTop: 10,
          minHeight: 52,
          borderRadius: 10,
          borderWidth: 1,
          borderColor: "#374151",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          opacity: pressed ? 0.72 : 1,
        })}
      >
        <Ionicons name="barbell-outline" size={20} color="#FFFFFF" />
        <Text type="text-semibold">Log workout</Text>
      </Pressable>

      {weekAverage ? (
        <Pressable
          accessibilityRole="button"
          accessibilityHint="Opens this week's logs"
          onPress={() =>
            router.push({
              pathname: "/(authenticated)/calorie-counter/[weekStart]",
              params: { weekStart: weekStartKey },
            })
          }
          style={({ pressed }) => ({
            marginTop: 32,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <View style={{ flex: 1 }}>
            <Text type="text-semibold">This week&apos;s average</Text>
            <Text type="text-detail" color="#9CA3AF">
              {weekLabel}
            </Text>
          </View>
          <WeekAverageValue
            calories={weekAverage.calories}
            proteinG={weekAverage.proteinG}
            pending={weekAverage.pending}
          />
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </Pressable>
      ) : null}

      <Text type="text-semibold" style={{ marginTop: 32 }}>
        {title}&apos;s logs
      </Text>

      <Text
        type="text-detail"
        color="#9CA3AF"
        style={{ marginTop: 16, marginBottom: 4 }}
      >
        Calories
      </Text>
      {loading ? (
        <Text type="text-detail" color="#9CA3AF">
          Loading...
        </Text>
      ) : (
        <CalorieLogList
          logs={dayLogs}
          todayKey={toLocalDateKey(today)}
          showDateHeadings={false}
          emptyText="Nothing logged yet"
        />
      )}

      <Text
        type="text-detail"
        color="#9CA3AF"
        style={{ marginTop: 20, marginBottom: 4 }}
      >
        Workouts
      </Text>
      {loading ? (
        <Text type="text-detail" color="#9CA3AF">
          Loading...
        </Text>
      ) : (
        <WorkoutLogList
          logs={dayWorkouts}
          todayKey={toLocalDateKey(today)}
          showDateHeadings={false}
          emptyText="Nothing logged yet"
        />
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

      <LogCaloriesModal
        visible={logOpen}
        date={dayKey}
        onClose={() => setLogOpen(false)}
      />
      <LogWorkoutModal
        visible={workoutOpen}
        date={dayKey}
        onClose={() => setWorkoutOpen(false)}
      />
    </ScrollView>
  );
}

export default function CalorieCounterScreen() {
  const insets = useSafeAreaInsets();
  const today = useLocalToday();
  const todayKey = toLocalDateKey(today);
  const days = useMemo(() => getFitnessLogDays(today), [today]);
  const initialPage = Math.max(
    0,
    days.findIndex((day) => toLocalDateKey(day) === todayKey),
  );
  const week = getSundayWeek(today);
  const bootstrapRange = useMemo(() => getHomeBootstrapRange(today), [today]);
  const homeBootstrap = useQuery(api.home.bootstrap.bootstrap, bootstrapRange);
  const loading = homeBootstrap === undefined || homeBootstrap.profile === null;
  const calorieLogs = useMemo(
    () => homeBootstrap?.calorieLogs ?? [],
    [homeBootstrap?.calorieLogs],
  );
  const workoutLogs = homeBootstrap?.workoutLogs ?? [];
  const weekLogs = useMemo(
    () =>
      calorieLogs.filter(
        (log) => log.date >= week.startKey && log.date <= week.endKey,
      ),
    [calorieLogs, week.endKey, week.startKey],
  );
  const throughYesterday = toLocalDateKey(addDays(today, -1));
  const weekAverage = loading
    ? null
    : averageLoggedDays(weekLogs, week.startKey, throughYesterday, todayKey);

  return (
    <LogOverlayHost>
      <View style={{ flex: 1, backgroundColor: "black" }}>
        <PagerView key={todayKey} style={{ flex: 1 }} initialPage={initialPage}>
          {days.map((day) => (
            <View
              key={toLocalDateKey(day)}
              collapsable={false}
              style={{ flex: 1 }}
            >
              <FitnessDayPage
                day={day}
                today={today}
                loading={loading}
                calorieLogs={calorieLogs}
                workoutLogs={workoutLogs}
                weekAverage={weekAverage}
                weekLabel={formatWeekRange(week.start, week.end)}
                weekStartKey={week.startKey}
                topInset={insets.top}
              />
            </View>
          ))}
        </PagerView>
      </View>
    </LogOverlayHost>
  );
}
