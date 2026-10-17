export type DatedCalorieLog = {
  date: string;
  calories: number;
  proteinG: number;
  createdAt: number;
};

const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Local calendar day as YYYY-MM-DD. Do not use Date#toISOString for this. */
export function toLocalDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseLocalDateKey(dateKey: string) {
  const match = DATE_KEY_PATTERN.exec(dateKey);
  if (!match) {
    throw new Error("Date must use YYYY-MM-DD");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const date = new Date(year, month - 1, day);
  if (toLocalDateKey(date) !== dateKey) {
    throw new Error("Date must use YYYY-MM-DD");
  }
  return date;
}

export function startOfLocalDay(value: Date) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

export function addDays(day: Date, amount: number) {
  const next = new Date(day.getFullYear(), day.getMonth(), day.getDate());
  next.setDate(next.getDate() + amount);
  return next;
}

export function startOfWeekSunday(day: Date) {
  const start = startOfLocalDay(day);
  start.setDate(start.getDate() - start.getDay());
  return start;
}

export function getSundayWeek(day: Date) {
  const start = startOfWeekSunday(day);
  const end = addDays(start, 6);
  return {
    start,
    end,
    startKey: toLocalDateKey(start),
    endKey: toLocalDateKey(end),
  };
}

export function eachDateKeyOfWeek(startKey: string) {
  const start = parseLocalDateKey(startKey);
  return Array.from({ length: 7 }, (_, index) =>
    toLocalDateKey(addDays(start, index)),
  );
}

/** Average of days that have logs. Days with no entries are left out. */
export function averageLoggedDays<
  T extends Pick<DatedCalorieLog, "date" | "calories" | "proteinG">,
>(
  logs: T[],
  startDate: string,
  endDateInclusive: string,
  excludeDate?: string,
) {
  const totalsByDate = new Map<
    string,
    { calories: number; proteinG: number }
  >();

  for (const log of logs) {
    if (log.date < startDate || log.date > endDateInclusive) continue;
    if (excludeDate !== undefined && log.date === excludeDate) continue;

    const current = totalsByDate.get(log.date) ?? { calories: 0, proteinG: 0 };
    current.calories += log.calories;
    current.proteinG += log.proteinG;
    totalsByDate.set(log.date, current);
  }

  const dayCount = totalsByDate.size;
  if (dayCount === 0) {
    return { calories: 0, proteinG: 0, dayCount: 0, pending: true };
  }

  let calories = 0;
  let proteinG = 0;
  for (const day of totalsByDate.values()) {
    calories += day.calories;
    proteinG += day.proteinG;
  }

  return {
    calories: calories / dayCount,
    proteinG: proteinG / dayCount,
    dayCount,
    pending: false,
  };
}

export function groupLogsByDate<T extends { date: string; createdAt: number }>(
  logs: T[],
) {
  const byDate = new Map<string, T[]>();
  for (const log of logs) {
    const entries = byDate.get(log.date);
    if (entries) {
      entries.push(log);
    } else {
      byDate.set(log.date, [log]);
    }
  }

  return [...byDate.entries()]
    .sort(([dateA], [dateB]) => (dateA < dateB ? 1 : dateA > dateB ? -1 : 0))
    .map(([date, entries]) => ({
      date,
      entries: [...entries].sort(
        (left, right) => right.createdAt - left.createdAt,
      ),
    }));
}

export function groupLogsByWeek<T extends DatedCalorieLog>(logs: T[]) {
  const byWeek = new Map<string, T[]>();
  for (const log of logs) {
    const weekStart = getSundayWeek(parseLocalDateKey(log.date)).startKey;
    const entries = byWeek.get(weekStart);
    if (entries) {
      entries.push(log);
    } else {
      byWeek.set(weekStart, [log]);
    }
  }

  return [...byWeek.entries()]
    .sort(([startA], [startB]) =>
      startA < startB ? 1 : startA > startB ? -1 : 0,
    )
    .map(([startKey, entries]) => {
      const endKey = toLocalDateKey(addDays(parseLocalDateKey(startKey), 6));
      return {
        startKey,
        endKey,
        entries,
        average: averageLoggedDays(entries, startKey, endKey),
      };
    });
}

export function formatLongDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  }).format(value);
}

export function formatShortDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(value);
}

export function formatWeekRange(start: Date, end: Date) {
  return `${formatShortDate(start)} – ${formatShortDate(end)}`;
}

export function formatLogDateHeading(dateKey: string, todayKey: string) {
  const shortDate = formatShortDate(parseLocalDateKey(dateKey));
  if (dateKey === todayKey) return `Today · ${shortDate}`;

  const yesterdayKey = toLocalDateKey(addDays(parseLocalDateKey(todayKey), -1));
  if (dateKey === yesterdayKey) return `Yesterday · ${shortDate}`;

  return shortDate;
}

export function formatCalories(value: number) {
  return Math.round(value).toLocaleString("en-US");
}

export function formatProtein(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function parseCaloriesInput(value: string) {
  const trimmed = value.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  if (!Number.isInteger(parsed) || parsed < 0) return null;
  return parsed;
}

export function parseProteinInput(value: string) {
  const trimmed = value.trim().replace(/\.$/, "");
  if (!/^\d+(\.\d)?$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) return null;
  return parsed;
}
