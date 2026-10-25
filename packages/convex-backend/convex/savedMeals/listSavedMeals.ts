import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listSavedMeals = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) return [];

    return await ctx.db
      .query("savedMeals")
      .withIndex("by_profile_id", (q) => q.eq("profileId", profile._id))
      .collect();
  },
});
