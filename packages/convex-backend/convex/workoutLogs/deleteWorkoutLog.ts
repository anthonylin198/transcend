import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

export const deleteWorkoutLog = mutation({
  args: {
    workoutLogId: v.id("workoutLogs"),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);
    const workoutLog = await ctx.db.get(args.workoutLogId);
    if (!workoutLog || workoutLog.profileId !== profile._id) {
      throw new Error("Workout not found");
    }

    await ctx.db.delete(workoutLog._id);
  },
});
