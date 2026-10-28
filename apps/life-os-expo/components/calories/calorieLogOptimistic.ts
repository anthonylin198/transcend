import { api } from "@transcend/convex";
import type { OptimisticLocalStore } from "convex/browser";
import type { FunctionArgs } from "convex/server";

type CreateCalorieLogArgs = FunctionArgs<
  typeof api.calorieLogs.createCalorieLog.createCalorieLog
>;

export function applyCreateCalorieLogOptimisticUpdate(
  localStore: OptimisticLocalStore,
  args: CreateCalorieLogArgs,
) {
  const now = Date.now();
  const proteinG = Math.round(args.proteinG * 10) / 10;
  const bootstrapQueries = localStore.getAllQueries(
    api.home.bootstrap.bootstrap,
  );
  for (const { args: queryArgs, value } of bootstrapQueries) {
    if (!value || value.profile === null) continue;
    const inRange =
      args.date >= queryArgs.rangeStartDateKey &&
      args.date < queryArgs.rangeEndDateKey;
    if (!inRange) continue;

    const optimisticId =
      `optimistic-calorie-${now}` as (typeof value.calorieLogs)[number]["_id"];
    const description = args.description?.trim() || undefined;
    localStore.setQuery(api.home.bootstrap.bootstrap, queryArgs, {
      ...value,
      calorieLogs: [
        ...value.calorieLogs,
        {
          _id: optimisticId,
          _creationTime: now,
          profileId: value.profile._id,
          date: args.date,
          calories: args.calories,
          proteinG,
          ...(description ? { description } : {}),
          createdAt: now,
        },
      ],
    });
  }
}

type UpdateCalorieLogArgs = FunctionArgs<
  typeof api.calorieLogs.updateCalorieLog.updateCalorieLog
>;

export function applyUpdateCalorieLogOptimisticUpdate(
  localStore: OptimisticLocalStore,
  args: UpdateCalorieLogArgs,
) {
  const patch = {
    calories: args.calories,
    proteinG: Math.round(args.proteinG * 10) / 10,
    description: args.description?.trim() || undefined,
  };
  for (const { args: queryArgs, value } of localStore.getAllQueries(
    api.home.bootstrap.bootstrap,
  )) {
    if (!value || value.profile === null) continue;
    if (!value.calorieLogs.some((log) => log._id === args.calorieLogId)) {
      continue;
    }
    localStore.setQuery(api.home.bootstrap.bootstrap, queryArgs, {
      ...value,
      calorieLogs: value.calorieLogs.map((log) =>
        log._id === args.calorieLogId ? { ...log, ...patch } : log,
      ),
    });
  }

  for (const { args: queryArgs, value } of localStore.getAllQueries(
    api.calorieLogs.listCalorieLogs.listCalorieLogs,
  )) {
    if (!value?.some((log) => log._id === args.calorieLogId)) continue;
    localStore.setQuery(
      api.calorieLogs.listCalorieLogs.listCalorieLogs,
      queryArgs,
      value.map((log) =>
        log._id === args.calorieLogId ? { ...log, ...patch } : log,
      ),
    );
  }
}
