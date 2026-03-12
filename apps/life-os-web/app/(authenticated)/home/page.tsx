"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { api, useQuery } from "@transcend/convex";
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

function toHabitDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getWeekdayName(value: Date) {
  return new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(value);
}

export default function HomePage() {
  const today = useMemo(() => toStartOfDay(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(today);
  const range = useMemo(() => getHomeBootstrapRange(today), [today]);
  const homeBootstrap = useQuery(api.home.bootstrap.bootstrap, range);

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

  const completionSet = useMemo(() => {
    const habitCompletions = homeBootstrap?.habitCompletions ?? [];
    const dateKey = toHabitDateKey(selectedDate);
    const completedHabitIds = new Set<string>();
    for (const completion of habitCompletions) {
      if (completion.dateKey === dateKey) {
        completedHabitIds.add(completion.habitId);
      }
    }
    return completedHabitIds;
  }, [homeBootstrap, selectedDate]);

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
            <ul className="space-y-2">
              {visiblePriorities.map((priority) => (
                <li
                  key={priority._id}
                  className="flex items-center gap-2 text-sm"
                >
                  <span className="text-zinc-500">
                    {priority.status === "done" ? "✓" : "○"}
                  </span>
                  <span
                    className={
                      priority.status === "done"
                        ? "text-zinc-400 line-through"
                        : "text-zinc-200"
                    }
                  >
                    {priority.name}
                  </span>
                </li>
              ))}
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
            <ul className="space-y-2">
              {visibleHabits.map((habit) => {
                const isCompleted = completionSet.has(habit._id);
                return (
                  <li
                    key={habit._id}
                    className="flex items-center gap-2 text-sm"
                  >
                    <span className="text-zinc-500">
                      {isCompleted ? "✓" : "○"}
                    </span>
                    <span
                      className={
                        isCompleted
                          ? "text-zinc-400 line-through"
                          : "text-zinc-200"
                      }
                    >
                      {habit.name}
                    </span>
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
