import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";
import { assertLocalDateKey } from "../lib/dateKey";

const MAX_DAYS = 31;
const MAX_STEPS = 250_000;

export const setDailyActivity = mutation({
  args: {
    days: v.array(
      v.object({
        date: v.string(),
        steps: v.number(),
      }),
    ),
  },
  handler: async (ctx, args) => {
    if (args.days.length > MAX_DAYS) {
      throw new Error(`Save at most ${MAX_DAYS} days at a time`);
    }

    const profile = await getCurrentProfileOrThrow(ctx);
    const now = Date.now();

    for (const day of args.days) {
      assertLocalDateKey(day.date);
      if (
        !Number.isInteger(day.steps) ||
        day.steps < 0 ||
        day.steps > MAX_STEPS
      ) {
        throw new Error("Steps must be a whole number of 0 or more");
      }

      const existing = await ctx.db
        .query("dailyActivity")
        .withIndex("by_profile_id_date", (q) =>
          q.eq("profileId", profile._id).eq("date", day.date),
        )
        .unique();

      if (existing) {
        if (existing.steps === day.steps) continue;
        await ctx.db.patch(existing._id, {
          steps: day.steps,
          updatedAt: now,
        });
        continue;
      }

      await ctx.db.insert("dailyActivity", {
        profileId: profile._id,
        date: day.date,
        steps: day.steps,
        updatedAt: now,
      });
    }
  },
});
