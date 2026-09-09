import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";
import { getNextActiveOrderIndex } from "../lib/activeOrderIndex";

function isDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export const setPriorityActive = mutation({
  args: {
    priorityId: v.id("priorities"),
    isActive: v.boolean(),
    activatedAtMs: v.optional(v.number()),
    activeDateKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);

    const priority = await ctx.db.get(args.priorityId);
    if (!priority || priority.profileId !== profile._id) {
      throw new Error("Priority not found");
    }

    const now = Date.now();
    const nextActivatedAt = args.isActive
      ? (args.activatedAtMs ?? now)
      : undefined;
    if (args.isActive && !args.activeDateKey) {
      throw new Error("activeDateKey is required when activating a priority");
    }
    if (args.isActive && args.activeDateKey && !isDateKey(args.activeDateKey)) {
      throw new Error("activeDateKey must be in YYYY-MM-DD format");
    }
    const nextActiveDateKey = args.isActive ? args.activeDateKey : undefined;
    // Newly activated priorities go to the bottom of the active list; an
    // already-active priority keeps its position.
    let nextActiveOrderIndex: number | undefined;
    if (args.isActive) {
      nextActiveOrderIndex = priority.isActive
        ? priority.activeOrderIndex
        : await getNextActiveOrderIndex(ctx, profile._id);
    }
    await ctx.db.patch(priority._id, {
      isActive: args.isActive,
      activatedAt: nextActivatedAt,
      activeDateKey: nextActiveDateKey,
      activeOrderIndex: nextActiveOrderIndex,
      updatedAt: now,
    });
  },
});
