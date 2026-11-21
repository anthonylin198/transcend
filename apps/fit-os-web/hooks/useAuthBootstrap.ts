"use client";

import { useEffect, useRef, useState } from "react";
import { api, useConvexAuth, useMutation } from "@transcend/convex";

type BootStatus = "unauthenticated" | "loading" | "ready";

export function useAuthBootstrap() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const ensureProfile = useMutation(api.profile.ensureProfile);
  const ensured = useRef(false);
  const [profileReady, setProfileReady] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || authLoading) {
      ensured.current = false;
      setProfileReady(false);
      return;
    }
    if (ensured.current) return;
    ensured.current = true;
    void ensureProfile({})
      .then(() => setProfileReady(true))
      .catch((error) => {
        ensured.current = false;
        console.warn("Failed to ensure profile during auth bootstrap", error);
      });
  }, [authLoading, ensureProfile, isAuthenticated]);

  let status: BootStatus = "loading";
  if (!authLoading && !isAuthenticated) {
    status = "unauthenticated";
  } else if (!authLoading && isAuthenticated && profileReady) {
    status = "ready";
  }

  return {
    status,
    isAuthenticated,
  };
}
