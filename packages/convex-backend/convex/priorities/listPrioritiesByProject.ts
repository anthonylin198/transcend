import { query } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

export const listPrioritiesByProject = query({
  args: {
    projectId: v.id("projects"),
    excludeDone: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);

    const project = await ctx.db.get(args.projectId);
    if (!project || project.profileId !== profile._id) {
      throw new Error("Project not found");
    }

    let dbQuery = ctx.db
      .query("priorities")
      .withIndex("by_project_id", (q) => q.eq("projectId", args.projectId));
    if (args.excludeDone) {
      dbQuery = dbQuery.filter((q) => q.neq(q.field("status"), "done"));
    }
    const priorities = await dbQuery.collect();

    return priorities.sort((a, b) => a.orderIndex - b.orderIndex);
  },
});
