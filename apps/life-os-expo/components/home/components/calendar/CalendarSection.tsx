import { useEffect, useState } from "react";
import type { CalendarEventItem } from "@/components/home/hooks/useCalendarEvents";
import SectionHeader from "@/components/home/components/SectionHeader";
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
    <View style={{ gap: 14 }}>
      <SectionHeader
        title="CALENDAR"
        meta={
          calendarEvents.length > 0 ? String(calendarEvents.length) : undefined
        }
      />
      {calendarEvents.length === 0 ? (
        <Text type="text-regular" color="#525252">
          No events
        </Text>
      ) : (
        <View style={{ gap: 14 }}>
          {calendarEvents.map((item) => {
            const isPast = item.endsAt.getTime() < now;
            const timeLabel = item.allDay
              ? "All day"
              : `${formatEventTime(item.startsAt)} – ${formatEventTime(item.endsAt)}`;

            return (
              <View
                key={item.id}
                style={{ flexDirection: "row", alignItems: "stretch", gap: 10 }}
              >
                <View style={{ width: 22, alignItems: "center" }}>
                  <View
                    style={{
                      flex: 1,
                      width: 3,
                      marginVertical: 3,
                      borderRadius: 2,
                      backgroundColor: isPast ? "#1F1F1F" : "#404040",
                    }}
                  />
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text
                    type="text-regular"
                    color={isPast ? "#525252" : "#FAFAFA"}
                  >
                    {item.title}
                  </Text>
                  <Text
                    type="text-detail"
                    color={isPast ? "#404040" : "#737373"}
                    style={{ fontVariant: ["tabular-nums"] }}
                  >
                    {timeLabel}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}
