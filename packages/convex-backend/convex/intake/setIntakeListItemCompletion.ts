import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

export const setIntakeListItemCompletion = mutation({
  args: {
    intakeListItemId: v.id("intakeListItems"),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);
    const intakeListItem = await ctx.db.get(args.intakeListItemId);
    if (!intakeListItem || intakeListItem.profileId !== profile._id) {
      throw new Error("Intake item not found");
    }

    const now = Date.now();
    await ctx.db.patch(intakeListItem._id, {
      completed: args.completed,
      completedAt: args.completed ? now : undefined,
      updatedAt: now,
    });
  },
});
