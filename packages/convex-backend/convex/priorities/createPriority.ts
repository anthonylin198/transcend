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

export const createPriority = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
    status: v.optional(
      v.union(v.literal("todo"), v.literal("next_up"), v.literal("done")),
    ),
    isActive: v.optional(v.boolean()),
    activatedAtMs: v.optional(v.number()),
    completedAtMs: v.optional(v.number()),
    completedDateKey: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);

    if (args.projectId !== undefined) {
      const project = await ctx.db.get(args.projectId);
      if (!project || project.profileId !== profile._id) {
        throw new Error("Project not found");
      }
    }

    const lastPriority = await ctx.db
      .query("priorities")
      .withIndex("by_profile_id_order", (q) => q.eq("profileId", profile._id))
      .order("desc")
      .first();

    const now = Date.now();
    const orderIndex = lastPriority ? lastPriority.orderIndex + 1 : 0;
    const status = args.status ?? "todo";
    const isActive = args.isActive ?? false;
    const activatedAt = isActive ? (args.activatedAtMs ?? now) : undefined;
    const completedAt =
      status === "done" ? (args.completedAtMs ?? now) : undefined;
    const completedDateKey =
      status === "done"
        ? (args.completedDateKey ?? toDateKey(completedAt ?? now))
        : undefined;

    return await ctx.db.insert("priorities", {
      profileId: profile._id,
      projectId: args.projectId,
      name: args.name,
      description: args.description,
      status,
      isActive,
      orderIndex,
      activatedAt,
      completedAt,
      completedDateKey,
      createdAt: now,
      updatedAt: now,
    });
  },
});
