"use client";

import { useEffect, useState } from "react";
import { api, useConvexAuth, useMutation } from "@transcend/convex";

type BootStatus = "unauthenticated" | "loading" | "ready";

export function useAuthBootstrap() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const ensureProfile = useMutation(api.profile.ensureProfile);
  const [boot, setBoot] = useState({
    isAuthenticated: false,
    profileReady: false,
  });

  if (boot.isAuthenticated !== isAuthenticated) {
    setBoot({ isAuthenticated, profileReady: false });
  }

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    let cancelled = false;
    void ensureProfile({})
      .then(() => {
        if (!cancelled) {
          setBoot({ isAuthenticated: true, profileReady: true });
        }
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
    } else if (boot.profileReady) {
      status = "ready";
    }
  }

  return {
    status,
    isAuthenticated,
  };
}
