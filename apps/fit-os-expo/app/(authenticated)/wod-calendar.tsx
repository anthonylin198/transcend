import { Ionicons } from "@expo/vector-icons";
import { api } from "@transcend/convex";
import { useQuery } from "convex/react";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/ui/Text";
import { wodCategoryLabels } from "@/data/wod";
import { cycleDays } from "@/data/wodSchedule";
import { toLocalDateKey } from "@/utils/calorieWeek";

function weekLabel(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
}

function dayLabel(date: Date, todayKey: string) {
  const key = toLocalDateKey(date);
  const monthDay = new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
  }).format(date);
  if (key === todayKey) return `Today · ${monthDay}`;
  const weekday = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
  }).format(date);
  return `${weekday} · ${monthDay}`;
}

export default function WodCalendarScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const todayKey = toLocalDateKey(new Date());
  const workouts = useQuery(api.wods.listWods.listWods);
  const schedule = useQuery(api.wods.getWodSchedule.getWodSchedule);
  const bySlug = useMemo(() => {
    return new Map((workouts ?? []).map((wod) => [wod.slug, wod]));
  }, [workouts]);
  const days = schedule
    ? cycleDays(schedule.wodSlugs, schedule.cycleStart).map((day) => ({
        ...day,
        wod: bySlug.get(day.slug),
      }))
    : [];
  const loading = workouts === undefined || schedule === undefined;
  const weeks = Array.from({ length: days.length / 7 }, (_, index) =>
    days.slice(index * 7, index * 7 + 7),
  );

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingHorizontal: 24,
          paddingBottom: insets.bottom + 36,
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
              Calendar
            </Text>
          </View>
          <Text type="text-detail" color="#9CA3AF" style={{ marginTop: 8 }}>
            {loading
              ? "Loading"
              : days.length === 0
                ? "No schedule yet"
                : "This schedule repeats."}
          </Text>

          {weeks.map((week) => {
            const start = week[0]?.date;
            return (
              <View key={start ? toLocalDateKey(start) : "week"}>
                <Text
                  type="text-semibold"
                  style={{ marginTop: 28, marginBottom: 4 }}
                >
                  {start ? `Week of ${weekLabel(start)}` : "Week"}
                </Text>
                {week.map(({ date, wod }) => {
                  const key = toLocalDateKey(date);
                  return (
                    <Pressable
                      key={key}
                      accessibilityRole="button"
                      accessibilityLabel={`${dayLabel(date, todayKey)}, ${wod?.title ?? "No workout"}`}
                      onPress={() =>
                        router.push({
                          pathname: "/(authenticated)/wod",
                          params: { date: key },
                        })
                      }
                      style={({ pressed }) => ({
                        minHeight: 72,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 12,
                        borderTopWidth: 1,
                        borderTopColor: "#1F2937",
                        paddingVertical: 14,
                        opacity: pressed ? 0.7 : 1,
                      })}
                    >
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text type="text-semibold">
                          {dayLabel(date, todayKey)}
                        </Text>
                        <Text type="text-detail" color="#9CA3AF">
                          {wod
                            ? `${wod.title} · ${wodCategoryLabels[wod.category]}`
                            : "No workout"}
                        </Text>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={18}
                        color="#9CA3AF"
                      />
                    </Pressable>
                  );
                })}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
