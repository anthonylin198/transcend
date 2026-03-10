import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

export const reorderPriorities = mutation({
  args: {
    priorityIds: v.array(v.id("priorities")),
    projectId: v.optional(v.union(v.id("projects"), v.null())),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);
    const now = Date.now();

    let expectedProjectId: typeof args.projectId;
    if (args.projectId === null) {
      expectedProjectId = undefined;
    } else {
      expectedProjectId = args.projectId;
    }

    if (expectedProjectId !== undefined) {
      const project = await ctx.db.get(expectedProjectId);
      if (!project || project.profileId !== profile._id) {
        throw new Error("Project not found");
      }
    }

    const seen = new Set<string>();
    for (const id of args.priorityIds) {
      if (seen.has(id)) {
        throw new Error("Duplicate priority IDs are not allowed");
      }
      seen.add(id);
    }

    for (const [orderIndex, priorityId] of args.priorityIds.entries()) {
      const priority = await ctx.db.get(priorityId);
      if (!priority || priority.profileId !== profile._id) {
        throw new Error("Priority not found");
      }

      if (expectedProjectId !== undefined && priority.projectId !== expectedProjectId) {
        throw new Error("Priority does not belong to the requested project");
      }

      if (expectedProjectId === undefined && priority.projectId !== undefined) {
        throw new Error("Priority is linked to a project");
      }

      await ctx.db.patch(priority._id, {
        orderIndex,
        updatedAt: now,
      });
    }
  },
});
