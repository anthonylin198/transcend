import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

export const deleteIntakeListItem = mutation({
  args: {
    intakeListItemId: v.id("intakeListItems"),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);
    const intakeListItem = await ctx.db.get(args.intakeListItemId);
    if (!intakeListItem || intakeListItem.profileId !== profile._id) {
      throw new Error("Intake item not found");
    }

    await ctx.db.delete(intakeListItem._id);
  },
});
