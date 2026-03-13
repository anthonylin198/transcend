import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

function toDateKey(value: number) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
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
    const nextActiveDateKey = args.isActive
      ? (args.activeDateKey ?? toDateKey(nextActivatedAt ?? now))
      : undefined;
    await ctx.db.patch(priority._id, {
      isActive: args.isActive,
      activatedAt: nextActivatedAt,
      activeDateKey: nextActiveDateKey,
      updatedAt: now,
    });
  },
});
