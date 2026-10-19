import { useEffect, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { readStepCount } from "@/components/health/appleHealth";

export function useDaySteps(dateKey: string | null) {
  const [result, setResult] = useState<{
    dateKey: string;
    steps: number | null;
  } | null>(null);
  const requestId = useRef(0);

  useEffect(() => {
    if (!dateKey) return;
    const request = ++requestId.current;
    void readStepCount(dateKey).then((steps) => {
      if (request !== requestId.current) return;
      setResult({ dateKey, steps });
    });
    return () => {
      requestId.current += 1;
    };
  }, [dateKey]);

  useEffect(() => {
    if (!dateKey) return;
    const onChange = (state: AppStateStatus) => {
      if (state !== "active") return;
      const request = ++requestId.current;
      void readStepCount(dateKey).then((steps) => {
        if (request !== requestId.current) return;
        setResult({ dateKey, steps });
      });
    };
    const subscription = AppState.addEventListener("change", onChange);
    return () => subscription.remove();
  }, [dateKey]);

  const ready = result?.dateKey === dateKey;
  return {
    steps: ready ? result.steps : null,
    loading: dateKey !== null && !ready,
  };
}
