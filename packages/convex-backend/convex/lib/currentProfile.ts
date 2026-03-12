import type { MutationCtx, QueryCtx } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

type Ctx = QueryCtx | MutationCtx;

export const getCurrentProfileOrThrow = async (ctx: Ctx) => {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error("Not authenticated");
  }

  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_user_id", (q) => q.eq("userId", userId))
    .unique();

  if (!profile) {
    throw new Error("Profile not initialized");
  }

  return profile;
};
