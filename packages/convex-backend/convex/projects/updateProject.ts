import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.union(v.string(), v.null())),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);

    const project = await ctx.db.get(args.projectId);
    if (!project || project.profileId !== profile._id) {
      throw new Error("Project not found");
    }

    const updates: {
      name?: string;
      description?: string;
      updatedAt: number;
    } = {
      updatedAt: Date.now(),
    };

    if (args.name !== undefined) {
      updates.name = args.name;
    }
    if (args.description !== undefined) {
      updates.description = args.description ?? undefined;
    }

    await ctx.db.patch(project._id, updates);
  },
});
