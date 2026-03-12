import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

function toIsoDateKey(valueMs: number) {
  return new Date(valueMs).toISOString().slice(0, 10);
}

export const reorderPriorities = mutation({
  args: {
    items: v.array(
      v.object({
        priorityId: v.id("priorities"),
        status: v.union(
          v.literal("todo"),
          v.literal("next_up"),
          v.literal("done"),
        ),
      }),
    ),
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
    for (const item of args.items) {
      if (seen.has(item.priorityId)) {
        throw new Error("Duplicate priority IDs are not allowed");
      }
      seen.add(item.priorityId);
    }

    for (const [orderIndex, item] of args.items.entries()) {
      const priority = await ctx.db.get(item.priorityId);
      if (!priority || priority.profileId !== profile._id) {
        throw new Error("Priority not found");
      }

      if (
        expectedProjectId !== undefined &&
        priority.projectId !== expectedProjectId
      ) {
        throw new Error("Priority does not belong to the requested project");
      }

      if (expectedProjectId === undefined && priority.projectId !== undefined) {
        throw new Error("Priority is linked to a project");
      }

      const completedAt =
        item.status === "done" ? (priority.completedAt ?? now) : undefined;
      await ctx.db.patch(priority._id, {
        status: item.status,
        completedAt,
        completedDateKey:
          item.status === "done"
            ? (priority.completedDateKey ?? toIsoDateKey(completedAt ?? now))
            : undefined,
        orderIndex,
        updatedAt: now,
      });
    }
  },
});
