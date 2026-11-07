const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function addDaysToDateKey(dateKey: string, amount: number) {
  assertLocalDateKey(dateKey);
  const [year, month, day] = dateKey.split("-").map(Number);
  const utc = new Date(Date.UTC(year, month - 1, day + amount));
  const nextYear = utc.getUTCFullYear();
  const nextMonth = String(utc.getUTCMonth() + 1).padStart(2, "0");
  const nextDay = String(utc.getUTCDate()).padStart(2, "0");
  return `${nextYear}-${nextMonth}-${nextDay}`;
}

export function assertSundayDateKey(dateKey: string) {
  assertLocalDateKey(dateKey);
  const [year, month, day] = dateKey.split("-").map(Number);
  if (new Date(Date.UTC(year, month - 1, day)).getUTCDay() !== 0) {
    throw new Error("Week must start on Sunday");
  }
}

export function assertLocalDateKey(value: string) {
  const match = DATE_KEY_PATTERN.exec(value);
  if (!match) {
    throw new Error("Date must use YYYY-MM-DD");
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  // UTC is used only to reject impossible dates such as February 31.
  // The stored value remains the client-supplied calendar day.
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (
    utc.getUTCFullYear() !== year ||
    utc.getUTCMonth() !== month - 1 ||
    utc.getUTCDate() !== day
  ) {
    throw new Error("Date must use YYYY-MM-DD");
  }
}
