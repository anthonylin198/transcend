import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

/**
 * Reorders the home-screen active priorities list. The list can include done
 * priorities (they keep their slot among active ones), so only ownership is
 * validated. activeOrderIndex is assigned from array position.
 */
export const reorderActivePriorities = mutation({
  args: {
    priorityIds: v.array(v.id("priorities")),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);
    const now = Date.now();

    const seen = new Set<string>();
    for (const id of args.priorityIds) {
      if (seen.has(id)) {
        throw new Error("Duplicate priority IDs are not allowed");
      }
      seen.add(id);
    }

    for (const [activeOrderIndex, priorityId] of args.priorityIds.entries()) {
      const priority = await ctx.db.get(priorityId);
      if (!priority || priority.profileId !== profile._id) {
        throw new Error("Priority not found");
      }

      await ctx.db.patch(priority._id, {
        activeOrderIndex,
        updatedAt: now,
      });
    }
  },
});
