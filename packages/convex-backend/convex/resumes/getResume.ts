import { query } from "../_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getResume = query({
  args: {
    resumeId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) return null;

    const resumeId = ctx.db.normalizeId("resumes", args.resumeId);
    if (!resumeId) return null;

    const resume = await ctx.db.get(resumeId);
    if (!resume || resume.profileId !== profile._id) return null;

    return resume;
  },
});
