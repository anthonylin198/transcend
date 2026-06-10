import { query } from "../_generated/server";
import { paginationOptsValidator } from "convex/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

/**
 * Paginated list of done priorities in manual (orderIndex) order, matching
 * the drag-to-reorder semantics of the rest of the priority list.
 * Pass a projectId for a project's priorities, or omit it for unlinked ones.
 */
export const listDonePriorities = query({
  args: {
    projectId: v.optional(v.id("projects")),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);

    if (args.projectId !== undefined) {
      const project = await ctx.db.get(args.projectId);
      if (!project || project.profileId !== profile._id) {
        throw new Error("Project not found");
      }

      return await ctx.db
        .query("priorities")
        .withIndex("by_project_id_status_order", (q) =>
          q.eq("projectId", args.projectId).eq("status", "done"),
        )
        .paginate(args.paginationOpts);
    }

    return await ctx.db
      .query("priorities")
      .withIndex("by_profile_id_status_order", (q) =>
        q.eq("profileId", profile._id).eq("status", "done"),
      )
      .filter((q) => q.eq(q.field("projectId"), undefined))
      .paginate(args.paginationOpts);
  },
});
