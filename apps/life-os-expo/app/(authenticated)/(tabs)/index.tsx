import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "@transcend/convex";
import { useQuery } from "convex/react";
import PagerView from "react-native-pager-view";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import CalendarSection from "@/components/home/components/calendar/CalendarSection";
import PrioritiesSection from "@/components/home/components/PrioritiesSection";
import HabitsSection from "@/components/home/components/HabitsSection";
import {
  getDateKey,
  useCalendarEvents,
} from "@/components/home/hooks/useCalendarEvents";
import Text from "@/components/ui/Text";
import {
  HOME_DAY_WINDOW,
  getHomeBootstrapRange,
} from "@/utils/homeBootstrapRange";
import { Ionicons } from "@expo/vector-icons";
import {
  Animated,
  AppState,
  Easing,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const isFocused = useIsFocused();
  const [today, setToday] = useState(() => toStartOfDay(new Date()));
  const bootstrapRange = useMemo(() => getHomeBootstrapRange(today), [today]);
  const days = useMemo(
    () =>
      Array.from({ length: HOME_DAY_WINDOW * 2 + 1 }, (_, index) =>
        addDays(today, index - HOME_DAY_WINDOW),
      ),
    [today],
  );
  const initialPage = HOME_DAY_WINDOW;
  const calendarRangeStart = days[0] ?? today;
  const calendarRangeEnd = days[days.length - 1] ?? today;
  const homeBootstrap = useQuery(api.home.bootstrap.bootstrap, bootstrapRange);
  const canShowCalendar = homeBootstrap?.profile?.calendarSyncEnabled ?? false;
  const bootstrapPriorities = homeBootstrap?.priorities ?? [];
  const bootstrapHabits = homeBootstrap?.habits ?? [];
  const bootstrapHabitCompletions = homeBootstrap?.habitCompletions ?? [];
  const entranceAnimation = useRef(new Animated.Value(0)).current;
  const pagerRef = useRef<PagerView>(null);
  const currentPageRef = useRef(initialPage);
  const appStateRef = useRef(AppState.currentState);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { eventsByDay, reloadCalendarEvents } = useCalendarEvents({
    startDate: calendarRangeStart,
    endDate: calendarRangeEnd,
  });
  const entranceStyle = {
    opacity: entranceAnimation,
    transform: [
      {
        translateY: entranceAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [14, 0],
        }),
      },
    ],
  };

  useEffect(() => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.timing(entranceAnimation, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [entranceAnimation]);

  const syncToCurrentDay = useCallback(() => {
    const nextToday = toStartOfDay(new Date());

    if (!isSameDay(today, nextToday)) {
      // Updating `today` remounts the PagerView (keyed by date) centered on
      // the new day; the bootstrap query and calendar hook refetch since
      // their args derive from `today`.
      currentPageRef.current = initialPage;
      setToday(nextToday);
      return;
    }

    if (currentPageRef.current !== initialPage) {
      pagerRef.current?.setPage(initialPage);
    }
  }, [initialPage, today]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      const previousState = appStateRef.current;
      appStateRef.current = nextState;
      const becameActive =
        previousState.match(/inactive|background/) !== null &&
        nextState === "active";
      if (becameActive && isFocused) {
        syncToCurrentDay();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [isFocused, syncToCurrentDay]);

  useEffect(() => {
    if (!isFocused) return;
    const timer = setInterval(() => {
      syncToCurrentDay();
    }, 60_000);
    return () => {
      clearInterval(timer);
    };
  }, [isFocused, syncToCurrentDay]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    pagerRef.current?.setPage(initialPage);
    try {
      await reloadCalendarEvents();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <PagerView
        // PagerView can't handle its children all changing (every page key
        // shifts when the day rolls over), which leaves blank pages. Keying
        // by the current day forces a clean remount instead.
        key={getDateKey(today)}
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={initialPage}
        onPageSelected={(event) => {
          currentPageRef.current = event.nativeEvent.position;
        }}
      >
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
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                padding: 20,
                paddingTop: insets.top + 16,
                paddingBottom: 150,
                gap: 24,
              }}
              refreshControl={
                <RefreshControl
                  refreshing={isRefreshing}
                  onRefresh={() => void onRefresh()}
                  tintColor="#9CA3AF"
                  progressBackgroundColor="#000000"
                />
              }
            >
              <Animated.View style={entranceStyle}>
                <View style={{ alignItems: "center", gap: 4 }}>
                  <Text type="heading-4" color="#E5E7EB">
                    {dayGreeting}
                  </Text>
                  <Text type="text-medium" color="#9CA3AF">
                    {dayDateLabel}
                  </Text>
                </View>

                <View style={{ marginTop: 24, gap: 24 }}>
                  {canShowCalendar ? (
                    <CalendarSection calendarEvents={dayEvents} />
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
                </View>
              </Animated.View>
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
            paddingBottom: 22,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text type="text-medium" color="#9CA3AF">
            View Intake List
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
        </Pressable>
      </View>
    </View>
  );
}
