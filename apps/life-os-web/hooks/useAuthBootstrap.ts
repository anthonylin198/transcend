"use client";

import { useEffect } from "react";
import { api, useConvexAuth, useMutation, useQuery } from "@transcend/convex";
import { getHomeBootstrapRange } from "@/lib/homeBootstrapRange";

type BootStatus = "unauthenticated" | "loading" | "ready";

export function useAuthBootstrap() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const { rangeStartDateKey, rangeEndDateKey } = getHomeBootstrapRange();
  const ensureProfile = useMutation(api.profile.ensureProfile);

  useEffect(() => {
    if (!isAuthenticated || authLoading) return;
    void ensureProfile({}).catch((error) => {
      console.warn("Failed to ensure profile during auth bootstrap", error);
    });
  }, [authLoading, ensureProfile, isAuthenticated]);

  const homeBootstrap = useQuery(
    api.home.bootstrap.bootstrap,
    isAuthenticated
      ? {
          rangeStartDateKey,
          rangeEndDateKey,
        }
      : "skip",
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
