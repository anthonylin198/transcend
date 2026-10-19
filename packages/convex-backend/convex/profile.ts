import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { getCurrentProfileOrThrow } from "./lib/currentProfile";

export const ensureProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (existingProfile) {
      return;
    }

    await ctx.db.insert("profiles", {
      userId,
      calendarSyncEnabled: false,
      healthSyncEnabled: false,
    });
  },
});

const MAX_DISPLAY_NAME_LENGTH = 40;

export const setDisplayName = mutation({
  args: {
    displayName: v.string(),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);
    const displayName = args.displayName.trim();
    if (!displayName) {
      throw new Error("Enter a display name");
    }
    if (displayName.length > MAX_DISPLAY_NAME_LENGTH) {
      throw new Error(
        `Display name must be ${MAX_DISPLAY_NAME_LENGTH} characters or fewer`,
      );
    }

    await ctx.db.patch(profile._id, { displayName });
  },
});

export const setCalendarSyncEnabled = mutation({
  args: {
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, {
        calendarSyncEnabled: args.enabled,
      });
      return;
    }

    throw new Error("Profile not initialized");
  },
});

export const setHealthSyncEnabled = mutation({
  args: {
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, {
        healthSyncEnabled: args.enabled,
      });
      return;
    }

    throw new Error("Profile not initialized");
  },
});
