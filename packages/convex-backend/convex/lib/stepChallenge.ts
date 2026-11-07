import type { Id } from "../_generated/dataModel";
import type { MutationCtx, QueryCtx } from "../_generated/server";

type Ctx = QueryCtx | MutationCtx;

export const MAX_GOAL_STEPS = 10_000_000;
export const MAX_CHALLENGE_NAME = 40;
export const MAX_CHALLENGE_IMAGE_BYTES = 4_000_000;

export function assertChallengeName(value: string) {
  const name = value.trim();
  if (!name) {
    throw new Error("Enter a name for the challenge");
  }
  if (name.length > MAX_CHALLENGE_NAME) {
    throw new Error("Name must be 40 characters or fewer");
  }
  return name;
}

export function assertGoalSteps(goalSteps: number) {
  if (
    !Number.isInteger(goalSteps) ||
    goalSteps < 1 ||
    goalSteps > MAX_GOAL_STEPS
  ) {
    throw new Error("Step goal must be a whole number from 1 to 10,000,000");
  }
}

export const findStepChallenge = (
  ctx: Ctx,
  creatorProfileId: Id<"profiles">,
  weekStart: string,
) =>
  ctx.db
    .query("stepChallenges")
    .withIndex("by_creator_week", (q) =>
      q.eq("creatorProfileId", creatorProfileId).eq("weekStart", weekStart),
    )
    .unique();
