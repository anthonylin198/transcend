import { query } from "../_generated/server";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

export const listIntakeListItemsForCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const profile = await getCurrentProfileOrThrow(ctx);
    return await ctx.db
      .query("intakeListItems")
      .withIndex("by_profile_id_created_at", (q) => q.eq("profileId", profile._id))
      .order("asc")
      .collect();
  },
});
