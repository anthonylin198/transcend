/**
 * Six weeks, Monday through Sunday, then it repeats.
 * Monday is upper, Tuesday is lower, Wednesday is olympic.
 * Thursday through Sunday walk down the endurance list.
 * The cycle starts Monday, November 16, 2026.
 */
export const WOD_CYCLE_START = "2026-11-16";

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

const DAY_MS = 86_400_000;

function cycleStartUtc(cycleStart: string) {
  const [year, month, day] = cycleStart.split("-").map(Number);
  return Date.UTC(year, (month ?? 1) - 1, day ?? 1);
}

export function scheduleIndex(date: Date, length: number, cycleStart: string) {
  if (length <= 0) return 0;
  const day = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  const offset = Math.floor((day - cycleStartUtc(cycleStart)) / DAY_MS);
  return ((offset % length) + length) % length;
}

export function scheduledSlug(
  wodSlugs: readonly string[],
  date: Date,
  cycleStart: string,
) {
  if (wodSlugs.length === 0) return undefined;
  return wodSlugs[scheduleIndex(date, wodSlugs.length, cycleStart)];
}

export function cycleDays(
  wodSlugs: readonly string[],
  cycleStart: string,
  anchor: Date = new Date(),
) {
  if (wodSlugs.length === 0) return [];
  const start = new Date(
    anchor.getFullYear(),
    anchor.getMonth(),
    anchor.getDate() - scheduleIndex(anchor, wodSlugs.length, cycleStart),
  );

  return wodSlugs.map((slug, offset) => ({
    date: new Date(
      start.getFullYear(),
      start.getMonth(),
      start.getDate() + offset,
    ),
    slug,
  }));
}
