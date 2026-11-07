import { query } from "../_generated/server";
import type { Doc, Id } from "../_generated/dataModel";
import type { QueryCtx } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import {
  addDaysToDateKey,
  assertLocalDateKey,
  assertSundayDateKey,
} from "../lib/dateKey";
import { listOrderedFriendProfileIds } from "../lib/friendships";
import { findStepChallenge } from "../lib/stepChallenge";

const displayNameOf = (profile: Doc<"profiles"> | null) =>
  profile?.displayName?.trim() || "Unnamed";

const newerChallenge = (
  current: Doc<"stepChallenges">,
  candidate: Doc<"stepChallenges">,
) => {
  if (candidate.createdAt !== current.createdAt) {
    return candidate.createdAt > current.createdAt ? candidate : current;
  }
  return candidate._id > current._id ? candidate : current;
};

const stepsForDate = async (
  ctx: QueryCtx,
  profileId: Id<"profiles">,
  date: string,
) => {
  const day = await ctx.db
    .query("dailyActivity")
    .withIndex("by_profile_id_date", (q) =>
      q.eq("profileId", profileId).eq("date", date),
    )
    .unique();
  return day?.steps ?? 0;
};

const stepsForWeek = async (
  ctx: QueryCtx,
  profileId: Id<"profiles">,
  weekStart: string,
  weekEnd: string,
) => {
  const days = await ctx.db
    .query("dailyActivity")
    .withIndex("by_profile_id_date", (q) =>
      q.eq("profileId", profileId).gte("date", weekStart).lte("date", weekEnd),
    )
    .collect();
  return days.reduce((sum, day) => sum + day.steps, 0);
};

/**
 * The step challenge the viewer should see for a Sunday week.
 * Candidates are the viewer's own challenge and one from each accepted friend.
 * The newest created challenge wins. Its total is the creator's steps plus
 * the creator's accepted friends, so everyone looking at that challenge sees
 * the same people.
 */
export const stepChallengeForWeek = query({
  args: {
    weekStart: v.string(),
    today: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    assertSundayDateKey(args.weekStart);
    if (args.today) assertLocalDateKey(args.today);
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) return null;

    const friendIds = await listOrderedFriendProfileIds(ctx, profile);
    const challenges = (
      await Promise.all(
        [profile._id, ...friendIds].map((creatorProfileId) =>
          findStepChallenge(ctx, creatorProfileId, args.weekStart),
        ),
      )
    ).filter((challenge) => challenge !== null);
    const winner = challenges.reduce<Doc<"stepChallenges"> | null>(
      (current, challenge) =>
        current === null ? challenge : newerChallenge(current, challenge),
      null,
    );
    if (!winner) return null;

    const creator =
      winner.creatorProfileId === profile._id
        ? profile
        : await ctx.db.get(winner.creatorProfileId);
    if (!creator) return null;

    const participantIds = [
      creator._id,
      ...(await listOrderedFriendProfileIds(ctx, creator)),
    ];
    const weekEnd = addDaysToDateKey(args.weekStart, 6);
    const contributions = await Promise.all(
      participantIds.map(async (profileId) => {
        const [person, steps, todaySteps] = await Promise.all([
          profileId === creator._id
            ? Promise.resolve(creator)
            : ctx.db.get(profileId),
          stepsForWeek(ctx, profileId, args.weekStart, weekEnd),
          args.today
            ? stepsForDate(ctx, profileId, args.today)
            : Promise.resolve(0),
        ]);
        return {
          profileId,
          name: profileId === profile._id ? "You" : displayNameOf(person),
          steps,
          todaySteps,
        };
      }),
    );
    contributions.sort(
      (left, right) =>
        right.steps - left.steps || left.name.localeCompare(right.name),
    );

    return {
      goalSteps: winner.goalSteps,
      totalSteps: contributions.reduce((sum, person) => sum + person.steps, 0),
      name: winner.name?.trim() ?? "",
      imageUrl: winner.imageId
        ? await ctx.storage.getUrl(winner.imageId)
        : null,
      creatorName: displayNameOf(creator),
      isMine: winner.creatorProfileId === profile._id,
      contributions,
    };
  },
});
