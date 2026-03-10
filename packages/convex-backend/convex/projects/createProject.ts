import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);

    const lastProject = await ctx.db
      .query("projects")
      .withIndex("by_profile_id_order", (q) => q.eq("profileId", profile._id))
      .order("desc")
      .first();

    const now = Date.now();
    const orderIndex = lastProject ? lastProject.orderIndex + 1 : 0;

    return await ctx.db.insert("projects", {
      profileId: profile._id,
      name: args.name,
      description: args.description,
      orderIndex,
      createdAt: now,
      updatedAt: now,
    });
  },
});
