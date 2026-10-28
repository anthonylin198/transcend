import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";
import { assertLocalDateKey } from "../lib/dateKey";

export function normalizePounds(value: number) {
  if (!Number.isFinite(value) || value <= 0 || value > 1500) {
    throw new Error("Weight must be greater than 0 and at most 1500 lb");
  }

  const pounds = Math.round(value * 10) / 10;
  if (pounds <= 0 || pounds > 1500) {
    throw new Error("Weight must be greater than 0 and at most 1500 lb");
  }
  return pounds;
}

export const setWeightLog = mutation({
  args: {
    weekStart: v.string(),
    pounds: v.number(),
  },
  handler: async (ctx, args) => {
    assertLocalDateKey(args.weekStart);
    const pounds = normalizePounds(args.pounds);
    const profile = await getCurrentProfileOrThrow(ctx);
    const existing = await ctx.db
      .query("weightLogs")
      .withIndex("by_profile_id_week_start", (q) =>
        q.eq("profileId", profile._id).eq("weekStart", args.weekStart),
      )
      .unique();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { pounds, updatedAt: now });
      return existing._id;
    }

    return await ctx.db.insert("weightLogs", {
      profileId: profile._id,
      weekStart: args.weekStart,
      pounds,
      createdAt: now,
      updatedAt: now,
    });
  },
});
