import {
  addDays,
  parseLocalDateKey,
  toLocalDateKey,
} from "@/utils/calorieWeek";

export type WeekWeight = {
  weekStart: string;
  pounds: number;
};

export function sanitizeWeight(value: string) {
  const cleaned = value.replace(/[^\d.]/g, "");
  const dotIndex = cleaned.indexOf(".");
  if (dotIndex === -1) return cleaned.slice(0, 4);

  const whole = cleaned.slice(0, dotIndex).slice(0, 4);
  const decimals = cleaned
    .slice(dotIndex + 1)
    .replace(/\./g, "")
    .slice(0, 1);
  return `${whole}.${decimals}`;
}

/** Pounds, greater than 0 and at most 1500, with at most one decimal. */
export function parseWeightInput(value: string) {
  const trimmed = value.trim().replace(/\.$/, "");
  if (!/^\d+(\.\d)?$/.test(trimmed)) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed <= 0 || parsed > 1500) return null;
  return Math.round(parsed * 10) / 10;
}

export function formatWeightNumber(value: number) {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
}

export function formatWeight(value: number) {
  return `${formatWeightNumber(value)} lb`;
}

/** Most recent weigh-in from a week before this one. */
export function priorWeight<T extends WeekWeight>(
  weights: T[],
  weekStart: string,
) {
  let prior: T | null = null;
  for (const weight of weights) {
    if (weight.weekStart >= weekStart) continue;
    if (!prior || weight.weekStart > prior.weekStart) prior = weight;
  }
  return prior;
}

function formatMonthDay(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(value);
}

export function formatWeightComparison(
  pounds: number,
  prior: WeekWeight,
  weekStart: string,
) {
  const delta = Math.round((pounds - prior.pounds) * 10) / 10;
  const previousWeek = toLocalDateKey(
    addDays(parseLocalDateKey(weekStart), -7),
  );
  const when =
    prior.weekStart === previousWeek
      ? "last week"
      : `week of ${formatMonthDay(parseLocalDateKey(prior.weekStart))}`;
  if (delta === 0) return `Same as ${when}`;
  const sign = delta > 0 ? "+" : "−";
  return `${sign}${formatWeightNumber(Math.abs(delta))} lb vs ${when}`;
}
