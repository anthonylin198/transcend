import { useEffect, useMemo } from "react";
import { api } from "@transcend/convex";
import { useQuery } from "convex/react";
import { useLocalToday } from "@/hooks/useLocalToday";
import { getHomeBootstrapRange } from "@/utils/homeBootstrapRange";
import {
  clearCalorieWidget,
  registerCalorieWidget,
  syncCalorieWidget,
} from "@/widgets/syncCalorieWidget";

export function useCalorieWidgetSync(isAuthenticated: boolean | null) {
  const today = useLocalToday();
  const bootstrapRange = useMemo(() => getHomeBootstrapRange(today), [today]);
  const homeBootstrap = useQuery(
    api.home.bootstrap.bootstrap,
    isAuthenticated ? bootstrapRange : "skip",
  );

  useEffect(() => {
    registerCalorieWidget();
  }, []);

  useEffect(() => {
    if (isAuthenticated === null) return;
    if (!isAuthenticated) {
      clearCalorieWidget();
      return;
    }
    if (homeBootstrap === undefined || homeBootstrap.profile === null) return;
    syncCalorieWidget(homeBootstrap.calorieLogs, today);
  }, [homeBootstrap, isAuthenticated, today]);
}
