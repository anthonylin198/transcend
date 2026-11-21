import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getWodSchedule = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const schedule = await ctx.db
      .query("wodSchedules")
      .withIndex("by_key", (q) => q.eq("key", "default"))
      .unique();
    if (!schedule) return null;

    return {
      cycleStart: schedule.cycleStart,
      wodSlugs: schedule.wodSlugs,
    };
  },
});
