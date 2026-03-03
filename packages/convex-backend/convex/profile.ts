import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const ensureProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
      .unique();

    if (existingProfile) {
      return;
    }

    await ctx.db.insert("profiles", {
      userId: identity.subject,
      calendarSyncEnabled: false,
    });
  },
});

export const setCalendarSyncEnabled = mutation({
  args: {
    enabled: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", identity.subject))
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
