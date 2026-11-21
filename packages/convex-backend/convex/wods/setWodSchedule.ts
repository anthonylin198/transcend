import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";
import { assertDateKey, assertScheduleLength } from "../lib/wod";

export const setWodSchedule = mutation({
  args: {
    cycleStart: v.string(),
    wodSlugs: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    await getCurrentProfileOrThrow(ctx);
    assertScheduleLength(args.wodSlugs.length);
    const cycleStart = assertDateKey(args.cycleStart);

    for (const slug of args.wodSlugs) {
      const wod = await ctx.db
        .query("wods")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .unique();
      if (!wod) {
        throw new Error("That schedule includes a workout that does not exist");
      }
    }

    const existing = await ctx.db
      .query("wodSchedules")
      .withIndex("by_key", (q) => q.eq("key", "default"))
      .unique();
    const patch = {
      cycleStart,
      wodSlugs: args.wodSlugs,
      updatedAt: Date.now(),
    };
    if (existing) {
      await ctx.db.patch(existing._id, patch);
      return;
    }
    await ctx.db.insert("wodSchedules", {
      key: "default",
      ...patch,
    });
  },
});
