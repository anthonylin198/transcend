import { useMemo, useState } from "react";
import { api } from "@transcend/convex";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CalorieAppHeader from "@/components/calories/CalorieAppHeader";
import Text from "@/components/ui/Text";
import { useLocalToday } from "@/hooks/useLocalToday";
import {
  addDays,
  eachDateKeyOfWeek,
  formatCalories,
  formatLogDateHeading,
  formatProtein,
  formatWeekRange,
  getSundayWeek,
  toLocalDateKey,
} from "@/utils/calorieWeek";

type FeedPerson = NonNullable<
  FunctionReturnType<typeof api.feed.weeklyFeed.weeklyFeed>
>["me"];

type DayEntry = {
  profileId: FeedPerson["profileId"];
  name: string;
  totals: { calories: number; proteinG: number } | null;
  workouts: FeedPerson["workouts"];
};

function entryForDay(
  person: FeedPerson,
  name: string,
  dateKey: string,
): DayEntry {
  return {
    profileId: person.profileId,
    name,
    totals: person.dailyTotals.find((day) => day.date === dateKey) ?? null,
    workouts: person.workouts.filter((workout) => workout.date === dateKey),
  };
}

function hasLogs(entry: DayEntry) {
  return entry.totals !== null || entry.workouts.length > 0;
}

function EntryCard({ entry }: { entry: DayEntry }) {
  return (
    <View
      style={{
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#1F2937",
        backgroundColor: "#0B0B0B",
        padding: 16,
        gap: 10,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Text type="text-semibold" style={{ flex: 1 }}>
          {entry.name}
        </Text>
        {entry.totals ? (
          <View style={{ alignItems: "flex-end" }}>
            <Text type="text-semibold">
              {formatCalories(entry.totals.calories)} cal
            </Text>
            <Text type="text-detail" color="#9CA3AF">
              {formatProtein(entry.totals.proteinG)}g protein
            </Text>
          </View>
        ) : null}
      </View>

      {entry.workouts.map((workout) => (
        <View
          key={workout._id}
          style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}
        >
          <Ionicons
            name="barbell-outline"
            size={16}
            color="#9CA3AF"
            style={{ marginTop: 3 }}
          />
          <Text type="text-regular" style={{ flex: 1 }}>
            {workout.description}
          </Text>
        </View>
      ))}

      {!hasLogs(entry) ? (
        <Text type="text-detail" color="#6B7280">
          Nothing logged yet
        </Text>
      ) : null}
    </View>
  );
}

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const today = useLocalToday();
  const todayKey = toLocalDateKey(today);
  const [weekOffset, setWeekOffset] = useState(0);
  const week = getSundayWeek(addDays(today, weekOffset * 7));
  const isCurrentWeek = weekOffset === 0;
  const queryRange = useMemo(
    () => ({ startDate: week.startKey, endDate: week.endKey }),
    [week.endKey, week.startKey],
  );
  const feed = useQuery(api.feed.weeklyFeed.weeklyFeed, queryRange);

  const days = useMemo(() => {
    if (!feed) return [];
    return eachDateKeyOfWeek(week.startKey)
      .filter((dateKey) => dateKey <= todayKey)
      .reverse()
      .map((dateKey) => {
        const me = entryForDay(feed.me, "You", dateKey);
        const friends = feed.friends
          .map((person) =>
            entryForDay(person, person.displayName ?? "Unnamed", dateKey),
          )
          .filter(hasLogs);
        const entries =
          dateKey === todayKey || hasLogs(me) ? [me, ...friends] : friends;
        return { dateKey, entries };
      })
      .filter((day) => day.entries.length > 0);
  }, [feed, todayKey, week.startKey]);

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <ScrollView
        contentContainerStyle={{
          width: "100%",
          maxWidth: 640,
          alignSelf: "center",
          paddingTop: insets.top + 8,
          paddingHorizontal: 20,
          paddingBottom: 36,
        }}
      >
        <CalorieAppHeader title="Feed" />

        <View
          style={{
            marginTop: 20,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Previous week"
            onPress={() => setWeekOffset((offset) => offset - 1)}
            hitSlop={8}
            style={{ padding: 6 }}
          >
            <Ionicons name="chevron-back" size={20} color="#FFFFFF" />
          </Pressable>
          <View style={{ alignItems: "center", flex: 1 }}>
            <Text type="text-semibold">
              {isCurrentWeek
                ? "This week"
                : formatWeekRange(week.start, week.end)}
            </Text>
            {isCurrentWeek ? (
              <Text type="text-detail" color="#9CA3AF">
                {formatWeekRange(week.start, week.end)}
              </Text>
            ) : null}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Next week"
            onPress={() => setWeekOffset((offset) => Math.min(0, offset + 1))}
            disabled={isCurrentWeek}
            hitSlop={8}
            style={{ padding: 6, opacity: isCurrentWeek ? 0.3 : 1 }}
          >
            <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
          </Pressable>
        </View>

        {feed === undefined ? (
          <Text type="text-detail" color="#9CA3AF" style={{ marginTop: 24 }}>
            Loading...
          </Text>
        ) : feed === null ? (
          <Text type="text-detail" color="#9CA3AF" style={{ marginTop: 24 }}>
            Sign in to see your feed.
          </Text>
        ) : (
          <View style={{ marginTop: 12 }}>
            {days.length === 0 ? (
              <Text
                type="text-detail"
                color="#6B7280"
                style={{ marginTop: 12 }}
              >
                Nothing logged this week
              </Text>
            ) : (
              days.map((day) => (
                <View key={day.dateKey} style={{ marginTop: 20, gap: 10 }}>
                  <Text type="text-detail" color="#9CA3AF">
                    {formatLogDateHeading(day.dateKey, todayKey)}
                  </Text>
                  {day.entries.map((entry) => (
                    <EntryCard key={entry.profileId} entry={entry} />
                  ))}
                </View>
              ))
            )}

            {feed.friends.length === 0 ? (
              <Pressable
                accessibilityRole="button"
                onPress={() =>
                  router.navigate("/(authenticated)/calorie-counter/friends")
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
                  Add friends to see their days here
                </Text>
                <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
              </Pressable>
            ) : null}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
