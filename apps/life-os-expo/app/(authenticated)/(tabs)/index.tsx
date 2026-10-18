import { useEffect, useMemo, useRef, useState } from "react";
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
import Eyebrow from "@/components/ui/Eyebrow";
import Rings from "@/components/ui/Rings";
import SplashCover from "@/components/ui/SplashCover";
import Text from "@/components/ui/Text";
import { appFonts } from "@/constants/fonts";
import { useLocalToday } from "@/hooks/useLocalToday";
import {
  HOME_DAY_WINDOW,
  getHomeBootstrapRange,
} from "@/utils/homeBootstrapRange";
import { Ionicons } from "@expo/vector-icons";
import {
  Animated,
  Easing,
  Pressable,
  RefreshControl,
  ScrollView,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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

const DAY_CHANGE_REVEAL_TIMEOUT_MS = 12_000;

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const today = useLocalToday();
  const todayKey = getDateKey(today);
  const [visibleDayKey, setVisibleDayKey] = useState(todayKey);
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
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { eventsByDay, loadedRangeKey, reloadCalendarEvents } =
    useCalendarEvents({
      startDate: calendarRangeStart,
      endDate: calendarRangeEnd,
    });
  const calendarRangeKey = `${getDateKey(calendarRangeStart)}:${getDateKey(calendarRangeEnd)}`;
  const isSwitchingDay = visibleDayKey !== todayKey;
  const [ignoreCalendarWait, setIgnoreCalendarWait] = useState(false);
  const hasBootstrapProfile = homeBootstrap?.profile != null;
  const dayChangeReady =
    !isSwitchingDay ||
    (hasBootstrapProfile &&
      (!canShowCalendar ||
        ignoreCalendarWait ||
        loadedRangeKey === calendarRangeKey));
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

  useEffect(() => {
    if (!dayChangeReady || !isSwitchingDay) return;
    setVisibleDayKey(todayKey);
  }, [dayChangeReady, isSwitchingDay, todayKey]);

  useEffect(() => {
    if (!isSwitchingDay) {
      setIgnoreCalendarWait(false);
      return;
    }
    // Calendar can hang after a long suspend. Bootstrap still has to arrive
    // for the new day; revealing early paints "No priorities" from empty data.
    const timeout = setTimeout(() => {
      setIgnoreCalendarWait(true);
    }, DAY_CHANGE_REVEAL_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [isSwitchingDay, todayKey]);

  const onRefresh = async () => {
    setIsRefreshing(true);
    pagerRef.current?.setPage(initialPage);
    try {
      await reloadCalendarEvents();
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!dayChangeReady) {
    return <SplashCover />;
  }

  return (
    <View style={{ flex: 1, backgroundColor: "black", overflow: "hidden" }}>
      <Rings size={420} overhang={150} color="#141414" />
      <PagerView
        // PagerView can't handle its children all changing (every page key
        // shifts when the day rolls over), which leaves blank pages. Keying
        // by the current day forces a clean remount instead.
        key={getDateKey(today)}
        ref={pagerRef}
        style={{ flex: 1 }}
        initialPage={initialPage}
      >
        {days.map((day) => {
          const dayGreeting = getGreeting(day, today);
          const dayDateLabel = [
            new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(day),
            new Intl.DateTimeFormat(undefined, {
              month: "short",
              day: "numeric",
            }).format(day),
          ]
            .join(" · ")
            .toUpperCase();
          const dayEvents = eventsByDay[getDateKey(day)] ?? [];

          return (
            <ScrollView
              key={day.toISOString()}
              style={{ flex: 1, backgroundColor: "transparent" }}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                padding: 24,
                paddingTop: insets.top + 28,
                paddingBottom: 150,
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
                <View style={{ gap: 10 }}>
                  <Eyebrow color="#737373">{dayDateLabel}</Eyebrow>
                  <Text
                    accessibilityRole="header"
                    style={{
                      fontFamily: appFonts.semiBold,
                      fontSize: 36,
                      lineHeight: 42,
                      letterSpacing: -1.2,
                    }}
                  >
                    {dayGreeting}
                  </Text>
                </View>

                <View style={{ marginTop: 40, gap: 36 }}>
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
            borderTopColor: "#1A1A1A",
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: 22,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text type="text-medium" color="#737373">
            View Intake List
          </Text>
          <Ionicons name="chevron-forward" size={18} color="#525252" />
        </Pressable>
      </View>
    </View>
  );
}
