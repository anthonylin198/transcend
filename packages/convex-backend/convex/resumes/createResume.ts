import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";
import { requireResumeContent, requireResumeTitle } from "./requireResume";

export const createResume = mutation({
  args: {
    title: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const title = requireResumeTitle(args.title);
    const content = requireResumeContent(args.content);
    const profile = await getCurrentProfileOrThrow(ctx);
    const now = Date.now();

    return await ctx.db.insert("resumes", {
      profileId: profile._id,
      title,
      content,
      createdAt: now,
      updatedAt: now,
    });
  },
});
