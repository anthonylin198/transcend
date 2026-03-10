import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

export const setPriorityStatus = mutation({
  args: {
    priorityId: v.id("priorities"),
    status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("done")),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);

    const priority = await ctx.db.get(args.priorityId);
    if (!priority || priority.profileId !== profile._id) {
      throw new Error("Priority not found");
    }

    const now = Date.now();
    await ctx.db.patch(priority._id, {
      status: args.status,
      completedAt:
        args.status === "done" ? (priority.completedAt ?? now) : undefined,
      updatedAt: now,
    });
  },
});
