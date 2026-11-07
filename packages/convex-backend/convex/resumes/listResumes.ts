import { query } from "../_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const listResumes = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user_id", (q) => q.eq("userId", userId))
      .unique();
    if (!profile) return [];

    const resumes = await ctx.db
      .query("resumes")
      .withIndex("by_profile_id", (q) => q.eq("profileId", profile._id))
      .collect();

    return resumes
      .map((resume) => ({
        _id: resume._id,
        title: resume.title,
        createdAt: resume.createdAt,
        updatedAt: resume.updatedAt,
      }))
      .sort((a, b) => b.updatedAt - a.updatedAt);
  },
});
