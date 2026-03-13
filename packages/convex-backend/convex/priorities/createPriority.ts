import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

function isDateKey(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value);
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
    activeDateKey: v.optional(v.string()),
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
    if (isActive && !args.activeDateKey) {
      throw new Error(
        "activeDateKey is required when creating an active priority",
      );
    }
    if (args.activeDateKey && !isDateKey(args.activeDateKey)) {
      throw new Error("activeDateKey must be in YYYY-MM-DD format");
    }
    if (status === "done" && !args.completedDateKey) {
      throw new Error(
        "completedDateKey is required when creating a completed priority",
      );
    }
    if (args.completedDateKey && !isDateKey(args.completedDateKey)) {
      throw new Error("completedDateKey must be in YYYY-MM-DD format");
    }
    const activatedAt = isActive ? (args.activatedAtMs ?? now) : undefined;
    const activeDateKey = isActive ? args.activeDateKey : undefined;
    const completedAt =
      status === "done" ? (args.completedAtMs ?? now) : undefined;
    const completedDateKey =
      status === "done" ? args.completedDateKey : undefined;

    return await ctx.db.insert("priorities", {
      profileId: profile._id,
      projectId: args.projectId,
      name: args.name,
      description: args.description,
      status,
      isActive,
      orderIndex,
      activatedAt,
      activeDateKey,
      completedAt,
      completedDateKey,
      createdAt: now,
      updatedAt: now,
    });
  },
});
