"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { api, useMutation, useQuery } from "@transcend/convex";
import {
  getHomeBootstrapRange,
  HOME_DAY_WINDOW,
} from "@/lib/homeBootstrapRange";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

function toStartOfDay(value: Date | number) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(value: Date, amount: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + amount);
  return date;
}

function toStartOfDayMs(value: Date | number) {
  return toStartOfDay(value).getTime();
}

function toDateKey(value: Date | number) {
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toHabitDateKey(value: Date) {
  return toDateKey(value);
}

function toIsoDateKeyFromMs(valueMs: number) {
  return new Date(valueMs).toISOString().slice(0, 10);
}

function getWeekdayName(value: Date) {
  return new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(value);
}

function CompletionMark({ completed }: { completed: boolean }) {
  return (
    <span
      aria-hidden
      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition ${
        completed
          ? "border-zinc-200 bg-zinc-200 text-zinc-950"
          : "border-zinc-500 bg-transparent group-hover:border-zinc-300"
      }`}
    >
      {completed ? (
        <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
          <path
            d="M3.2 8.2 6.6 11.4 12.8 4.4"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : null}
    </span>
  );
}

export default function HomePage() {
  const today = useMemo(() => toStartOfDay(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const range = useMemo(() => getHomeBootstrapRange(today), [today]);
  const homeBootstrap = useQuery(api.home.bootstrap.bootstrap, range);
  const setPriorityStatus = useMutation(
    api.priorities.setPriorityStatus.setPriorityStatus,
  ).withOptimisticUpdate((localStore, args) => {
    const allBootstrapQueries = localStore.getAllQueries(
      api.home.bootstrap.bootstrap,
    );
    allBootstrapQueries.forEach(({ args: queryArgs, value }) => {
      if (!value || value.profile === null) return;
      const existingPriority = value.priorities.find(
        (priority) => priority._id === args.priorityId,
      );
      if (!existingPriority) return;

      const nextPriorities = value.priorities.map((priority) =>
        priority._id === args.priorityId
          ? {
              ...priority,
              status: args.status,
              completedAt: (() => {
                if (args.status !== "done") return undefined;
                return args.completedAtMs ?? priority.completedAt ?? Date.now();
              })(),
              completedDateKey: (() => {
                if (args.status !== "done") return undefined;
                const completedAtMs =
                  args.completedAtMs ?? priority.completedAt ?? Date.now();
                return (
                  args.completedDateKey ??
                  priority.completedDateKey ??
                  toIsoDateKeyFromMs(completedAtMs)
                );
              })(),
            }
          : priority,
      );
      const nextCategories = value.categories.filter(
        (priority) => priority._id !== args.priorityId,
      );
      if (args.status === "next_up" && existingPriority.isActive) {
        nextCategories.push({
          ...existingPriority,
          status: "next_up",
          completedAt: undefined,
          completedDateKey: undefined,
        });
      }

      localStore.setQuery(api.home.bootstrap.bootstrap, queryArgs, {
        ...value,
        priorities: nextPriorities,
        categories: nextCategories,
      });
    });
  });
  const setHabitCompletion = useMutation(
    api.habits.setHabitCompletion.setHabitCompletion,
  ).withOptimisticUpdate((localStore, args) => {
    const allBootstrapQueries = localStore.getAllQueries(
      api.home.bootstrap.bootstrap,
    );

    allBootstrapQueries.forEach(({ args: queryArgs, value }) => {
      if (!value || value.profile === null) return;

      const isInRange =
        args.dateKey >= queryArgs.rangeStartDateKey &&
        args.dateKey < queryArgs.rangeEndDateKey;
      if (!isInRange) return;

      const existingCompletionIndex = value.habitCompletions.findIndex(
        (completion) =>
          completion.habitId === args.habitId &&
          completion.dateKey === args.dateKey,
      );

      if (args.completed) {
        const completedAtMs = args.completedAtMs ?? Date.now();
        const existingCompletion =
          existingCompletionIndex === -1
            ? undefined
            : value.habitCompletions[existingCompletionIndex];
        const optimisticCompletionId =
          `optimistic-${args.habitId}-${args.dateKey}` as (typeof value.habitCompletions)[number]["_id"];
        const nextCompletion = {
          ...(existingCompletion ?? {}),
          _id: existingCompletion?._id ?? optimisticCompletionId,
          _creationTime: existingCompletion?._creationTime ?? completedAtMs,
          profileId: existingCompletion?.profileId ?? value.profile._id,
          habitId: args.habitId,
          dateKey: args.dateKey,
          completedAt: completedAtMs,
          updatedAt: completedAtMs,
          createdAt: existingCompletion?.createdAt ?? completedAtMs,
        };
        const nextHabitCompletions =
          existingCompletionIndex === -1
            ? [...value.habitCompletions, nextCompletion]
            : value.habitCompletions.map((completion, index) =>
                index === existingCompletionIndex ? nextCompletion : completion,
              );

        localStore.setQuery(api.home.bootstrap.bootstrap, queryArgs, {
          ...value,
          habitCompletions: nextHabitCompletions,
        });
        return;
      }

      if (existingCompletionIndex === -1) return;

      localStore.setQuery(api.home.bootstrap.bootstrap, queryArgs, {
        ...value,
        habitCompletions: value.habitCompletions.filter(
          (_, index) => index !== existingCompletionIndex,
        ),
      });
    });
  });
  const [updatingPriorityIds, setUpdatingPriorityIds] = useState<Set<string>>(
    new Set(),
  );
  const [updatingHabitIds, setUpdatingHabitIds] = useState<Set<string>>(
    new Set(),
  );
  const [pendingCompletionByHabitId, setPendingCompletionByHabitId] = useState<
    Map<string, boolean>
  >(new Map());

  const selectedDateLabel = useMemo(
    () =>
      new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
      }).format(selectedDate),
    [selectedDate],
  );

  const days = useMemo(
    () =>
      Array.from({ length: HOME_DAY_WINDOW * 2 + 1 }, (_, index) =>
        addDays(today, index - HOME_DAY_WINDOW),
      ),
    [today],
  );

  const visiblePriorities = useMemo(() => {
    const priorities = homeBootstrap?.priorities ?? [];
    const selectedDayMs = toStartOfDayMs(selectedDate);
    const todayMs = toStartOfDayMs(today);
    const isSelectedDateFuture = selectedDayMs > todayMs;

    return priorities.filter((priority) => {
      if (priority.status === "done") {
        if (priority.completedAt === undefined) return false;
        return toStartOfDayMs(priority.completedAt) === selectedDayMs;
      }

      if (priority.status === "next_up" && priority.activatedAt !== undefined) {
        const activatedDayMs = toStartOfDayMs(priority.activatedAt);
        if (isSelectedDateFuture) {
          return activatedDayMs === selectedDayMs;
        }
        return activatedDayMs <= selectedDayMs;
      }

      return false;
    });
  }, [homeBootstrap, selectedDate, today]);

  const visibleHabits = useMemo(() => {
    const habits = homeBootstrap?.habits ?? [];
    const weekdayName = getWeekdayName(selectedDate);
    return habits
      .filter((habit) => {
        if (habit.habitType === "anytime") return true;
        return (habit.targetDays ?? []).includes(weekdayName);
      })
      .sort((a, b) => a.orderIndex - b.orderIndex);
  }, [homeBootstrap, selectedDate]);

  const selectedDateKey = useMemo(
    () => toHabitDateKey(selectedDate),
    [selectedDate],
  );
  const selectedDayCompletionMs = useMemo(() => {
    const selectedDateAtNoon = new Date(selectedDate);
    selectedDateAtNoon.setHours(12, 0, 0, 0);
    return selectedDateAtNoon.getTime();
  }, [selectedDate]);

  const completionSet = useMemo(() => {
    const habitCompletions = homeBootstrap?.habitCompletions ?? [];
    const completedHabitIds = new Set<string>();
    for (const completion of habitCompletions) {
      if (completion.dateKey === selectedDateKey) {
        completedHabitIds.add(completion.habitId);
      }
    }
    return completedHabitIds;
  }, [homeBootstrap, selectedDateKey]);

  const onCompletePriority = async (
    priority: NonNullable<typeof homeBootstrap>["priorities"][number],
  ) => {
    if (updatingPriorityIds.has(priority._id)) return;
    setUpdatingPriorityIds((prev) => new Set(prev).add(priority._id));
    try {
      if (priority.status === "done") {
        await setPriorityStatus({
          priorityId: priority._id,
          status: "next_up",
        });
      } else {
        await setPriorityStatus({
          priorityId: priority._id,
          status: "done",
          completedAtMs: selectedDayCompletionMs,
          completedDateKey: toDateKey(selectedDate),
        });
      }
    } finally {
      setUpdatingPriorityIds((prev) => {
        const next = new Set(prev);
        next.delete(priority._id);
        return next;
      });
    }
  };

  const onToggleHabit = async (
    habitId: NonNullable<typeof homeBootstrap>["habits"][number]["_id"],
  ) => {
    if (updatingHabitIds.has(habitId)) return;
    const currentlyCompleted =
      pendingCompletionByHabitId.get(habitId) ?? completionSet.has(habitId);
    const nextCompleted = !currentlyCompleted;

    setPendingCompletionByHabitId((prev) => {
      const next = new Map(prev);
      next.set(habitId, nextCompleted);
      return next;
    });
    setUpdatingHabitIds((prev) => new Set(prev).add(habitId));
    try {
      await setHabitCompletion({
        habitId,
        dateKey: selectedDateKey,
        completed: nextCompleted,
      });
    } finally {
      setPendingCompletionByHabitId((prev) => {
        const next = new Map(prev);
        next.delete(habitId);
        return next;
      });
      setUpdatingHabitIds((prev) => {
        const next = new Set(prev);
        next.delete(habitId);
        return next;
      });
    }
  };

  return (
    <main className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-3xl font-semibold text-zinc-100">
          {getGreeting()}
        </h1>
        <p className="text-zinc-400">
          A good life is built in small, repeated choices.
        </p>
      </section>

      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <p className="mb-3 text-sm text-zinc-400">Select day</p>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {days.map((day) => {
            const isSelected =
              toStartOfDayMs(day) === toStartOfDayMs(selectedDate);
            const dayNumber = new Intl.DateTimeFormat(undefined, {
              day: "2-digit",
            }).format(day);
            const dayLabel = new Intl.DateTimeFormat(undefined, {
              weekday: "short",
            }).format(day);

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => setSelectedDate(day)}
                className={`min-w-16 rounded-md border px-2 py-2 text-center text-xs transition ${
                  isSelected
                    ? "border-zinc-200 bg-zinc-200 text-black"
                    : "border-zinc-700 bg-black text-zinc-300 hover:border-zinc-500"
                }`}
              >
                <div>{dayLabel}</div>
                <div className="mt-1 text-sm font-semibold">{dayNumber}</div>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-100">
              Priorities
            </h2>
            <span className="text-sm text-zinc-400">
              {visiblePriorities.length}
            </span>
          </div>
          {visiblePriorities.length === 0 ? (
            <p className="text-sm text-zinc-500">No priorities for this day.</p>
          ) : (
            <ul className="space-y-1">
              {visiblePriorities.map((priority) => {
                const isDone = priority.status === "done";
                const isUpdating = updatingPriorityIds.has(priority._id);
                return (
                  <li key={priority._id}>
                    <button
                      type="button"
                      onClick={() => void onCompletePriority(priority)}
                      disabled={isUpdating}
                      aria-pressed={isDone}
                      className="group flex w-full cursor-pointer items-center gap-3 rounded-md px-1.5 py-2 text-left hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CompletionMark completed={isDone} />
                      <span
                        className={`text-[15px] leading-snug ${
                          isDone
                            ? "text-zinc-500 line-through"
                            : "text-zinc-100"
                        }`}
                      >
                        {priority.name}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-100">Habits</h2>
            <span className="text-sm text-zinc-400">
              {visibleHabits.length}
            </span>
          </div>
          {visibleHabits.length === 0 ? (
            <p className="text-sm text-zinc-500">No habits for this day.</p>
          ) : (
            <ul className="space-y-1">
              {visibleHabits.map((habit) => {
                const isCompleted =
                  pendingCompletionByHabitId.get(habit._id) ??
                  completionSet.has(habit._id);
                const isUpdating = updatingHabitIds.has(habit._id);
                return (
                  <li key={habit._id}>
                    <button
                      type="button"
                      onClick={() => void onToggleHabit(habit._id)}
                      disabled={isUpdating}
                      aria-pressed={isCompleted}
                      className="group flex w-full cursor-pointer items-center gap-3 rounded-md px-1.5 py-2 text-left hover:bg-zinc-900 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <CompletionMark completed={isCompleted} />
                      <span
                        className={`text-[15px] leading-snug ${
                          isCompleted
                            ? "text-zinc-500 line-through"
                            : "text-zinc-100"
                        }`}
                      >
                        {habit.name}
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>

      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="text-lg font-semibold text-zinc-100">Quick Links</h2>
        <p className="mt-1 text-sm text-zinc-500">{selectedDateLabel}</p>
        <div className="mt-3 flex flex-wrap gap-3">
          <Link
            href="/systems"
            className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
          >
            Open Systems
          </Link>
          <Link
            href="/intake"
            className="rounded-md border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-900"
          >
            Open Intake
          </Link>
        </div>
      </section>
    </main>
  );
}
