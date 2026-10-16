import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";
import { assertLocalDateKey } from "../lib/dateKey";

const MAX_DESCRIPTION_LENGTH = 500;

export const createWorkoutLog = mutation({
  args: {
    date: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    assertLocalDateKey(args.date);

    const description = args.description.trim();
    if (!description) {
      throw new Error("Describe your workout");
    }
    if (description.length > MAX_DESCRIPTION_LENGTH) {
      throw new Error(
        `Workout description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer`,
      );
    }

    const profile = await getCurrentProfileOrThrow(ctx);
    return await ctx.db.insert("workoutLogs", {
      profileId: profile._id,
      date: args.date,
      description,
      createdAt: Date.now(),
    });
  },
});
