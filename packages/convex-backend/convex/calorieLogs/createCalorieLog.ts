import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";
import { assertLocalDateKey } from "../lib/dateKey";

export const createCalorieLog = mutation({
  args: {
    date: v.string(),
    calories: v.number(),
    proteinG: v.number(),
  },
  handler: async (ctx, args) => {
    assertLocalDateKey(args.date);

    if (!Number.isInteger(args.calories) || args.calories < 0) {
      throw new Error("Calories must be a whole number of 0 or more");
    }

    if (!Number.isFinite(args.proteinG) || args.proteinG < 0) {
      throw new Error("Protein must be 0 or more");
    }

    const profile = await getCurrentProfileOrThrow(ctx);
    return await ctx.db.insert("calorieLogs", {
      profileId: profile._id,
      date: args.date,
      calories: args.calories,
      proteinG: Math.round(args.proteinG * 10) / 10,
      createdAt: Date.now(),
    });
  },
});
