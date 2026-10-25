import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { api } from "@transcend/convex";
import { useQuery } from "convex/react";
import { Modal, View } from "react-native";
import SplashCover from "@/components/ui/SplashCover";
import { useLocalToday } from "@/hooks/useLocalToday";
import { toLocalDateKey } from "@/utils/calorieWeek";
import { getHomeBootstrapRange } from "@/utils/homeBootstrapRange";

// The new day's pager can paint blank for a moment after the query resolves.
const DAY_CHANGE_SETTLE_MS = 180;

export function DayChangeProvider({ children }: { children: ReactNode }) {
  const today = useLocalToday();
  const todayKey = toLocalDateKey(today);
  const range = useMemo(() => getHomeBootstrapRange(today), [today]);
  const bootstrap = useQuery(api.home.bootstrap.bootstrap, range);
  const dataReady = bootstrap?.profile != null;
  // Stays on the previous day until that day's data is in, so the empty
  // lists under the splash never get revealed on their own.
  const [settledKey, setSettledKey] = useState(todayKey);
  const covering = settledKey !== todayKey;

  useEffect(() => {
    if (!covering || !dataReady) return;
    const timeout = setTimeout(
      () => setSettledKey(todayKey),
      DAY_CHANGE_SETTLE_MS,
    );
    return () => clearTimeout(timeout);
  }, [covering, dataReady, todayKey]);

  return (
    <>
      {children}
      {covering ? (
        <Modal
          visible
          animationType="none"
          presentationStyle="fullScreen"
          statusBarTranslucent
          onRequestClose={() => {}}
        >
          <View style={{ flex: 1, backgroundColor: "#000000" }}>
            <SplashCover />
          </View>
        </Modal>
      ) : null}
    </>
  );
}
