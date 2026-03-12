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

function toDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getHomeBootstrapRange(referenceDate: Date = new Date()) {
  const today = toStartOfDay(referenceDate);
  return {
    rangeStartDateKey: toDateKey(addDays(today, -HOME_DAY_WINDOW)),
    rangeEndDateKey: toDateKey(addDays(today, HOME_DAY_WINDOW + 1)),
  };
}
