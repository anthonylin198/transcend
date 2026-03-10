import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

export const createPriority = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    projectId: v.optional(v.id("projects")),
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

    return await ctx.db.insert("priorities", {
      profileId: profile._id,
      projectId: args.projectId,
      name: args.name,
      description: args.description,
      status: "todo",
      isActive: false,
      orderIndex,
      createdAt: now,
      updatedAt: now,
    });
  },
});
