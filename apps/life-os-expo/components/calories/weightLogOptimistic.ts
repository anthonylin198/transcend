import { api } from "@transcend/convex";
import type { OptimisticLocalStore } from "convex/browser";
import type { FunctionArgs } from "convex/server";

type SetWeightLogArgs = FunctionArgs<
  typeof api.weightLogs.setWeightLog.setWeightLog
>;

export function applySetWeightLogOptimisticUpdate(
  localStore: OptimisticLocalStore,
  args: SetWeightLogArgs,
) {
  const pounds = Math.round(args.pounds * 10) / 10;
  const now = Date.now();
  for (const { args: queryArgs, value } of localStore.getAllQueries(
    api.weightLogs.listWeightLogs.listWeightLogs,
  )) {
    if (!value) continue;
    const existing = value.weights.find(
      (weight) => weight.weekStart === args.weekStart,
    );
    const weights = existing
      ? value.weights.map((weight) =>
          weight.weekStart === args.weekStart
            ? { ...weight, pounds, updatedAt: now }
            : weight,
        )
      : [
          {
            _id: `optimistic-weight-${args.weekStart}` as (typeof value.weights)[number]["_id"],
            weekStart: args.weekStart,
            pounds,
            updatedAt: now,
          },
          ...value.weights,
        ];
    localStore.setQuery(
      api.weightLogs.listWeightLogs.listWeightLogs,
      queryArgs,
      { ...value, weights },
    );
  }
}

type DeleteWeightLogArgs = FunctionArgs<
  typeof api.weightLogs.deleteWeightLog.deleteWeightLog
>;

export function applyDeleteWeightLogOptimisticUpdate(
  localStore: OptimisticLocalStore,
  args: DeleteWeightLogArgs,
) {
  for (const { args: queryArgs, value } of localStore.getAllQueries(
    api.weightLogs.listWeightLogs.listWeightLogs,
  )) {
    if (!value?.weights.some((weight) => weight.weekStart === args.weekStart)) {
      continue;
    }
    localStore.setQuery(
      api.weightLogs.listWeightLogs.listWeightLogs,
      queryArgs,
      {
        ...value,
        weights: value.weights.filter(
          (weight) => weight.weekStart !== args.weekStart,
        ),
      },
    );
  }
}
