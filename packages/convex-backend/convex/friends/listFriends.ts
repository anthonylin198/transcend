import { query } from "../_generated/server";
import type { QueryCtx } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  friendSince,
  listFriendshipsWithStatus,
  sortByFriendOrder,
} from "../lib/friendships";

const toEntry = async (
  ctx: QueryCtx,
  friendship: Doc<"friendships">,
  otherProfileId: Id<"profiles">,
) => {
  const other = await ctx.db.get(otherProfileId);
  return {
    friendshipId: friendship._id,
    profileId: otherProfileId,
    displayName: other?.displayName ?? null,
    createdAt: friendship.createdAt,
    since: friendSince(friendship),
  };
};

export const listFriends = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) return null;

    const [accepted, pending] = await Promise.all([
      listFriendshipsWithStatus(ctx, profile._id, "accepted"),
      listFriendshipsWithStatus(ctx, profile._id, "pending"),
    ]);

    const [friends, incoming, outgoing] = await Promise.all([
      Promise.all([
        ...accepted.sent.map((f) => toEntry(ctx, f, f.addresseeProfileId)),
        ...accepted.received.map((f) => toEntry(ctx, f, f.requesterProfileId)),
      ]),
      Promise.all(
        pending.received.map((f) => toEntry(ctx, f, f.requesterProfileId)),
      ),
      Promise.all(
        pending.sent.map((f) => toEntry(ctx, f, f.addresseeProfileId)),
      ),
    ]);

    return {
      me: { profileId: profile._id, displayName: profile.displayName ?? null },
      friends: sortByFriendOrder(friends, profile.friendOrder),
      incoming: incoming.sort((a, b) => b.createdAt - a.createdAt),
      outgoing: outgoing.sort((a, b) => b.createdAt - a.createdAt),
    };
  },
});
