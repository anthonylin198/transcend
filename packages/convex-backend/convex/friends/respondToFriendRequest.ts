import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

export const respondToFriendRequest = mutation({
  args: {
    friendshipId: v.id("friendships"),
    accept: v.boolean(),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);
    const friendship = await ctx.db.get(args.friendshipId);
    if (
      !friendship ||
      friendship.status !== "pending" ||
      friendship.addresseeProfileId !== profile._id
    ) {
      throw new Error("Friend request not found");
    }

    if (!args.accept) {
      await ctx.db.delete(friendship._id);
      return;
    }

    await ctx.db.patch(friendship._id, {
      status: "accepted",
      respondedAt: Date.now(),
    });
  },
});
