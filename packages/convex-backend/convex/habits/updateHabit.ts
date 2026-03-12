import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

const WEEK_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

function normalizeTargetDays(days: string[] | null | undefined) {
  if (days === null) return undefined;
  if (!days) return undefined;
  const uniqueDays = [...new Set(days)];
  const validDays = uniqueDays.filter((day) =>
    WEEK_DAYS.includes(day as (typeof WEEK_DAYS)[number]),
  );
  return validDays.length > 0 ? validDays : undefined;
}

export const updateHabit = mutation({
  args: {
    habitId: v.id("habits"),
    name: v.optional(v.string()),
    description: v.optional(v.union(v.string(), v.null())),
    habitType: v.optional(
      v.union(v.literal("scheduled"), v.literal("anytime")),
    ),
    targetDays: v.optional(v.union(v.array(v.string()), v.null())),
    targetCompletions: v.optional(v.union(v.number(), v.null())),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);
    const habit = await ctx.db.get(args.habitId);
    if (!habit || habit.profileId !== profile._id) {
      throw new Error("Habit not found");
    }

    const nextHabitType = args.habitType ?? habit.habitType;
    const nextTargetDays =
      args.targetDays !== undefined
        ? normalizeTargetDays(args.targetDays)
        : habit.targetDays;
    const nextTargetCompletions =
      args.targetCompletions !== undefined
        ? (args.targetCompletions ?? undefined)
        : habit.targetCompletions;

    if (nextHabitType === "scheduled" && !nextTargetDays) {
      throw new Error("Scheduled habits require at least one target day");
    }

    if (
      nextHabitType === "anytime" &&
      nextTargetCompletions !== undefined &&
      nextTargetCompletions < 1
    ) {
      throw new Error("Anytime target completions must be at least 1");
    }

    await ctx.db.patch(habit._id, {
      name: args.name ?? habit.name,
      description:
        args.description !== undefined
          ? (args.description ?? undefined)
          : habit.description,
      habitType: nextHabitType,
      targetDays: nextHabitType === "scheduled" ? nextTargetDays : undefined,
      targetCompletions:
        nextHabitType === "anytime" ? (nextTargetCompletions ?? 1) : undefined,
      updatedAt: Date.now(),
    });
  },
});
