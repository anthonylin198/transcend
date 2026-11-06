import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listWeightLogs = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { displayName: null, weights: [] };

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) return { displayName: null, weights: [] };

    const weights = await ctx.db
      .query("weightLogs")
      .withIndex("by_profile_id_week_start", (q) =>
        q.eq("profileId", profile._id),
      )
      .collect();

    return {
      displayName: profile.displayName ?? null,
      weights: weights
        .map((weight) => ({
          _id: weight._id,
          weekStart: weight.weekStart,
          pounds: weight.pounds,
          updatedAt: weight.updatedAt,
        }))
        .sort((left, right) =>
          left.weekStart < right.weekStart
            ? 1
            : left.weekStart > right.weekStart
              ? -1
              : 0,
        ),
    };
  },
});
