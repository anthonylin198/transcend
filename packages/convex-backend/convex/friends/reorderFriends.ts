import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";
import { findFriendshipBetween } from "../lib/friendships";

export const reorderFriends = mutation({
  args: {
    profileIds: v.array(v.id("profiles")),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);

    const seen = new Set<string>();
    for (const profileId of args.profileIds) {
      if (seen.has(profileId)) {
        throw new Error("Duplicate friend IDs are not allowed");
      }
      seen.add(profileId);

      const friendship = await findFriendshipBetween(
        ctx,
        profile._id,
        profileId,
      );
      if (!friendship || friendship.status !== "accepted") {
        throw new Error("Friend not found");
      }
    }

    await ctx.db.patch(profile._id, { friendOrder: args.profileIds });
  },
});
