import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";
import { normalizeCalorieDescription } from "./createCalorieLog";

export const updateCalorieLog = mutation({
  args: {
    calorieLogId: v.id("calorieLogs"),
    calories: v.number(),
    proteinG: v.number(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (!Number.isInteger(args.calories) || args.calories < 0) {
      throw new Error("Calories must be a whole number of 0 or more");
    }

    if (!Number.isFinite(args.proteinG) || args.proteinG < 0) {
      throw new Error("Protein must be 0 or more");
    }

    const profile = await getCurrentProfileOrThrow(ctx);
    const calorieLog = await ctx.db.get(args.calorieLogId);
    if (!calorieLog || calorieLog.profileId !== profile._id) {
      throw new Error("Calorie log not found");
    }

    await ctx.db.patch(calorieLog._id, {
      calories: args.calories,
      proteinG: Math.round(args.proteinG * 10) / 10,
      description: normalizeCalorieDescription(args.description),
    });
  },
});
