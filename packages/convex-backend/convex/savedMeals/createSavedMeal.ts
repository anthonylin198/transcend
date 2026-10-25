import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { getCurrentProfileOrThrow } from "../lib/currentProfile";
import { normalizeCalorieDescription } from "../calorieLogs/createCalorieLog";

export function assertNutrition(calories: number, proteinG: number) {
  if (!Number.isInteger(calories) || calories < 0) {
    throw new Error("Calories must be a whole number of 0 or more");
  }

  if (!Number.isFinite(proteinG) || proteinG < 0) {
    throw new Error("Protein must be 0 or more");
  }
}

export function normalizeProtein(proteinG: number) {
  return Math.round(proteinG * 10) / 10;
}

export function requireMealDescription(value: string) {
  const description = normalizeCalorieDescription(value);
  if (!description) {
    throw new Error("Description is required");
  }
  return description;
}

export const createSavedMeal = mutation({
  args: {
    calories: v.number(),
    proteinG: v.number(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    assertNutrition(args.calories, args.proteinG);
    const description = requireMealDescription(args.description);
    const profile = await getCurrentProfileOrThrow(ctx);
    const now = Date.now();
    return await ctx.db.insert("savedMeals", {
      profileId: profile._id,
      calories: args.calories,
      proteinG: normalizeProtein(args.proteinG),
      description,
      createdAt: now,
      updatedAt: now,
    });
  },
});
