import type { MutationCtx, QueryCtx } from "../_generated/server";

type Ctx = QueryCtx | MutationCtx;

export const getCurrentProfileOrThrow = async (ctx: Ctx) => {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }

  const profile = await ctx.db
    .query("profiles")
    .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
    .unique();

  if (!profile) {
    throw new Error("Profile not initialized");
  }

  return profile;
};
