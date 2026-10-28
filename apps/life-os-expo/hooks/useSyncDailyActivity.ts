import { useEffect, useRef, useState } from "react";
import { api } from "@transcend/convex";
import { useMutation } from "convex/react";
import { AppState, type AppStateStatus } from "react-native";
import {
  ensureActivityAccess,
  readStepCount,
} from "@/components/health/appleHealth";
import { useLocalToday } from "@/hooks/useLocalToday";
import {
  addDays,
  parseLocalDateKey,
  toLocalDateKey,
} from "@/utils/calorieWeek";

export type SavedActivityDay = {
  date: string;
  steps: number;
};

function datesThroughToday(startKey: string, endKey: string, todayKey: string) {
  const lastKey = endKey < todayKey ? endKey : todayKey;
  if (startKey > lastKey) return [];
  const dates: string[] = [];
  for (
    let day = parseLocalDateKey(startKey);
    toLocalDateKey(day) <= lastKey;
    day = addDays(day, 1)
  ) {
    dates.push(toLocalDateKey(day));
  }
  return dates;
}

/**
 * Writes this device's steps for the week.
 * Friends only show up in the group totals after their own phones have synced.
 */
export function useSyncDailyActivity(
  enabled: boolean,
  startKey: string,
  endKey: string,
  saved: SavedActivityDay[] | undefined,
) {
  const setDailyActivity = useMutation(
    api.dailyActivity.setDailyActivity.setDailyActivity,
  );
  const todayKey = toLocalDateKey(useLocalToday());
  const savedRef = useRef(saved);
  const asked = useRef(false);
  const [resumeTick, setResumeTick] = useState(0);
  const ready = saved !== undefined;
  const savedKey =
    saved
      ?.map((day) => `${day.date}:${day.steps}`)
      .join(",") ?? "";

  useEffect(() => {
    savedRef.current = saved;
  }, [saved]);

  useEffect(() => {
    if (!enabled) return;
    const onChange = (state: AppStateStatus) => {
      if (state === "active") setResumeTick((tick) => tick + 1);
    };
    const subscription = AppState.addEventListener("change", onChange);
    return () => subscription.remove();
  }, [enabled]);

  useEffect(() => {
    if (!enabled || !ready) return;
    let cancelled = false;

    void (async () => {
      if (!asked.current) {
        asked.current = true;
        await ensureActivityAccess();
      }
      if (cancelled) return;

      const known = new Map(
        (savedRef.current ?? []).map((day) => [day.date, day]),
      );
      const changes: SavedActivityDay[] = [];
      for (const date of datesThroughToday(startKey, endKey, todayKey)) {
        const steps = await readStepCount(date);
        if (cancelled) return;
        if (steps === null) continue;

        const previous = known.get(date);
        if (previous && previous.steps === steps) continue;
        changes.push({ date, steps });
      }

      if (cancelled || changes.length === 0) return;
      await setDailyActivity({ days: changes });
    })();

    return () => {
      cancelled = true;
    };
  }, [
    enabled,
    endKey,
    ready,
    resumeTick,
    savedKey,
    setDailyActivity,
    startKey,
    todayKey,
  ]);
}
