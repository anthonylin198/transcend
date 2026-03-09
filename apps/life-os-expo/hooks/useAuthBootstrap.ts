import { useEffect, useRef } from "react";
import { api, useConvexAuth, useMutation, useQuery } from "@transcend/convex";

type BootStatus = "unauthenticated" | "loading" | "ready";

export function useAuthBootstrap() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const homeBootstrap = useQuery(
    api.home.bootstrap,
    isAuthenticated ? {} : ("skip" as any),
  );
  const ensureProfile = useMutation(api.profile.ensureProfile);
  const ensuringProfile = useRef(false);
  const attemptedProfileBootstrap = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) {
      attemptedProfileBootstrap.current = false;
      ensuringProfile.current = false;
      return;
    }
    if (homeBootstrap === undefined) return;
    if (homeBootstrap.profile !== null) return;
    if (ensuringProfile.current || attemptedProfileBootstrap.current) return;

    ensuringProfile.current = true;
    attemptedProfileBootstrap.current = true;
    void ensureProfile({})
      .catch((error) => {
        console.warn("Failed to ensure profile during auth bootstrap", error);
        // Allow another attempt on the next reactive pass.
        attemptedProfileBootstrap.current = false;
      })
      .finally(() => {
        ensuringProfile.current = false;
      });
  }, [isAuthenticated, homeBootstrap, ensureProfile]);

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
