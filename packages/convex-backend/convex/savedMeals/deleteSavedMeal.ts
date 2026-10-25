import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";

export const deleteSavedMeal = mutation({
  args: {
    savedMealId: v.id("savedMeals"),
  },
  handler: async (ctx, args) => {
    const profile = await getCurrentProfileOrThrow(ctx);
    const savedMeal = await ctx.db.get(args.savedMealId);
    if (!savedMeal || savedMeal.profileId !== profile._id) {
      throw new Error("Saved meal not found");
    }

    await ctx.db.delete(savedMeal._id);
  },
});
