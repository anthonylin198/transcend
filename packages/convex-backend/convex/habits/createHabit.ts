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

function normalizeTargetDays(days: string[] | undefined) {
  if (!days) return undefined;
  const uniqueDays = [...new Set(days)];
  const validDays = uniqueDays.filter((day) =>
    WEEK_DAYS.includes(day as (typeof WEEK_DAYS)[number]),
  );
  return validDays.length > 0 ? validDays : undefined;
}

export const createHabit = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    habitType: v.union(v.literal("scheduled"), v.literal("anytime")),
    targetDays: v.optional(v.array(v.string())),
    targetCompletions: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);
    const targetDays = normalizeTargetDays(args.targetDays);

    if (args.habitType === "scheduled" && !targetDays) {
      throw new Error("Scheduled habits require at least one target day");
    }

    if (
      args.habitType === "anytime" &&
      args.targetCompletions !== undefined &&
      args.targetCompletions < 1
    ) {
      throw new Error("Anytime target completions must be at least 1");
    }

    const lastHabit = await ctx.db
      .query("habits")
      .withIndex("by_profile_id_order", (q) => q.eq("profileId", profile._id))
      .order("desc")
      .first();

    const now = Date.now();
    const orderIndex = lastHabit ? lastHabit.orderIndex + 1 : 0;

    return await ctx.db.insert("habits", {
      profileId: profile._id,
      name: args.name,
      description: args.description,
      habitType: args.habitType,
      targetDays: args.habitType === "scheduled" ? targetDays : undefined,
      targetCompletions:
        args.habitType === "anytime"
          ? (args.targetCompletions ?? 1)
          : undefined,
      momentum: 0,
      streakCount: 0,
      orderIndex,
      createdAt: now,
      updatedAt: now,
    });
  },
});
