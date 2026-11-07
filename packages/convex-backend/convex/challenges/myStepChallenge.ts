import { query } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { assertSundayDateKey } from "../lib/dateKey";
import { findStepChallenge } from "../lib/stepChallenge";

export const myStepChallenge = query({
  args: {
    weekStart: v.string(),
  },
  handler: async (ctx, args) => {
    assertSundayDateKey(args.weekStart);
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) return null;

    const challenge = await findStepChallenge(ctx, profile._id, args.weekStart);
    if (!challenge) return null;

    return {
      goalSteps: challenge.goalSteps,
      name: challenge.name ?? "",
      imageUrl: challenge.imageId
        ? await ctx.storage.getUrl(challenge.imageId)
        : null,
    };
  },
});
