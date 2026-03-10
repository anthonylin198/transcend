import { query } from "../_generated/server";
import { v } from "convex/values";

/**
 * Home bootstrap query used by multiple tabs/views as a shared preload source.
 *
 * It fetches, in parallel:
 * - active next-up priorities (returned as `categories`, and included in `priorities`)
 * - habits
 * - projects (without nested priorities)
 * - intake list items
 * - completed data scoped to a date window (`done` priorities + habit completions)
 *
 * Date range behavior:
 * - `rangeStartMs` is inclusive and `rangeEndMs` is exclusive.
 * - The range is meant to match the visible pager window on home (first day start -> day after last day start).
 * - If the range is missing, completion-based datasets return empty arrays to avoid unbounded historical reads.
 */
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
        categories: [],
        priorities: [],
        habits: [],
        habitCompletions: [],
        projects: [],
        intakeListItems: [],
      };
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (!profile) {
      return {
        profile: null,
        categories: [],
        priorities: [],
        habits: [],
        habitCompletions: [],
        projects: [],
        intakeListItems: [],
      };
    }

    const hasCompletedRange =
      args.rangeStartMs !== undefined && args.rangeEndMs !== undefined;
    const completedRangeStart = args.rangeStartMs ?? 0;
    const completedRangeEnd = args.rangeEndMs ?? 0;

    const [
      nextUpPriorities,
      donePriorities,
      habits,
      habitCompletions,
      projects,
      intakeListItems,
    ] = await Promise.all([
      ctx.db
        .query("priorities")
        .withIndex("by_profile_id_status", (q) =>
          q.eq("profileId", profile._id).eq("status", "next_up"),
        )
        .collect(),
      ctx.db
        .query("priorities")
        .withIndex("by_profile_id_status_completed_at", (q) =>
          q
            .eq("profileId", profile._id)
            .eq("status", "done")
            .gte("completedAt", completedRangeStart)
            .lt("completedAt", completedRangeEnd),
        )
        .collect()
        .then((results) => (hasCompletedRange ? results : [])),
      ctx.db
        .query("habits")
        .withIndex("by_profile_id_order", (q) => q.eq("profileId", profile._id))
        .collect(),
      hasCompletedRange
        ? ctx.db
            .query("habitCompletions")
            .withIndex("by_profile_id_completed_at", (q) =>
              q
                .eq("profileId", profile._id)
                .gte("completedAt", completedRangeStart)
                .lt("completedAt", completedRangeEnd),
            )
            .collect()
        : Promise.resolve([]),
      ctx.db
        .query("projects")
        .withIndex("by_profile_id_order", (q) => q.eq("profileId", profile._id))
        .collect(),
      ctx.db
        .query("intakeListItems")
        .withIndex("by_profile_id_created_at", (q) =>
          q.eq("profileId", profile._id),
        )
        .order("asc")
        .collect(),
    ]);

    const activeNextUpPriorities = nextUpPriorities
      .filter((priority) => priority.isActive)
      .sort((a, b) => a.orderIndex - b.orderIndex);
    const priorities = [...activeNextUpPriorities, ...donePriorities].sort(
      (a, b) => a.orderIndex - b.orderIndex,
    );
    return {
      profile,
      categories: activeNextUpPriorities,
      priorities,
      habits,
      habitCompletions,
      projects,
      intakeListItems,
    };
  },
});
