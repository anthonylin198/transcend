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
