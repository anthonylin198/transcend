"use client";

import { useEffect, useState } from "react";
import { api, useConvexAuth, useMutation } from "@transcend/convex";

type BootStatus = "unauthenticated" | "loading" | "ready";

export function useAuthBootstrap() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const ensureProfile = useMutation(api.profile.ensureProfile);
  const signedIn = !authLoading && isAuthenticated;
  const [session, setSession] = useState({ signedIn, ready: false });

  if (session.signedIn !== signedIn) {
    setSession({ signedIn, ready: false });
  }

  useEffect(() => {
    if (!signedIn) return;
    let cancelled = false;
    void ensureProfile({})
      .then(() => {
        if (!cancelled) setSession({ signedIn: true, ready: true });
      })
      .catch((error) => {
        console.warn("Failed to ensure profile during auth bootstrap", error);
      });
    return () => {
      cancelled = true;
    };
  }, [ensureProfile, signedIn]);

  let status: BootStatus = "loading";
  if (!signedIn && !authLoading) {
    status = "unauthenticated";
  } else if (signedIn && session.ready) {
    status = "ready";
  }

  return {
    status,
    isAuthenticated,
  };
}
