import { useEffect, useMemo } from "react";
import { api } from "@transcend/convex";
import { useConvexAuth, useMutation, useQuery } from "convex/react";
import { useLocalToday } from "@/hooks/useLocalToday";
import { getHomeBootstrapRange } from "@/utils/homeBootstrapRange";

type BootStatus = "unauthenticated" | "loading" | "ready";

export function useAuthBootstrap() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const today = useLocalToday();
  const { rangeStartDateKey, rangeEndDateKey } = useMemo(
    () => getHomeBootstrapRange(today),
    [today],
  );
  const ensureProfile = useMutation(api.profile.ensureProfile);

  useEffect(() => {
    if (!isAuthenticated || authLoading) return;
    void ensureProfile({}).catch((error) => {
      console.warn("Failed to ensure profile during auth bootstrap", error);
    });
  }, [authLoading, isAuthenticated, ensureProfile]);

  const homeBootstrap = useQuery(
    api.home.bootstrap.bootstrap,
    isAuthenticated
      ? {
          rangeStartDateKey,
          rangeEndDateKey,
        }
      : ("skip" as any),
  );

  let status: BootStatus = "loading";
  if (!authLoading) {
    if (!isAuthenticated) {
      status = "unauthenticated";
    } else if (homeBootstrap === undefined || homeBootstrap.profile === null) {
      status = "loading";
    } else {
      status = "ready";
    }
  }

  return {
    status,
    bootReady: status === "ready" || status === "unauthenticated",
    isAuthenticated,
  };
}
