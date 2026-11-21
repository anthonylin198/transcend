import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Text from "@/components/ui/Text";
import { wodCategoryLabels } from "@/data/wods";
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
  const days = cycleDays(new Date());
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
            This 6-week schedule repeats.
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
