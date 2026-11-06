import { query } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { assertLocalDateKey } from "../lib/dateKey";

export const listMyDailyActivity = query({
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

    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) return [];

    const days = await ctx.db
      .query("dailyActivity")
      .withIndex("by_profile_id_date", (q) =>
        q
          .eq("profileId", profile._id)
          .gte("date", args.startDate)
          .lte("date", args.endDate),
      )
      .collect();

    return days
      .map((day) => ({
        date: day.date,
        steps: day.steps,
      }))
      .sort((left, right) => (left.date < right.date ? -1 : 1));
  },
});
