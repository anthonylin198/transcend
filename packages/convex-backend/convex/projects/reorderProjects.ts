import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

export const reorderProjects = mutation({
  args: {
    projectIds: v.array(v.id("projects")),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);
    const now = Date.now();

    const seen = new Set<string>();
    for (const id of args.projectIds) {
      if (seen.has(id)) {
        throw new Error("Duplicate project IDs are not allowed");
      }
      seen.add(id);
    }

    for (const [orderIndex, projectId] of args.projectIds.entries()) {
      const project = await ctx.db.get(projectId);
      if (!project || project.profileId !== profile._id) {
        throw new Error("Project not found");
      }

      await ctx.db.patch(project._id, {
        orderIndex,
        updatedAt: now,
      });
    }
  },
});
