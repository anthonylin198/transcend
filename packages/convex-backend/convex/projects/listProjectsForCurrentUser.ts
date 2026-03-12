import { query } from "../_generated/server";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

export const listProjectsForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const profile = await getCurrentProfileOrThrow(ctx);

    return await ctx.db
      .query("projects")
      .withIndex("by_profile_id_order", (q) => q.eq("profileId", profile._id))
      .collect();
  },
});
