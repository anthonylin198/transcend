import { mutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";
import { findFriendshipBetween } from "../lib/friendships";

const findUserByEmail = async (ctx: MutationCtx, rawEmail: string) => {
  const trimmed = rawEmail.trim();
  const candidates = [...new Set([trimmed, trimmed.toLowerCase()])];
  for (const email of candidates) {
    const user = await ctx.db
      .query("users")
      .withIndex("email", (q) => q.eq("email", email))
      .first();
    if (user) return user;
  }
  return null;
};

export const sendFriendRequest = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);
    if (!profile.displayName) {
      throw new Error("Set your display name before adding friends");
    }

    if (!args.email.trim()) {
      throw new Error("Enter an email");
    }

    const user = await findUserByEmail(ctx, args.email);
    if (user && user._id === profile.userId) {
      throw new Error("That's your own email");
    }

    const target = user
      ? await ctx.db
          .query("profiles")
          .withIndex("by_user_id", (q) => q.eq("userId", user._id))
          .unique()
      : null;

    // Unknown emails get the same result as real ones so this can't be used
    // to discover which emails have accounts.
    if (!target) return { status: "sent" as const };

    const existing = await findFriendshipBetween(ctx, profile._id, target._id);
    if (existing) {
      if (
        existing.status === "pending" &&
        existing.addresseeProfileId === profile._id
      ) {
        await ctx.db.patch(existing._id, {
          status: "accepted",
          respondedAt: Date.now(),
        });
        return { status: "accepted" as const };
      }
      return { status: "sent" as const };
    }

    await ctx.db.insert("friendships", {
      requesterProfileId: profile._id,
      addresseeProfileId: target._id,
      status: "pending",
      createdAt: Date.now(),
    });
    return { status: "sent" as const };
  },
});
