import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

export const deleteHabit = mutation({
  args: {
    habitId: v.id("habits"),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);
    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.profileId !== profile._id) {
      throw new Error("Habit not found");
    }

    const completions = await ctx.db
      .query("habitCompletions")
      .withIndex("by_habit_id_date_key", (q) => q.eq("habitId", habit._id))
      .collect();
    await Promise.all(
      completions.map((completion) => ctx.db.delete(completion._id)),
    );

    await ctx.db.delete(habit._id);
  },
});
