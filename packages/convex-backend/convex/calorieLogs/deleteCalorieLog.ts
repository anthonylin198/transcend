import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

export const deleteCalorieLog = mutation({
  args: {
    calorieLogId: v.id("calorieLogs"),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);
    const calorieLog = await ctx.db.get(args.calorieLogId);
    if (!calorieLog || calorieLog.profileId !== profile._id) {
      throw new Error("Calorie log not found");
    }

    await ctx.db.delete(calorieLog._id);
  },
});
