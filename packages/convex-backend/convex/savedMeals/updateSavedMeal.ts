import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";
import {
  assertNutrition,
  normalizeProtein,
  requireMealDescription,
} from "./createSavedMeal";

export const updateSavedMeal = mutation({
  args: {
    savedMealId: v.id("savedMeals"),
    calories: v.number(),
    proteinG: v.number(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    assertNutrition(args.calories, args.proteinG);
    const description = requireMealDescription(args.description);
    const profile = await getCurrentProfileOrThrow(ctx);
    const savedMeal = await ctx.db.get(args.savedMealId);
    if (!savedMeal || savedMeal.profileId !== profile._id) {
      throw new Error("Saved meal not found");
    }

    await ctx.db.patch(savedMeal._id, {
      calories: args.calories,
      proteinG: normalizeProtein(args.proteinG),
      description,
      updatedAt: Date.now(),
    });
  },
});
