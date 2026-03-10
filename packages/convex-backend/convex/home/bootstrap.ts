import { query } from "../_generated/server";
import { v } from "convex/values";

export const bootstrap = query({
  args: {
    rangeStartMs: v.optional(v.number()),
    rangeEndMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return {
        profile: null,
        priorities: [],
        habits: [],
        habitCompletions: [],
      };
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!profile) {
      return {
        profile: null,
        priorities: [],
        habits: [],
        habitCompletions: [],
      };
    }

    const priorities = await ctx.db
      .query("priorities")
      .withIndex("by_profile_id", (q) => q.eq("profileId", profile._id))
      .collect();
    const habits = await ctx.db
      .query("habits")
      .withIndex("by_profile_id_order", (q) => q.eq("profileId", profile._id))
      .collect();
    const habitCompletions = await ctx.db
      .query("habitCompletions")
      .withIndex("by_profile_id", (q) => q.eq("profileId", profile._id))
      .collect();

    const completedRangeStart = args.rangeStartMs ?? Number.NEGATIVE_INFINITY;
    const completedRangeEnd = args.rangeEndMs ?? Number.POSITIVE_INFINITY;

    const homePriorities = priorities
      .filter((priority) => {
        if (priority.status === "next_up") {
          return priority.isActive;
        }
        if (priority.status === "done") {
          if (priority.completedAt === undefined) return false;
          return (
            priority.completedAt >= completedRangeStart &&
            priority.completedAt < completedRangeEnd
          );
        }
        return false;
      })
      .sort((a, b) => a.orderIndex - b.orderIndex);

    return {
      profile,
      priorities: homePriorities,
      habits,
      habitCompletions,
    };
  },
});
