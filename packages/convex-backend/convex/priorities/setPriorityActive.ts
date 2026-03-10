import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

export const setPriorityActive = mutation({
  args: {
    priorityId: v.id("priorities"),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);

    const priority = await ctx.db.get(args.priorityId);
    if (!priority || priority.profileId !== profile._id) {
      throw new Error("Priority not found");
    }

    const now = Date.now();
    await ctx.db.patch(priority._id, {
      isActive: args.isActive,
      activatedAt:
        args.isActive && priority.activatedAt === undefined
          ? now
          : priority.activatedAt,
      updatedAt: now,
    });
  },
});
