import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { duplicateResumeTitle, getOwnedResumeOrThrow } from "./requireResume";

export const duplicateResume = mutation({
  args: {
    resumeId: v.string(),
  },
  handler: async (ctx, args) => {
    const resume = await getOwnedResumeOrThrow(ctx, args.resumeId);
    const now = Date.now();

    return await ctx.db.insert("resumes", {
      profileId: resume.profileId,
      title: duplicateResumeTitle(resume.title),
      content: resume.content,
      createdAt: now,
      updatedAt: now,
    });
  },
});
