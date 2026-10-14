import { query } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Home bootstrap query used by multiple tabs/views as a shared preload source.
 *
 * It fetches, in parallel:
 * - all next-up priorities (returned in `priorities`), plus active ones in `categories`
 * - habits
 * - projects (without nested priorities)
 * - intake list items
 * - calorie logs inside the same date window (covers the current Sunday–Saturday week)
 * - completed data scoped to a date window (`done` priorities + habit completions)
 *
 * Date range behavior:
 * - `rangeStartDateKey` is inclusive and `rangeEndDateKey` is exclusive.
 * - The range is meant to match the visible pager window on home (first day start -> day after last day start).
 */
export const bootstrap = query({
  args: {
    rangeStartDateKey: v.string(),
    rangeEndDateKey: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return {
        profile: null,
        categories: [],
        priorities: [],
        habits: [],
        habitCompletions: [],
        projects: [],
        intakeListItems: [],
        calorieLogs: [],
      };
    }

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
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
        calorieLogs: [],
      };
    }

    const [
      nextUpPriorities,
      donePriorities,
      habits,
      habitCompletions,
      projects,
      intakeListItems,
      calorieLogs,
    ] = await Promise.all([
      ctx.db
        .query("priorities")
        .withIndex("by_profile_id_status", (q) =>
          q.eq("profileId", profile._id).eq("status", "next_up"),
        )
        .collect(),
      ctx.db
        .query("priorities")
        .withIndex("by_profile_id_status_completed_date_key", (q) =>
          q
            .eq("profileId", profile._id)
            .eq("status", "done")
            .gte("completedDateKey", args.rangeStartDateKey)
            .lt("completedDateKey", args.rangeEndDateKey),
        )
        .collect(),
      ctx.db
        .query("habits")
        .withIndex("by_profile_id_order", (q) => q.eq("profileId", profile._id))
        .collect(),
      ctx.db
        .query("habitCompletions")
        .withIndex("by_profile_id_date_key", (q) =>
          q
            .eq("profileId", profile._id)
            .gte("dateKey", args.rangeStartDateKey)
            .lt("dateKey", args.rangeEndDateKey),
        )
        .collect(),
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
      ctx.db
        .query("calorieLogs")
        .withIndex("by_profile_id_date", (q) =>
          q
            .eq("profileId", profile._id)
            .gte("date", args.rangeStartDateKey)
            .lt("date", args.rangeEndDateKey),
        )
        .collect(),
    ]);

    const activeNextUpPriorities = nextUpPriorities
      .filter((priority) => priority.isActive)
      .sort((a, b) => a.orderIndex - b.orderIndex);
    const priorities = [...nextUpPriorities, ...donePriorities].sort(
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
      calorieLogs,
    };
  },
});
