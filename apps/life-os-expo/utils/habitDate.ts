export function toHabitDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function getHabitWeekdayName(value: Date) {
  return new Intl.DateTimeFormat(undefined, { weekday: "long" }).format(value);
}
