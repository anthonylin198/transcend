import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

/** Removes an accepted friend, or cancels a request either side of it. */
export const removeFriend = mutation({
  args: {
    friendshipId: v.id("friendships"),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);
    const friendship = await ctx.db.get(args.friendshipId);
    if (
      !friendship ||
      (friendship.requesterProfileId !== profile._id &&
        friendship.addresseeProfileId !== profile._id)
    ) {
      throw new Error("Friend not found");
    }

    await ctx.db.delete(friendship._id);
  },
});
