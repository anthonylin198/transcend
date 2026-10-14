import { useEffect, useState } from "react";
import type { CalendarEventItem } from "@/components/home/hooks/useCalendarEvents";
import Text from "@/components/ui/Text";
import { View } from "react-native";

const EVENT_PAST_CHECK_INTERVAL_MS = 30_000;

function formatEventTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export default function CalendarSection({
  calendarEvents,
}: {
  calendarEvents: CalendarEventItem[];
}) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(Date.now());
    }, EVENT_PAST_CHECK_INTERVAL_MS);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <View style={{ gap: 10 }}>
      <Text type="heading-4" color="#9CA3AF">
        Calendar
      </Text>
      {calendarEvents.length === 0 ? (
        <Text type="text-regular" color="#9CA3AF">
          No events
        </Text>
      ) : (
        <View style={{ gap: 10 }}>
          {calendarEvents.map((item) => {
            const isPast = item.endsAt.getTime() < now;
            const timeLabel = item.allDay
              ? "All day"
              : formatEventTime(item.startsAt);

            return (
              <Text
                key={item.id}
                type="text-regular"
                color={isPast ? "#6B7280" : "#D1D5DB"}
                style={
                  isPast ? { textDecorationLine: "line-through" } : undefined
                }
              >
                {timeLabel} - {item.title}
              </Text>
            );
          })}
        </View>
      )}
    </View>
  );
}
