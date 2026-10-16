import { useEffect, useMemo } from "react";
import { api } from "@transcend/convex";
import { useQuery } from "convex/react";
import { useLocalToday } from "@/hooks/useLocalToday";
import { getHomeBootstrapRange } from "@/utils/homeBootstrapRange";
import {
  clearTodayWidget,
  registerTodayWidget,
  syncTodayWidget,
} from "@/widgets/syncTodayWidget";

export function useTodayWidgetSync(isAuthenticated: boolean | null) {
  const today = useLocalToday();
  const bootstrapRange = useMemo(() => getHomeBootstrapRange(today), [today]);
  const homeBootstrap = useQuery(
    api.home.bootstrap.bootstrap,
    isAuthenticated ? bootstrapRange : "skip",
  );

  useEffect(() => {
    registerTodayWidget();
  }, []);

  useEffect(() => {
    if (isAuthenticated === null) return;
    if (!isAuthenticated) {
      clearTodayWidget();
      return;
    }
    if (homeBootstrap === undefined) return;
    syncTodayWidget(
      {
        priorities: homeBootstrap.priorities,
        habits: homeBootstrap.habits,
        habitCompletions: homeBootstrap.habitCompletions,
      },
      today,
    );
  }, [homeBootstrap, isAuthenticated, today]);
}
