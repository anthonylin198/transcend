import type { Doc, Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type Ctx = QueryCtx | MutationCtx;

export const findFriendshipBetween = async (
  ctx: Ctx,
  profileA: Id<"profiles">,
  profileB: Id<"profiles">,
) => {
  const forward = await ctx.db
    .query("friendships")
    .withIndex("by_pair", (q) =>
      q.eq("requesterProfileId", profileA).eq("addresseeProfileId", profileB),
    )
    .first();
  if (forward) return forward;

  return await ctx.db
    .query("friendships")
    .withIndex("by_pair", (q) =>
      q.eq("requesterProfileId", profileB).eq("addresseeProfileId", profileA),
    )
    .first();
};

export const listFriendshipsWithStatus = async (
  ctx: Ctx,
  profileId: Id<"profiles">,
  status: "pending" | "accepted",
) => {
  const [sent, received] = await Promise.all([
    ctx.db
      .query("friendships")
      .withIndex("by_requester_status", (q) =>
        q.eq("requesterProfileId", profileId).eq("status", status),
      )
      .collect(),
    ctx.db
      .query("friendships")
      .withIndex("by_addressee_status", (q) =>
        q.eq("addresseeProfileId", profileId).eq("status", status),
      )
      .collect(),
  ]);
  return { sent, received };
};

export const friendSince = (friendship: Doc<"friendships">) =>
  friendship.respondedAt ?? friendship.createdAt;

export const sortByFriendOrder = <
  T extends { profileId: Id<"profiles">; since: number },
>(
  items: T[],
  friendOrder: Id<"profiles">[] | undefined,
) => {
  const rank = new Map(friendOrder?.map((id, index) => [id, index]));
  return [...items].sort((a, b) => {
    const rankA = rank.get(a.profileId);
    const rankB = rank.get(b.profileId);
    if (rankA !== undefined && rankB !== undefined) return rankA - rankB;
    if (rankA !== undefined) return -1;
    if (rankB !== undefined) return 1;
    return a.since - b.since;
  });
};

/** Accepted friends of `profile`, in that profile's chosen order. */
export const listOrderedFriendProfileIds = async (
  ctx: Ctx,
  profile: Doc<"profiles">,
) => {
  const { sent, received } = await listFriendshipsWithStatus(
    ctx,
    profile._id,
    "accepted",
  );
  const friends = [
    ...sent.map((friendship) => ({
      profileId: friendship.addresseeProfileId,
      since: friendSince(friendship),
    })),
    ...received.map((friendship) => ({
      profileId: friendship.requesterProfileId,
      since: friendSince(friendship),
    })),
  ];
  return sortByFriendOrder(friends, profile.friendOrder).map(
    (friend) => friend.profileId,
  );
};
