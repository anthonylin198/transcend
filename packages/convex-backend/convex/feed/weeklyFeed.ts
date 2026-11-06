import { query } from "../_generated/server";
import type { QueryCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { assertLocalDateKey } from "../lib/dateKey";
import { listOrderedFriendProfileIds } from "../lib/friendships";

const MAX_RANGE_DAYS = 31;
const DAY_MS = 24 * 60 * 60 * 1000;

const dateKeyToUtc = (dateKey: string) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  return Date.UTC(year, month - 1, day);
};

const loadPerson = async (
  ctx: QueryCtx,
  profileId: Id<"profiles">,
  startDate: string,
  endDate: string,
) => {
  const [profile, calorieLogs, workoutLogs, activity, weights] =
    await Promise.all([
      ctx.db.get(profileId),
      ctx.db
        .query("calorieLogs")
        .withIndex("by_profile_id_date", (q) =>
          q
            .eq("profileId", profileId)
            .gte("date", startDate)
            .lte("date", endDate),
        )
        .collect(),
      ctx.db
        .query("workoutLogs")
        .withIndex("by_profile_id_date", (q) =>
          q
            .eq("profileId", profileId)
            .gte("date", startDate)
            .lte("date", endDate),
        )
        .collect(),
      ctx.db
        .query("dailyActivity")
        .withIndex("by_profile_id_date", (q) =>
          q
            .eq("profileId", profileId)
            .gte("date", startDate)
            .lte("date", endDate),
        )
        .collect(),
      ctx.db
        .query("weightLogs")
        .withIndex("by_profile_id_week_start", (q) =>
          q.eq("profileId", profileId),
        )
        .collect(),
    ]);

  const currentWeight = weights.find(
    (weight) => weight.weekStart === startDate,
  );
  const priorWeight = weights
    .filter((weight) => weight.weekStart < startDate)
    .sort((left, right) => (left.weekStart < right.weekStart ? 1 : -1))[0];
  const poundsLost =
    currentWeight && priorWeight
      ? Math.round((priorWeight.pounds - currentWeight.pounds) * 10) / 10
      : null;

  const totalsByDate = new Map<
    string,
    { calories: number; proteinG: number }
  >();
  for (const log of calorieLogs) {
    const current = totalsByDate.get(log.date) ?? { calories: 0, proteinG: 0 };
    current.calories += log.calories;
    current.proteinG += log.proteinG;
    totalsByDate.set(log.date, current);
  }

  return {
    profileId,
    displayName: profile?.displayName ?? null,
    dailyTotals: [...totalsByDate.entries()]
      .map(([date, totals]) => ({ date, ...totals }))
      .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0)),
    calorieLogs: calorieLogs
      .map((log) => ({
        _id: log._id,
        date: log.date,
        calories: log.calories,
        proteinG: log.proteinG,
        description: log.description,
        createdAt: log.createdAt,
      }))
      .sort((a, b) =>
        a.date === b.date
          ? a.createdAt - b.createdAt
          : a.date < b.date
            ? -1
            : 1,
      ),
    workouts: workoutLogs
      .map((log) => ({
        _id: log._id,
        date: log.date,
        description: log.description,
        createdAt: log.createdAt,
      }))
      .sort((a, b) =>
        a.date === b.date
          ? a.createdAt - b.createdAt
          : a.date < b.date
            ? -1
            : 1,
      ),
    activity: activity
      .map((day) => ({
        date: day.date,
        steps: day.steps,
      }))
      .sort((left, right) => (left.date < right.date ? -1 : 1)),
    // Positive when this week's weigh-in is below the previous one.
    poundsLost,
  };
};

/**
 * The current user plus accepted friends (in the viewer's chosen order), each
 * with per-day calorie/protein totals, the calorie entries behind those
 * totals, workouts, saved steps, and the week's weight
 * change. `startDate` is the Sunday key used for weigh-ins.
 */
export const weeklyFeed = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    assertLocalDateKey(args.startDate);
    assertLocalDateKey(args.endDate);
    if (args.startDate > args.endDate) {
      throw new Error("Invalid date range");
    }
    const spanDays =
      (dateKeyToUtc(args.endDate) - dateKeyToUtc(args.startDate)) / DAY_MS + 1;
    if (spanDays > MAX_RANGE_DAYS) {
      throw new Error(`Date range must be ${MAX_RANGE_DAYS} days or fewer`);
    }

    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) return null;

    const friendIds = await listOrderedFriendProfileIds(ctx, profile);
    const [me, ...friends] = await Promise.all(
      [profile._id, ...friendIds].map((profileId) =>
        loadPerson(ctx, profileId, args.startDate, args.endDate),
      ),
    );
    return {
      me,
      friends,
      healthSyncEnabled: profile.healthSyncEnabled ?? false,
    };
  },
});
