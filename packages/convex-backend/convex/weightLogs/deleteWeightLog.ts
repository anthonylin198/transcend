import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";
import { assertLocalDateKey } from "../lib/dateKey";

export const deleteWeightLog = mutation({
  args: {
    weekStart: v.string(),
  },
  handler: async (ctx, args) => {
    assertLocalDateKey(args.weekStart);
    const profile = await getCurrentProfileOrThrow(ctx);
    const existing = await ctx.db
      .query("weightLogs")
      .withIndex("by_profile_id_week_start", (q) =>
        q.eq("profileId", profile._id).eq("weekStart", args.weekStart),
      )
      .unique();
    if (!existing) return;

    await ctx.db.delete(existing._id);
  },
});
