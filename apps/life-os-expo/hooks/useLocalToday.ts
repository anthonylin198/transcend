import { useEffect, useState } from "react";
import { AppState } from "react-native";
import { startOfLocalDay } from "@/utils/calorieWeek";

export function useLocalToday() {
  const [today, setToday] = useState(() => startOfLocalDay(new Date()));

  useEffect(() => {
    const refresh = () => setToday(startOfLocalDay(new Date()));
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    return () => subscription.remove();
  }, []);

  return today;
}
