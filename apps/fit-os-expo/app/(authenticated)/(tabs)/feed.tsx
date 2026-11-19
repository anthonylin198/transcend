import { useMemo, useState } from "react";
import { api } from "@transcend/convex";
import { useQuery } from "convex/react";
import type { FunctionReturnType } from "convex/server";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import CalorieAppHeader from "@/components/calories/CalorieAppHeader";
import Eyebrow from "@/components/ui/Eyebrow";
import ShareDayModal, { type ShareDay } from "@/components/feed/ShareDayModal";
import ShareItemModal, {
  type ShareItem,
} from "@/components/feed/ShareItemModal";
import StepChallengeCard from "@/components/feed/StepChallengeCard";
import Text from "@/components/ui/Text";
import { appFonts } from "@/constants/fonts";
import { useDaySteps } from "@/hooks/useDaySteps";
import { useSyncDailyActivity } from "@/hooks/useSyncDailyActivity";
import { useLocalToday } from "@/hooks/useLocalToday";
import { formatCompactCount, groupWeekStats } from "@/utils/groupWeek";
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

type OpenDay = Omit<ShareDay, "steps" | "stepsPending"> & {
  isMine: boolean;
  savedSteps: number | null;
};

type DayEntry = {
  profileId: FeedPerson["profileId"];
  name: string;
  totals: { calories: number; proteinG: number } | null;
  steps: number | null;
  calorieLogs: FeedPerson["calorieLogs"];
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
    steps: person.activity.find((day) => day.date === dateKey)?.steps ?? null,
    calorieLogs: person.calorieLogs.filter((log) => log.date === dateKey),
    workouts: person.workouts.filter((workout) => workout.date === dateKey),
  };
}

function hasLogs(entry: DayEntry) {
  return (
    entry.totals !== null ||
    entry.workouts.length > 0 ||
    (entry.steps !== null && entry.steps > 0)
  );
}

function EntryCard({
  entry,
  dateKey,
  shareName,
  onExpand,
  onShare,
}: {
  entry: DayEntry;
  dateKey: string;
  shareName: string;
  onExpand: () => void;
  onShare: (item: ShareItem) => void;
}) {
  const [entriesOpen, setEntriesOpen] = useState(false);
  const initial = entry.name.trim().charAt(0).toUpperCase() || "?";
  const canShowEntries = entry.calorieLogs.length > 0;
  const showSteps =
    entry.steps !== null &&
    (entry.steps > 0 || entry.totals !== null || entry.workouts.length > 0);

  return (
    <View
      style={{
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#262626",
        backgroundColor: "#0A0A0A",
        padding: 18,
        gap: 16,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
        <View
          style={{
            width: 34,
            height: 34,
            borderRadius: 17,
            borderWidth: 1,
            borderColor: "#262626",
            backgroundColor: "#141414",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text type="text-semibold" color="#D4D4D4">
            {initial}
          </Text>
        </View>
        <Text type="heading-4" numberOfLines={1} style={{ flex: 1 }}>
          {entry.name}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Open ${entry.name}'s day`}
          onPress={onExpand}
          hitSlop={8}
          style={{ padding: 4 }}
        >
          <Ionicons name="expand-outline" size={16} color="#525252" />
        </Pressable>
      </View>

      {entry.totals || showSteps ? (
        <View style={{ gap: 14 }}>
          <View style={{ flexDirection: "row", alignItems: "stretch" }}>
            {entry.totals ? (
              <>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: entriesOpen }}
                  accessibilityLabel={
                    entriesOpen
                      ? "Hide calorie entries"
                      : "Show calorie entries"
                  }
                  disabled={!canShowEntries}
                  onPress={() => setEntriesOpen((open) => !open)}
                  style={{ flex: 1, gap: 2 }}
                >
                  <Text
                    type="heading-2"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={{ letterSpacing: -1 }}
                  >
                    {formatCalories(entry.totals.calories)}
                  </Text>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    <Eyebrow>CALORIES</Eyebrow>
                    {canShowEntries ? (
                      <Ionicons
                        name={entriesOpen ? "chevron-up" : "chevron-down"}
                        size={12}
                        color="#737373"
                      />
                    ) : null}
                  </View>
                </Pressable>
                <View
                  style={{
                    width: 1,
                    backgroundColor: "#262626",
                    marginRight: 18,
                  }}
                />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text
                    type="heading-2"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={{ letterSpacing: -1 }}
                  >
                    {`${formatProtein(entry.totals.proteinG)}g`}
                  </Text>
                  <Eyebrow>PROTEIN</Eyebrow>
                </View>
              </>
            ) : null}
            {showSteps && entry.steps !== null ? (
              <>
                {entry.totals ? (
                  <View
                    style={{
                      width: 1,
                      backgroundColor: "#262626",
                      marginRight: 18,
                    }}
                  />
                ) : null}
                <View style={{ flex: 1, gap: 2 }}>
                  <Text
                    type="heading-2"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={{ letterSpacing: -1 }}
                  >
                    {formatCalories(entry.steps)}
                  </Text>
                  <Eyebrow>STEPS</Eyebrow>
                </View>
              </>
            ) : null}
          </View>

          {entriesOpen ? (
            <View style={{ gap: 12 }}>
              {entry.calorieLogs.map((log) => (
                <View
                  key={log._id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text type="text-medium">
                      {formatCalories(log.calories)} cal
                      <Text type="text-medium" color="#737373">
                        {`  ${formatProtein(log.proteinG)}g`}
                      </Text>
                    </Text>
                    {log.description ? (
                      <Text type="text-regular" color="#D4D4D4">
                        {log.description}
                      </Text>
                    ) : null}
                  </View>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={
                      log.description
                        ? `Share ${log.description}`
                        : `Share ${formatCalories(log.calories)} calorie entry`
                    }
                    hitSlop={8}
                    onPress={() =>
                      onShare({
                        kind: "meal",
                        id: log._id,
                        name: shareName,
                        dateKey,
                        calories: log.calories,
                        proteinG: log.proteinG,
                        description: log.description,
                      })
                    }
                    style={{ padding: 4 }}
                  >
                    <Ionicons name="share-outline" size={16} color="#737373" />
                  </Pressable>
                </View>
              ))}
            </View>
          ) : null}
        </View>
      ) : null}

      {entry.workouts.length > 0 ? (
        <View style={{ gap: 10 }}>
          <View style={{ height: 1, backgroundColor: "#1C1C1C" }} />
          {entry.workouts.map((workout) => (
            <View
              key={workout._id}
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <Ionicons
                name="barbell-outline"
                size={16}
                color="#737373"
                style={{ marginTop: 4 }}
              />
              <Text type="text-medium" style={{ flex: 1 }}>
                {workout.description}
              </Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={`Share workout ${workout.description}`}
                hitSlop={8}
                onPress={() =>
                  onShare({
                    kind: "workout",
                    id: workout._id,
                    name: shareName,
                    dateKey,
                    description: workout.description,
                  })
                }
                style={{ padding: 4 }}
              >
                <Ionicons name="share-outline" size={16} color="#737373" />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}

      {!hasLogs(entry) ? (
        <Text type="text-medium" color="#737373">
          A quiet day so far.
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
  const challenge = useQuery(
    api.challenges.stepChallengeForWeek.stepChallengeForWeek,
    {
      weekStart: week.startKey,
      today: isCurrentWeek ? todayKey : undefined,
    },
  );
  const [openDay, setOpenDay] = useState<OpenDay | null>(null);
  const [shareItem, setShareItem] = useState<ShareItem | null>(null);
  const healthEnabled = feed?.healthSyncEnabled ?? false;
  const stats = useMemo(
    () => (feed ? groupWeekStats([feed.me, ...feed.friends]) : null),
    [feed],
  );
  useSyncDailyActivity(
    healthEnabled,
    week.startKey,
    week.endKey,
    feed ? feed.me.activity : undefined,
  );
  const { steps, loading: stepsLoading } = useDaySteps(
    openDay?.isMine && healthEnabled ? openDay.dateKey : null,
  );
  const shareDay: ShareDay | null = openDay
    ? {
        name: openDay.name,
        dateKey: openDay.dateKey,
        totals: openDay.totals,
        workouts: openDay.workouts,
        steps: openDay.isMine && healthEnabled ? steps : openDay.savedSteps,
        stepsPending: openDay.isMine && healthEnabled && stepsLoading,
      }
    : null;

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
        showsVerticalScrollIndicator={false}
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

        {challenge ? (
          <View style={{ marginTop: 18 }}>
            <StepChallengeCard
              key={week.startKey}
              challenge={challenge}
              weekLabel={formatWeekRange(week.start, week.end)}
              showToday={isCurrentWeek}
            />
          </View>
        ) : challenge === undefined ? null : stats ? (
          <View style={{ marginTop: 18, gap: 10 }}>
            <Eyebrow color="#A3A3A3">FRIEND TOTALS</Eyebrow>
            <View
              accessibilityLabel={`Friend totals, ${stats.workouts} workouts, ${formatCalories(stats.steps)} steps, ${formatCalories(stats.caloriesEaten)} calories eaten`}
              style={{ flexDirection: "row", gap: 8 }}
            >
              {(
                [
                  [formatCalories(stats.workouts), "WORKOUTS"],
                  [formatCompactCount(stats.steps), "STEPS"],
                  [formatCalories(stats.caloriesEaten), "CALORIES"],
                ] as const
              ).map(([value, label]) => (
                <View
                  key={label}
                  style={{
                    flex: 1,
                    minHeight: 72,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: "#262626",
                    backgroundColor: "#0A0A0A",
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    gap: 6,
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={{
                      fontFamily: appFonts.semiBold,
                      fontSize: 20,
                      lineHeight: 24,
                      letterSpacing: -0.5,
                    }}
                  >
                    {value}
                  </Text>
                  <Eyebrow>{label}</Eyebrow>
                </View>
              ))}
            </View>
          </View>
        ) : null}

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
                <View key={day.dateKey} style={{ marginTop: 28, gap: 12 }}>
                  <Eyebrow color="#A3A3A3">
                    {formatLogDateHeading(day.dateKey, todayKey).toUpperCase()}
                  </Eyebrow>
                  {day.entries.map((entry) => {
                    const shareName =
                      entry.profileId === feed.me.profileId
                        ? (feed.me.displayName ?? "You")
                        : entry.name;
                    return (
                      <EntryCard
                        key={entry.profileId}
                        entry={entry}
                        dateKey={day.dateKey}
                        shareName={shareName}
                        onShare={setShareItem}
                        onExpand={() =>
                          setOpenDay({
                            isMine: entry.profileId === feed.me.profileId,
                            name: shareName,
                            dateKey: day.dateKey,
                            totals: entry.totals,
                            workouts: entry.workouts,
                            savedSteps: entry.steps,
                          })
                        }
                      />
                    );
                  })}
                </View>
              ))
            )}

            {feed.friends.length === 0 ? (
              <Pressable
                accessibilityRole="button"
                onPress={() => router.navigate("/(authenticated)/you")}
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

      <ShareDayModal day={shareDay} onClose={() => setOpenDay(null)} />
      <ShareItemModal item={shareItem} onClose={() => setShareItem(null)} />
    </View>
  );
}
