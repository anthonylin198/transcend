import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

export const reorderHabits = mutation({
  args: {
    habitIds: v.array(v.id("habits")),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);
    const now = Date.now();

    const seen = new Set<string>();
    for (const id of args.habitIds) {
      if (seen.has(id)) {
        throw new Error("Duplicate habit IDs are not allowed");
      }
      seen.add(id);
    }

    for (const [orderIndex, habitId] of args.habitIds.entries()) {
      const habit = await ctx.db.get(habitId);
      if (!habit || habit.profileId !== profile._id) {
        throw new Error("Habit not found");
      }

      await ctx.db.patch(habit._id, {
        orderIndex,
        updatedAt: now,
      });
    }
  },
});
