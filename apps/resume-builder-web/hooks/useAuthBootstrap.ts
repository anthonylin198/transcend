"use client";

import { useEffect, useState } from "react";
import { api, useConvexAuth, useMutation } from "@transcend/convex";

type BootStatus = "unauthenticated" | "loading" | "ready";

export function useAuthBootstrap() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const ensureProfile = useMutation(api.profile.ensureProfile);
  const [profileReady, setProfileReady] = useState(false);

  useEffect(() => {
    if (authLoading || !isAuthenticated) {
      setProfileReady(false);
      return;
    }

    let cancelled = false;
    void ensureProfile({})
      .then(() => {
        if (!cancelled) setProfileReady(true);
      })
      .catch((error) => {
        console.warn("Failed to ensure profile during auth bootstrap", error);
      });

    return () => {
      cancelled = true;
    };
  }, [authLoading, ensureProfile, isAuthenticated]);

  let status: BootStatus = "loading";
  if (!authLoading) {
    if (!isAuthenticated) {
      status = "unauthenticated";
    } else if (profileReady) {
      status = "ready";
    }
  }

  return {
    status,
    isAuthenticated,
  };
}
