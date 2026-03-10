import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

export const createIntakeListItem = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);
    const title = args.title.trim();
    const description = args.description?.trim();

    if (!title) {
      throw new Error("Title is required");
    }

    const now = Date.now();
    return await ctx.db.insert("intakeListItems", {
      profileId: profile._id,
      title,
      description: description && description.length > 0 ? description : undefined,
      completed: false,
      createdAt: now,
      updatedAt: now,
      completedAt: undefined,
    });
  },
});
