import { useCallback, useEffect, useRef, useState } from "react";
import * as Calendar from "expo-calendar";

export type CalendarEventItem = {
  id: string;
  title: string;
  startsAt: Date;
  endsAt: Date;
  allDay: boolean;
};

type UseCalendarEventsArgs = {
  startDate: Date;
  endDate: Date;
};

function toStartOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function toEndOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(23, 59, 59, 999);
  return date;
}

function addDays(value: Date, amount: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + amount);
  return date;
}

function overlapsDay(
  eventStart: Date,
  eventEnd: Date,
  dayStart: Date,
  dayEnd: Date,
) {
  return (
    eventStart.getTime() <= dayEnd.getTime() &&
    eventEnd.getTime() >= dayStart.getTime()
  );
}

export function getDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function useCalendarEvents({
  startDate,
  endDate,
}: UseCalendarEventsArgs) {
  const [eventsByDay, setEventsByDay] = useState<
    Record<string, CalendarEventItem[]>
  >({});
  const [loadingCalendar, setLoadingCalendar] = useState(false);
  const [loadedRangeKey, setLoadedRangeKey] = useState<string | null>(null);
  const requestId = useRef(0);

  const loadCalendarEvents = useCallback(async () => {
    const request = ++requestId.current;
    const rangeKey = `${getDateKey(startDate)}:${getDateKey(endDate)}`;
    setLoadingCalendar(true);
    try {
      const permission = await Calendar.getCalendarPermissionsAsync();
      if (request !== requestId.current) return;

      if (!permission.granted) {
        setEventsByDay({});
        return;
      }

      const calendars = await Calendar.getCalendarsAsync(
        Calendar.EntityTypes.EVENT,
      );
      if (request !== requestId.current) return;
      if (calendars.length === 0) {
        setEventsByDay({});
        return;
      }

      const rangeStart = toStartOfDay(startDate);
      const rangeEnd = toEndOfDay(endDate);

      const events = await Calendar.getEventsAsync(
        calendars.map((calendar) => calendar.id),
        rangeStart,
        rangeEnd,
      );

      const normalizedEvents = events
        .filter((event) => event.startDate && event.endDate)
        .map((event) => ({
          id: event.id,
          title: event.title || "Untitled event",
          startsAt: new Date(event.startDate),
          endsAt: new Date(event.endDate),
          allDay: !!event.allDay,
        }))
        .sort((a, b) => a.startsAt.getTime() - b.startsAt.getTime());

      const nextEventsByDay: Record<string, CalendarEventItem[]> = {};
      for (
        let cursor = rangeStart;
        cursor.getTime() <= rangeEnd.getTime();
        cursor = addDays(cursor, 1)
      ) {
        const dayStart = toStartOfDay(cursor);
        const dayEnd = toEndOfDay(cursor);
        const dayKey = getDateKey(dayStart);
        nextEventsByDay[dayKey] = normalizedEvents.filter((event) =>
          overlapsDay(event.startsAt, event.endsAt, dayStart, dayEnd),
        );
      }

      if (request !== requestId.current) return;
      setEventsByDay(nextEventsByDay);
    } finally {
      if (request === requestId.current) {
        setLoadedRangeKey(rangeKey);
        setLoadingCalendar(false);
      }
    }
  }, [endDate, startDate]);

  useEffect(() => {
    void loadCalendarEvents();
  }, [loadCalendarEvents]);

  return {
    eventsByDay,
    loadingCalendar,
    loadedRangeKey,
    reloadCalendarEvents: loadCalendarEvents,
  };
}
