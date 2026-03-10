import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

export const deleteProject = mutation({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);

    const project = await ctx.db.get(args.projectId);
    if (!project || project.profileId !== profile._id) {
      throw new Error("Project not found");
    }

    const now = Date.now();
    const linkedPriorities = await ctx.db
      .query("priorities")
      .withIndex("by_project_id", (q) => q.eq("projectId", project._id))
      .collect();

    for (const priority of linkedPriorities) {
      if (priority.profileId !== profile._id) {
        continue;
      }

      await ctx.db.patch(priority._id, {
        projectId: undefined,
        updatedAt: now,
      });
    }

    await ctx.db.delete(project._id);
  },
});
