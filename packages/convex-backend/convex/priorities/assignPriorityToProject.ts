import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

export const assignPriorityToProject = mutation({
  args: {
    priorityId: v.id("priorities"),
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);

    const [priority, project] = await Promise.all([
      ctx.db.get(args.priorityId),
      ctx.db.get(args.projectId),
    ]);

    if (!priority || priority.profileId !== profile._id) {
      throw new Error("Priority not found");
    }
    if (!project || project.profileId !== profile._id) {
      throw new Error("Project not found");
    }
    if (priority.profileId !== project.profileId) {
      throw new Error("Priority and project must belong to the same profile");
    }

    await ctx.db.patch(priority._id, {
      projectId: project._id,
      updatedAt: Date.now(),
    });
  },
});
