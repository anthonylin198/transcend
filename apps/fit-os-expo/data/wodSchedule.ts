import { wods, type Wod } from "@/data/wods";

/**
 * Six weeks, Monday through Sunday, then it repeats.
 * Monday is upper, Tuesday is lower, Wednesday is olympic.
 * Thursday through Sunday walk down the endurance list.
 * The cycle starts Monday, November 16, 2026.
 */
export const wodSchedule = [
  "missing-monocle",
  "looney-toons",
  "in-the-rough",
  "team-badger",
  "doppelganger",
  "familiar-stranger",
  "the-back-nine",

  "apex",
  "jamais-vu",
  "ambush",
  "best-ball",
  "natural-selection",
  "double-helix",
  "intertwined",

  "chain-reaction",
  "fore",
  "fight-or-flight",
  "mixed-signals",
  "the-upside-down",
  "the-other-side",
  "the-threshold",

  "the-rift",
  "the-yips",
  "interlocked",
  "engine-check",
  "controlled-chaos",
  "repeat-offender",
  "hang-time",

  "climbing-the-walls",
  "the-chase",
  "deja-vu",
  "burden-run",
  "chicka-chicka-boom-boom",
  "going-on-a-bear-hunt",
  "room-on-the-broom",

  "go-dog-go",
  "tangled",
  "hanging-on-by-a-thread",
  "donkey-kong",
  "bonus-round",
  "multiplayer-mode",
  "chad-1000x",
] as const;

const CYCLE_START_UTC = Date.UTC(2026, 10, 16);
const DAY_MS = 86_400_000;

const wodsById = new Map(wods.map((wod) => [wod.id, wod]));

export function scheduleIndex(date: Date) {
  const day = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = Math.floor((day - CYCLE_START_UTC) / DAY_MS);
  const length = wodSchedule.length;
  return ((offset % length) + length) % length;
}

export function scheduledWod(date: Date = new Date()): Wod | undefined {
  return wodsById.get(wodSchedule[scheduleIndex(date)]);
}

export function cycleDays(anchor: Date = new Date()) {
  const start = new Date(
    anchor.getFullYear(),
    anchor.getMonth(),
    anchor.getDate() - scheduleIndex(anchor),
  );

  return wodSchedule.map((id, offset) => ({
    date: new Date(start.getFullYear(), start.getMonth(), start.getDate() + offset),
    wod: wodsById.get(id),
  }));
}
