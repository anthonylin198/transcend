import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

export const updateIntakeListItem = mutation({
  args: {
    intakeListItemId: v.id("intakeListItems"),
    title: v.optional(v.string()),
    description: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);
    const intakeListItem = await ctx.db.get(args.intakeListItemId);
    if (!intakeListItem || intakeListItem.profileId !== profile._id) {
      throw new Error("Intake item not found");
    }

    const nextTitle =
      args.title !== undefined ? args.title.trim() : intakeListItem.title;
    if (!nextTitle) {
      throw new Error("Title is required");
    }

    const nextDescription =
      args.description !== undefined
        ? args.description?.trim() || undefined
        : intakeListItem.description;

    await ctx.db.patch(intakeListItem._id, {
      title: nextTitle,
      description: nextDescription,
      updatedAt: Date.now(),
    });
  },
});
