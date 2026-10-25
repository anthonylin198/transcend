import { api } from "@transcend/convex";
import type { OptimisticLocalStore } from "convex/browser";
import type { FunctionArgs } from "convex/server";

type SavedMeal = {
  _id: string;
  _creationTime: number;
  profileId: string;
  calories: number;
  proteinG: number;
  description: string;
  createdAt: number;
  updatedAt: number;
};

function roundProtein(value: number) {
  return Math.round(value * 10) / 10;
}

function forEachSavedMealList(
  localStore: OptimisticLocalStore,
  update: (meals: SavedMeal[]) => SavedMeal[],
) {
  for (const { args: queryArgs, value } of localStore.getAllQueries(
    api.savedMeals.listSavedMeals.listSavedMeals,
  )) {
    if (!value) continue;
    localStore.setQuery(
      api.savedMeals.listSavedMeals.listSavedMeals,
      queryArgs,
      update(value) as typeof value,
    );
  }
}

type CreateSavedMealArgs = FunctionArgs<
  typeof api.savedMeals.createSavedMeal.createSavedMeal
>;

export function applyCreateSavedMealOptimisticUpdate(
  localStore: OptimisticLocalStore,
  args: CreateSavedMealArgs,
) {
  const now = Date.now();
  forEachSavedMealList(localStore, (meals) => [
    ...meals,
    {
      _id: `optimistic-saved-meal-${now}-${Math.random()}`,
      _creationTime: now,
      profileId: meals[0]?.profileId ?? "",
      calories: args.calories,
      proteinG: roundProtein(args.proteinG),
      description: args.description.trim(),
      createdAt: now,
      updatedAt: now,
    },
  ]);
}

type UpdateSavedMealArgs = FunctionArgs<
  typeof api.savedMeals.updateSavedMeal.updateSavedMeal
>;

export function applyUpdateSavedMealOptimisticUpdate(
  localStore: OptimisticLocalStore,
  args: UpdateSavedMealArgs,
) {
  const patch = {
    calories: args.calories,
    proteinG: roundProtein(args.proteinG),
    description: args.description.trim(),
    updatedAt: Date.now(),
  };
  forEachSavedMealList(localStore, (meals) =>
    meals.map((meal) =>
      meal._id === args.savedMealId ? { ...meal, ...patch } : meal,
    ),
  );
}

type DeleteSavedMealArgs = FunctionArgs<
  typeof api.savedMeals.deleteSavedMeal.deleteSavedMeal
>;

export function applyDeleteSavedMealOptimisticUpdate(
  localStore: OptimisticLocalStore,
  args: DeleteSavedMealArgs,
) {
  forEachSavedMealList(localStore, (meals) =>
    meals.filter((meal) => meal._id !== args.savedMealId),
  );
}
