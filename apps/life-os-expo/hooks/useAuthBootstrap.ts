import { useEffect, useRef } from "react";
import { api } from "@transcend/convex";
import { useConvexAuth, useMutation, useQuery } from "convex/react";

type BootStatus = "unauthenticated" | "loading" | "ready";
const HOME_DAY_WINDOW = 7;

function toStartOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function addDays(value: Date, amount: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + amount);
  return date;
}

export function useAuthBootstrap() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const today = toStartOfDay(new Date());
  const rangeStartMs = addDays(today, -HOME_DAY_WINDOW).getTime();
  const rangeEndMs = addDays(today, HOME_DAY_WINDOW + 1).getTime();
  const homeBootstrap = useQuery(
    api.home.bootstrap.bootstrap,
    isAuthenticated
      ? {
          rangeStartMs,
          rangeEndMs,
        }
      : ("skip" as any),
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
    } else if (homeBootstrap === undefined) {
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
