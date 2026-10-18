import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";
import { MAX_WORKOUT_DESCRIPTION_LENGTH } from "./createWorkoutLog";

export const updateWorkoutLog = mutation({
  args: {
    workoutLogId: v.id("workoutLogs"),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const description = args.description.trim();
    if (!description) {
      throw new Error("Describe your workout");
    }
    if (description.length > MAX_WORKOUT_DESCRIPTION_LENGTH) {
      throw new Error(
        `Workout description must be ${MAX_WORKOUT_DESCRIPTION_LENGTH} characters or fewer`,
      );
    }

    const profile = await getCurrentProfileOrThrow(ctx);
    const workoutLog = await ctx.db.get(args.workoutLogId);
    if (!workoutLog || workoutLog.profileId !== profile._id) {
      throw new Error("Workout not found");
    }

    await ctx.db.patch(workoutLog._id, { description });
  },
});
