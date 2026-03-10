import { query } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

export const listPrioritiesForCurrentUser = query({
  args: {
    status: v.optional(
      v.union(v.literal("todo"), v.literal("next_up"), v.literal("done")),
    ),
    isActive: v.optional(v.boolean()),
    unlinkedOnly: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);

    if (args.unlinkedOnly) {
      const priorities = await ctx.db
        .query("priorities")
        .withIndex("by_profile_id_project_id", (q) =>
          q.eq("profileId", profile._id).eq("projectId", undefined),
        )
        .collect();

      return priorities
        .filter((priority) =>
          args.status !== undefined ? priority.status === args.status : true,
        )
        .filter((priority) =>
          args.isActive !== undefined ? priority.isActive === args.isActive : true,
        )
        .sort((a, b) => a.orderIndex - b.orderIndex);
    }

    if (args.status !== undefined) {
      const priorities = await ctx.db
        .query("priorities")
        .withIndex("by_profile_id_status", (q) =>
          q.eq("profileId", profile._id).eq("status", args.status!),
        )
        .collect();

      return priorities
        .filter((priority) =>
          args.isActive !== undefined ? priority.isActive === args.isActive : true,
        )
        .sort((a, b) => a.orderIndex - b.orderIndex);
    }

    if (args.isActive !== undefined) {
      const priorities = await ctx.db
        .query("priorities")
        .withIndex("by_profile_id_is_active", (q) =>
          q.eq("profileId", profile._id).eq("isActive", args.isActive!),
        )
        .collect();

      return priorities.sort((a, b) => a.orderIndex - b.orderIndex);
    }

    return await ctx.db
      .query("priorities")
      .withIndex("by_profile_id_order", (q) => q.eq("profileId", profile._id))
      .collect();
  },
});
