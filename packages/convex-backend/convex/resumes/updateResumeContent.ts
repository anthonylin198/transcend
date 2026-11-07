import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getOwnedResumeOrThrow, requireResumeContent } from "./requireResume";

export const updateResumeContent = mutation({
  args: {
    resumeId: v.string(),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const content = requireResumeContent(args.content);
    const resume = await getOwnedResumeOrThrow(ctx, args.resumeId);
    if (resume.content === content) return;

    await ctx.db.patch(resume._id, {
      content,
      updatedAt: Date.now(),
    });
  },
});
