import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

export const setHabitCompletion = mutation({
  args: {
    habitId: v.id("habits"),
    dateKey: v.string(),
    completed: v.boolean(),
    completedAtMs: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);
    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.profileId !== profile._id) {
      throw new Error("Habit not found");
    }

    const existingCompletion = await ctx.db
      .query("habitCompletions")
      .withIndex("by_habit_id_date_key", (q) =>
        q.eq("habitId", habit._id).eq("dateKey", args.dateKey),
      )
      .unique();

    if (args.completed) {
      const now = Date.now();
      if (!existingCompletion) {
        await ctx.db.insert("habitCompletions", {
          profileId: profile._id,
          habitId: habit._id,
          dateKey: args.dateKey,
          completedAt: args.completedAtMs ?? now,
          createdAt: now,
          updatedAt: now,
        });
      } else {
        await ctx.db.patch(existingCompletion._id, {
          completedAt: args.completedAtMs ?? existingCompletion.completedAt,
          updatedAt: now,
        });
      }
      return;
    }

    if (existingCompletion) {
      await ctx.db.delete(existingCompletion._id);
    }
  },
});
