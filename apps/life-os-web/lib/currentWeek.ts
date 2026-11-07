function toDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export type SundayWeek = {
  weekStart: string;
  label: string;
};

const weekFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
});

/** Sunday-start week. `offset` 0 is the week containing `reference`. */
export function getSundayWeek(offset = 0, reference = new Date()): SundayWeek {
  const today = new Date(
    reference.getFullYear(),
    reference.getMonth(),
    reference.getDate(),
  );
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay() + offset * 7);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return {
    weekStart: toDateKey(start),
    label: `${weekFormat.format(start)} – ${weekFormat.format(end)}`,
  };
}

/** This week plus the following weeks. Matches the calorie feed's Sunday weeks. */
export function getUpcomingSundayWeeks(
  count: number,
  reference = new Date(),
): [SundayWeek, ...SundayWeek[]] {
  if (count < 1) {
    throw new Error("Week count must be at least 1");
  }
  return Array.from({ length: count }, (_, offset) =>
    getSundayWeek(offset, reference),
  ) as [SundayWeek, ...SundayWeek[]];
}
