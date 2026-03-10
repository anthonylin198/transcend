import { useMemo } from "react";
import { api } from "@transcend/convex";
import { useQuery } from "convex/react";
import PagerView from "react-native-pager-view";
import { useRouter } from "expo-router";
import CalendarSection from "@/components/home/components/calendar/CalendarSection";
import PrioritiesSection from "@/components/home/components/PrioritiesSection";
import HabitsSection from "@/components/home/components/HabitsSection";
import {
  getDateKey,
  useCalendarEvents,
} from "@/components/home/hooks/useCalendarEvents";
import Text from "@/components/ui/Text";
import { Pressable, ScrollView, View } from "react-native";

const DAY_WINDOW = 7;

function toStartOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(value: Date, amount: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + amount);
  return date;
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function getGreeting(value: Date, today: Date) {
  if (isSameDay(value, today)) {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  }

  const yesterday = addDays(today, -1);
  const tomorrow = addDays(today, 1);
  if (isSameDay(value, yesterday)) return "Yesterday";
  if (isSameDay(value, tomorrow)) return "Tomorrow";

  return new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(value);
}

export default function HomeScreen() {
  const router = useRouter();
  const today = useMemo(() => toStartOfDay(new Date()), []);
  const days = useMemo(
    () =>
      Array.from({ length: DAY_WINDOW * 2 + 1 }, (_, index) =>
        addDays(today, index - DAY_WINDOW),
      ),
    [today],
  );
  const initialPage = DAY_WINDOW;
  const calendarRangeStart = days[0] ?? today;
  const calendarRangeEnd = days[days.length - 1] ?? today;
  const homeBootstrap = useQuery(api.home.bootstrap.bootstrap, {
    rangeStartMs: calendarRangeStart.getTime(),
    rangeEndMs: addDays(calendarRangeEnd, 1).getTime(),
  });
  const canShowCalendar = homeBootstrap?.profile?.calendarSyncEnabled ?? false;
  const bootstrapPriorities = homeBootstrap?.priorities ?? [];
  const bootstrapHabits = homeBootstrap?.habits ?? [];
  const bootstrapHabitCompletions = homeBootstrap?.habitCompletions ?? [];
  const { eventsByDay, loadingCalendar } = useCalendarEvents({
    startDate: calendarRangeStart,
    endDate: calendarRangeEnd,
  });

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <PagerView style={{ flex: 1 }} initialPage={initialPage}>
        {days.map((day) => {
          const dayGreeting = getGreeting(day, today);
          const dayDateLabel = new Intl.DateTimeFormat(undefined, {
            weekday: "short",
            month: "long",
            day: "numeric",
          }).format(day);
          const dayEvents = eventsByDay[getDateKey(day)] ?? [];

          return (
            <ScrollView
              key={day.toISOString()}
              style={{
                flex: 1,
                backgroundColor: "black",
              }}
              contentContainerStyle={{
                padding: 20,
                paddingBottom: 150,
                gap: 24,
              }}
            >
              <View style={{ alignItems: "center", marginTop: 28, gap: 4 }}>
                <Text type="heading-4" color="#E5E7EB">
                  {dayGreeting}
                </Text>
                <Text type="text-medium" color="#9CA3AF">
                  {dayDateLabel}
                </Text>
              </View>

              <View style={{ gap: 8 }}>
                <Text
                  type="heading-4"
                  color="#E5E7EB"
                  style={{ lineHeight: 30 }}
                >
                  A good life is built in small, repeated choices.
                </Text>
              </View>

              {canShowCalendar ? (
                <CalendarSection
                  calendarEvents={dayEvents}
                  loadingCalendar={loadingCalendar}
                />
              ) : null}

              <PrioritiesSection
                priorities={bootstrapPriorities}
                selectedDate={day}
                today={today}
              />

              <HabitsSection
                habits={bootstrapHabits}
                habitCompletions={bootstrapHabitCompletions}
                selectedDate={day}
              />
            </ScrollView>
          );
        })}
      </PagerView>

      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "black",
          zIndex: 20,
        }}
      >
        <Pressable
          onPress={() => router.push("/(authenticated)/intake")}
          style={{
            borderTopWidth: 1,
            borderTopColor: "#1F2937",
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: 10,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text type="text-medium" color="#9CA3AF">
            View Intake List
          </Text>
          <Text type="heading-4" color="#9CA3AF">
            ›
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
