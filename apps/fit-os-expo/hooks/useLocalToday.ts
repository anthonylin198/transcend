import { useCallback, useEffect, useState } from "react";
import { useFocusEffect } from "expo-router";
import { AppState, type AppStateStatus } from "react-native";
import { startOfLocalDay, toLocalDateKey } from "@/utils/calorieWeek";

// While the app is open, recheck well before a one-minute poll so midnight
// rollover is not waiting on a timer that iOS suspended overnight.
const FOREGROUND_RECHECK_MS = 15_000;

function msUntilNextLocalMidnight(from = new Date()) {
  const next = startOfLocalDay(from);
  next.setDate(next.getDate() + 1);
  return Math.max(next.getTime() - from.getTime(), 0);
}

export function useLocalToday() {
  const [today, setToday] = useState(() => startOfLocalDay(new Date()));

  const refresh = useCallback(() => {
    const next = startOfLocalDay(new Date());
    setToday((current) =>
      toLocalDateKey(current) === toLocalDateKey(next) ? current : next,
    );
  }, []);

  // Any render after midnight (navigation, a query update, resume) corrects
  // the stored day even if a background timer or AppState event was dropped.
  const renderedToday = startOfLocalDay(new Date());
  if (toLocalDateKey(renderedToday) !== toLocalDateKey(today)) {
    setToday(renderedToday);
  }

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    const schedule = () => {
      if (timeout) clearTimeout(timeout);
      const delay = Math.min(msUntilNextLocalMidnight(), FOREGROUND_RECHECK_MS);
      timeout = setTimeout(() => {
        refresh();
        if (AppState.currentState === "active") schedule();
      }, delay);
    };

    const onChange = (state: AppStateStatus) => {
      if (state !== "active") return;
      // Coming back from a long suspend often drops the scheduled timeout.
      // Recompute immediately and start a fresh one.
      refresh();
      schedule();
    };

    schedule();
    const subscription = AppState.addEventListener("change", onChange);
    return () => {
      if (timeout) clearTimeout(timeout);
      subscription.remove();
    };
  }, [refresh]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh]),
  );

  return today;
}
