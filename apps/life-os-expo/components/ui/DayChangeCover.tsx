import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api } from "@transcend/convex";
import { useQuery } from "convex/react";
import { View } from "react-native";
import SplashCover from "@/components/ui/SplashCover";
import { useLocalToday } from "@/hooks/useLocalToday";
import { toLocalDateKey } from "@/utils/calorieWeek";
import { getHomeBootstrapRange } from "@/utils/homeBootstrapRange";

const DAY_CHANGE_REVEAL_TIMEOUT_MS = 12_000;
// PagerView's new day can paint blank for a moment after the query resolves.
const DAY_CHANGE_SETTLE_MS = 180;

const DayChangeContext = createContext(false);

export function DayChangeProvider({ children }: { children: ReactNode }) {
  const today = useLocalToday();
  const todayKey = toLocalDateKey(today);
  const range = useMemo(() => getHomeBootstrapRange(today), [today]);
  const bootstrap = useQuery(api.home.bootstrap.bootstrap, range);
  const dataReady = bootstrap?.profile != null;
  const [settledKey, setSettledKey] = useState(todayKey);
  const covering = settledKey !== todayKey;

  useEffect(() => {
    if (!covering || !dataReady) return;
    const timeout = setTimeout(() => {
      setSettledKey(todayKey);
    }, DAY_CHANGE_SETTLE_MS);
    return () => clearTimeout(timeout);
  }, [covering, dataReady, todayKey]);

  useEffect(() => {
    if (!covering) return;
    const timeout = setTimeout(() => {
      setSettledKey(todayKey);
    }, DAY_CHANGE_REVEAL_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [covering, todayKey]);

  return (
    <DayChangeContext.Provider value={covering}>
      {children}
    </DayChangeContext.Provider>
  );
}

export default function DayChangeCover() {
  const covering = useContext(DayChangeContext);
  if (!covering) return null;

  return (
    <View
      pointerEvents="auto"
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        zIndex: 50,
        elevation: 50,
        backgroundColor: "#000000",
      }}
    >
      <SplashCover />
    </View>
  );
}
