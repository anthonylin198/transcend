import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getOwnedResumeOrThrow, requireResumeTitle } from "./requireResume";

export const renameResume = mutation({
  args: {
    resumeId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const title = requireResumeTitle(args.title);
    const resume = await getOwnedResumeOrThrow(ctx, args.resumeId);
    if (resume.title === title) return;

    await ctx.db.patch(resume._id, {
      title,
      updatedAt: Date.now(),
    });
  },
});
