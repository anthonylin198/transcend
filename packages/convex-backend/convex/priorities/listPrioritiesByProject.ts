import { query } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

export const listPrioritiesByProject = query({
  args: {
    projectId: v.id("projects"),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);

    const project = await ctx.db.get(args.projectId);
    if (!project || project.profileId !== profile._id) {
      throw new Error("Project not found");
    }

    const priorities = await ctx.db
      .query("priorities")
      .withIndex("by_project_id", (q) => q.eq("projectId", args.projectId))
      .collect();

    return priorities.sort((a, b) => a.orderIndex - b.orderIndex);
  },
});
