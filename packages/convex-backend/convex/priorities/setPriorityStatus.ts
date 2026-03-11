import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

function toIsoDateKey(valueMs: number) {
  return new Date(valueMs).toISOString().slice(0, 10);
}

export const setPriorityStatus = mutation({
  args: {
    priorityId: v.id("priorities"),
    status: v.union(v.literal("todo"), v.literal("next_up"), v.literal("done")),
    completedAtMs: v.optional(v.number()),
    completedDateKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);

    const priority = await ctx.db.get(args.priorityId);
    if (!priority || priority.profileId !== profile._id) {
      throw new Error("Priority not found");
    }

    const now = Date.now();
    const completedAt =
      args.status === "done"
        ? (args.completedAtMs ?? priority.completedAt ?? now)
        : undefined;
    await ctx.db.patch(priority._id, {
      status: args.status,
      completedAt,
      completedDateKey:
        args.status === "done"
          ? (args.completedDateKey ??
            priority.completedDateKey ??
            toIsoDateKey(completedAt))
          : undefined,
      updatedAt: now,
    });
  },
});
