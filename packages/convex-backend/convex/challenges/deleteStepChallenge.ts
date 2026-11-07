import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { assertSundayDateKey } from "../lib/dateKey";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";
import { findStepChallenge } from "../lib/stepChallenge";

export const deleteStepChallenge = mutation({
  args: {
    weekStart: v.string(),
  },
  handler: async (ctx, args) => {
    assertSundayDateKey(args.weekStart);
    const profile = await getCurrentProfileOrThrow(ctx);
    const existing = await findStepChallenge(ctx, profile._id, args.weekStart);
    if (!existing) {
      throw new Error("No step challenge for this week");
    }
    if (existing.imageId) {
      await ctx.storage.delete(existing.imageId);
    }
    await ctx.db.delete(existing._id);
  },
});
