import { mutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import type { MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import { assertSundayDateKey } from "../lib/dateKey";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";
import {
  assertChallengeName,
  assertGoalSteps,
  findStepChallenge,
  MAX_CHALLENGE_IMAGE_BYTES,
} from "../lib/stepChallenge";

async function storedImageId(ctx: MutationCtx, imageId: Id<"_storage">) {
  const metadata = await ctx.storage.getMetadata(imageId);
  if (!metadata) {
    throw new Error("Image upload was not found");
  }
  if (!metadata.contentType?.startsWith("image/")) {
    throw new Error("Upload an image");
  }
  if (metadata.size > MAX_CHALLENGE_IMAGE_BYTES) {
    throw new Error("Image must be 4 MB or smaller");
  }
  return imageId;
}

export const setStepChallenge = mutation({
  args: {
    weekStart: v.string(),
    goalSteps: v.number(),
    name: v.string(),
    // Omit to keep the current picture. Null removes it.
    imageId: v.optional(v.union(v.id("_storage"), v.null())),
  },
  handler: async (ctx, args) => {
    assertSundayDateKey(args.weekStart);
    assertGoalSteps(args.goalSteps);
    const name = assertChallengeName(args.name);
    const profile = await getCurrentProfileOrThrow(ctx);
    const existing = await findStepChallenge(ctx, profile._id, args.weekStart);
    const now = Date.now();
    const imageId =
      args.imageId === undefined
        ? existing?.imageId
        : args.imageId === null
          ? undefined
          : await storedImageId(ctx, args.imageId);

    if (
      existing?.imageId &&
      args.imageId !== undefined &&
      existing.imageId !== imageId
    ) {
      await ctx.storage.delete(existing.imageId);
    }

    if (existing) {
      await ctx.db.patch(existing._id, {
        goalSteps: args.goalSteps,
        name,
        imageId,
        updatedAt: now,
      });
      return existing._id;
    }

    return await ctx.db.insert("stepChallenges", {
      creatorProfileId: profile._id,
      weekStart: args.weekStart,
      goalSteps: args.goalSteps,
      name,
      ...(imageId ? { imageId } : {}),
      createdAt: now,
      updatedAt: now,
    });
  },
});
