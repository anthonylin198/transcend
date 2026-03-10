export const HOME_DAY_WINDOW = 7;

function toStartOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(value: Date, amount: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + amount);
  return date;
}

export function getHomeBootstrapRange(referenceDate: Date = new Date()) {
  const today = toStartOfDay(referenceDate);
  return {
    rangeStartMs: addDays(today, -HOME_DAY_WINDOW).getTime(),
    rangeEndMs: addDays(today, HOME_DAY_WINDOW + 1).getTime(),
  };
}
