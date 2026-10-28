import { useEffect, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { ExpoCalendarEvent } from "expo-calendar";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Linking, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { readStagedCalendarEvent } from "@/components/home/hooks/useCalendarEvents";
import Text from "@/components/ui/Text";
import { appFonts } from "@/constants/fonts";

type RemoteEventDetails = {
  title: string;
  notes: string;
  location: string | null;
  url?: string;
};

function readParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatTime(date: Date) {
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatDay(date: Date, withYear: boolean) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: withYear ? "numeric" : undefined,
  }).format(date);
}

function formatShortDay(date: Date, withYear: boolean) {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: withYear ? "numeric" : undefined,
  }).format(date);
}

function isSameDay(left: Date, right: Date) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

function inclusiveAllDayEnd(end: Date) {
  const next = new Date(end);
  if (
    next.getHours() === 0 &&
    next.getMinutes() === 0 &&
    next.getSeconds() === 0 &&
    next.getMilliseconds() === 0
  ) {
    next.setDate(next.getDate() - 1);
  }
  return next;
}

function eventSchedule(startsAt: Date, endsAt: Date, allDay: boolean) {
  const nowYear = new Date().getFullYear();
  if (allDay) {
    const inclusiveEnd = inclusiveAllDayEnd(endsAt);
    const end =
      inclusiveEnd.getTime() < startsAt.getTime() ? startsAt : inclusiveEnd;
    const withYear =
      startsAt.getFullYear() !== nowYear || end.getFullYear() !== nowYear;
    if (isSameDay(startsAt, end)) {
      return { primary: formatDay(startsAt, withYear), secondary: "All day" };
    }
    return {
      primary: `${formatShortDay(startsAt, withYear)} – ${formatShortDay(end, withYear)}`,
      secondary: "All day",
    };
  }

  const withYear =
    startsAt.getFullYear() !== nowYear || endsAt.getFullYear() !== nowYear;
  if (isSameDay(startsAt, endsAt)) {
    return {
      primary: formatDay(startsAt, withYear),
      secondary: `${formatTime(startsAt)} – ${formatTime(endsAt)}`,
    };
  }

  return {
    primary: `${formatShortDay(startsAt, withYear)}, ${formatTime(startsAt)} – ${formatShortDay(endsAt, withYear)}, ${formatTime(endsAt)}`,
    secondary: null,
  };
}

function toPlainText(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (
    !/<(?:br|p|div|span|a|ul|ol|li|b|i|strong|em|html|body)\b/i.test(trimmed)
  ) {
    return trimmed;
  }

  const withBreaks = trimmed
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\s*\/\s*p\s*>/gi, "\n\n")
    .replace(/<\s*\/\s*div\s*>/gi, "\n")
    .replace(/<\s*li[^>]*>/gi, "• ")
    .replace(/<\s*\/\s*li\s*>/gi, "\n");
  const stripped = withBreaks.replace(/<[^>]+>/g, "");
  return stripped
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function firstText(...values: (string | null | undefined)[]) {
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) return trimmed;
  }
  return "";
}

export default function CalendarEventScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{
    eventId?: string;
    startsAt?: string;
    endsAt?: string;
    allDay?: string;
  }>();
  const eventId = readParam(params.eventId) ?? "";
  const startsAtMs = Number(readParam(params.startsAt));
  const endsAtMs = Number(readParam(params.endsAt));
  const allDay = readParam(params.allDay) === "1";
  const staged = readStagedCalendarEvent(eventId, startsAtMs);
  const [remote, setRemote] = useState<
    (RemoteEventDetails & { eventId: string }) | null
  >(null);

  useEffect(() => {
    if (!eventId) return;

    let cancelled = false;

    void (async () => {
      try {
        const event = await ExpoCalendarEvent.get(eventId);
        if (cancelled) return;
        setRemote({
          eventId,
          title: event.title || "",
          notes: typeof event.notes === "string" ? event.notes : "",
          location: event.location?.trim() ? event.location.trim() : null,
          url: event.url?.trim() ? event.url.trim() : undefined,
        });
      } catch {
        if (!cancelled) setRemote(null);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const remoteDetails = remote?.eventId === eventId ? remote : null;

  const startsAt = Number.isFinite(startsAtMs)
    ? new Date(startsAtMs)
    : (staged?.startsAt ?? null);
  const endsAt = Number.isFinite(endsAtMs)
    ? new Date(endsAtMs)
    : (staged?.endsAt ?? null);
  const title =
    firstText(staged?.title, remoteDetails?.title) || "Untitled event";
  const location = firstText(staged?.location, remoteDetails?.location);
  const url = firstText(staged?.url, remoteDetails?.url);
  const notes = toPlainText(firstText(staged?.notes, remoteDetails?.notes));
  const schedule =
    startsAt && endsAt
      ? eventSchedule(startsAt, endsAt, allDay || !!staged?.allDay)
      : null;

  return (
    <View style={{ flex: 1, backgroundColor: "black" }}>
      <View
        style={{
          paddingTop: insets.top,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: "#1F2937",
          backgroundColor: "black",
        }}
      >
        <View
          style={{
            minHeight: 56,
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            onPress={() => router.back()}
            style={{ padding: 6 }}
          >
            <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 28,
          paddingBottom: Math.max(insets.bottom, 16) + 40,
          gap: 22,
        }}
      >
        <Text
          selectable
          style={{
            fontFamily: appFonts.semiBold,
            fontSize: 34,
            lineHeight: 40,
            letterSpacing: -0.8,
          }}
        >
          {title}
        </Text>

        {schedule ? (
          <View style={{ gap: 4 }}>
            <Text type="text-regular" color="#A3A3A3">
              {schedule.primary}
            </Text>
            {schedule.secondary ? (
              <Text
                type="text-regular"
                color="#A3A3A3"
                style={{ fontVariant: ["tabular-nums"] }}
              >
                {schedule.secondary}
              </Text>
            ) : null}
          </View>
        ) : null}

        {location ? (
          <Text type="text-regular" color="#E5E5E5" selectable>
            {location}
          </Text>
        ) : null}

        {notes ? (
          <Text type="text-regular" color="#E5E5E5" selectable>
            {notes}
          </Text>
        ) : null}

        {url ? (
          <Pressable
            accessibilityRole="link"
            onPress={() => {
              const target = /^https?:\/\//i.test(url) ? url : `https://${url}`;
              void Linking.openURL(target);
            }}
          >
            <Text type="text-regular" color="#A3A3A3">
              {url}
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}
