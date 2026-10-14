import * as Linking from "expo-linking";
import {
  addDays,
  averageLoggedDays,
  formatCalories,
  formatProtein,
  formatShortDate,
  getSundayWeek,
  startOfLocalDay,
  toLocalDateKey,
  type DatedCalorieLog,
} from "@/utils/calorieWeek";

export type CalorieWidgetProps = {
  url: string;
  dateLabel: string;
  calories: string;
  protein: string;
  weekLabel: string;
  weekAverage: string;
};

export function calorieWidgetUrl() {
  return Linking.createURL("calorie-counter");
}

function nextLocalMidnight(from: Date) {
  const next = startOfLocalDay(from);
  next.setDate(next.getDate() + 1);
  return next;
}

export function buildCalorieWidgetProps(
  logs: DatedCalorieLog[],
  day: Date,
): CalorieWidgetProps {
  const todayKey = toLocalDateKey(day);
  const week = getSundayWeek(day);
  const weekLogs = logs.filter(
    (log) => log.date >= week.startKey && log.date <= week.endKey,
  );
  const todayLogs = weekLogs.filter((log) => log.date === todayKey);
  const calories = todayLogs.reduce((sum, log) => sum + log.calories, 0);
  const protein = todayLogs.reduce((sum, log) => sum + log.proteinG, 0);
  const throughYesterday = toLocalDateKey(addDays(day, -1));
  const weekAverage = averageLoggedDays(
    weekLogs,
    week.startKey,
    throughYesterday,
    todayKey,
  );

  return {
    url: calorieWidgetUrl(),
    dateLabel: formatShortDate(day),
    calories: formatCalories(calories),
    protein: `${formatProtein(protein)}g`,
    weekLabel: "Week average",
    weekAverage: weekAverage.pending
      ? "Pending"
      : `${formatCalories(weekAverage.calories)} cal · ${formatProtein(weekAverage.proteinG)}g`,
  };
}

export function buildCalorieWidgetTimeline(
  logs: DatedCalorieLog[],
  today: Date,
) {
  const midnight = nextLocalMidnight(today);
  return [
    { date: new Date(), props: buildCalorieWidgetProps(logs, today) },
    { date: midnight, props: buildCalorieWidgetProps(logs, midnight) },
  ];
}

export function signedOutCalorieWidgetProps(): CalorieWidgetProps {
  return {
    url: calorieWidgetUrl(),
    dateLabel: "",
    calories: "—",
    protein: "—",
    weekLabel: "",
    weekAverage: "Open lifeOS",
  };
}
