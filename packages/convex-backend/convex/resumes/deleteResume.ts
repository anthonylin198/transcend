import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getOwnedResumeOrThrow } from "./requireResume";

export const deleteResume = mutation({
  args: {
    resumeId: v.string(),
  },
  handler: async (ctx, args) => {
    const resume = await getOwnedResumeOrThrow(ctx, args.resumeId);
    await ctx.db.delete(resume._id);
  },
});
