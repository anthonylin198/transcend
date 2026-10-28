import { formatWeightNumber } from "@/utils/weight";

export type GroupMember = {
  calorieLogs: { calories: number }[];
  workouts: unknown[];
  activity: { steps: number }[];
  poundsLost: number | null;
};

export type GroupWeekStats = {
  people: number;
  caloriesEaten: number;
  steps: number;
  workouts: number;
  /** Net pounds lost. Negative means the group gained. Null when nobody has a comparison. */
  poundsLost: number | null;
};

export function groupWeekStats(members: GroupMember[]): GroupWeekStats {
  let caloriesEaten = 0;
  let steps = 0;
  let workouts = 0;
  let poundsLost = 0;
  let weighed = 0;

  for (const member of members) {
    for (const log of member.calorieLogs) caloriesEaten += log.calories;
    workouts += member.workouts.length;
    for (const day of member.activity) {
      steps += day.steps;
    }
    if (member.poundsLost !== null) {
      poundsLost += member.poundsLost;
      weighed += 1;
    }
  }

  return {
    people: members.length,
    caloriesEaten,
    steps,
    workouts,
    poundsLost: weighed === 0 ? null : Math.round(poundsLost * 10) / 10,
  };
}

/** Full number under 10,000. From there, thousands like 12.4k or 124k. */
export function formatCompactCount(value: number) {
  const rounded = Math.round(value);
  const sign = rounded < 0 ? "-" : "";
  const absolute = Math.abs(rounded);
  if (absolute < 10_000) return `${sign}${absolute.toLocaleString("en-US")}`;
  if (absolute < 1_000_000) return `${sign}${formatScaled(absolute / 1000)}k`;
  return `${sign}${formatScaled(absolute / 1_000_000)}m`;
}

function formatScaled(scaled: number) {
  const digits = scaled >= 100 ? 0 : 1;
  return scaled.toFixed(digits).replace(/\.0$/, "");
}

export function formatGroupWeight(poundsLost: number | null) {
  if (poundsLost === null) return { value: "—", label: "LB LOST" };
  if (poundsLost < 0) {
    return {
      value: formatWeightNumber(Math.abs(poundsLost)),
      label: "LB GAINED",
    };
  }
  return { value: formatWeightNumber(poundsLost), label: "LB LOST" };
}
