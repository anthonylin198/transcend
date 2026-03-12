import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

export const unassignPriorityFromProject = mutation({
  args: {
    priorityId: v.id("priorities"),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);

    const priority = await ctx.db.get(args.priorityId);
    if (!priority || priority.profileId !== profile._id) {
      throw new Error("Priority not found");
    }

    await ctx.db.patch(priority._id, {
      projectId: undefined,
      updatedAt: Date.now(),
    });
  },
});
