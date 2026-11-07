import { mutation } from "../_generated/server";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

export const generateChallengeImageUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await getCurrentProfileOrThrow(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});
