import * as Linking from "expo-linking";
import {
  formatShortDate,
  startOfLocalDay,
  toLocalDateKey,
} from "@/utils/calorieWeek";
import { getHabitWeekdayName, toHabitDateKey } from "@/utils/habitDate";

export type WidgetPriority = {
  status: "todo" | "next_up" | "done";
  isActive?: boolean;
  activatedAt?: number;
  activeDateKey?: string;
  completedAt?: number;
};

export type WidgetHabit = {
  _id: string;
  habitType: "scheduled" | "anytime";
  targetDays?: string[];
};

export type WidgetHabitCompletion = {
  habitId: string;
  dateKey: string;
};

export type TodayWidgetData = {
  priorities: WidgetPriority[];
  habits: WidgetHabit[];
  habitCompletions: WidgetHabitCompletion[];
};

export type TodayWidgetProps = {
  url: string;
  dateLabel: string;
  prioritiesDone: number;
  prioritiesTotal: number;
  habitsDone: number;
  habitsTotal: number;
};

export function todayWidgetUrl() {
  return Linking.createURL("/");
}

function nextLocalMidnight(from: Date) {
  const next = startOfLocalDay(from);
  next.setDate(next.getDate() + 1);
  return next;
}

function countPriorities(priorities: WidgetPriority[], day: Date) {
  const dayKey = toLocalDateKey(day);
  let done = 0;
  let open = 0;
  for (const priority of priorities) {
    if (priority.status === "done") {
      if (
        priority.completedAt !== undefined &&
        toLocalDateKey(new Date(priority.completedAt)) === dayKey
      ) {
        done += 1;
      }
      continue;
    }
    if (priority.status !== "next_up" || !priority.isActive) continue;
    const activeDateKey =
      priority.activeDateKey ??
      (priority.activatedAt !== undefined
        ? toLocalDateKey(new Date(priority.activatedAt))
        : undefined);
    if (activeDateKey !== undefined && activeDateKey <= dayKey) {
      open += 1;
    }
  }
  return { done, total: done + open };
}

function countHabits(
  habits: WidgetHabit[],
  completions: WidgetHabitCompletion[],
  day: Date,
) {
  const dateKey = toHabitDateKey(day);
  const weekdayName = getHabitWeekdayName(day);
  const completedIds = new Set(
    completions
      .filter((completion) => completion.dateKey === dateKey)
      .map((completion) => completion.habitId),
  );
  const due = habits.filter(
    (habit) =>
      habit.habitType === "anytime" ||
      (habit.targetDays ?? []).includes(weekdayName),
  );
  return {
    done: due.filter((habit) => completedIds.has(habit._id)).length,
    total: due.length,
  };
}

export function buildTodayWidgetProps(
  data: TodayWidgetData,
  day: Date,
): TodayWidgetProps {
  const priorities = countPriorities(data.priorities, day);
  const habits = countHabits(data.habits, data.habitCompletions, day);
  return {
    url: todayWidgetUrl(),
    dateLabel: formatShortDate(day),
    prioritiesDone: priorities.done,
    prioritiesTotal: priorities.total,
    habitsDone: habits.done,
    habitsTotal: habits.total,
  };
}

export function buildTodayWidgetTimeline(data: TodayWidgetData, today: Date) {
  const midnight = nextLocalMidnight(today);
  return [
    { date: new Date(), props: buildTodayWidgetProps(data, today) },
    { date: midnight, props: buildTodayWidgetProps(data, midnight) },
  ];
}

export function signedOutTodayWidgetProps(): TodayWidgetProps {
  return {
    url: todayWidgetUrl(),
    dateLabel: "",
    prioritiesDone: 0,
    prioritiesTotal: 0,
    habitsDone: 0,
    habitsTotal: 0,
  };
}
