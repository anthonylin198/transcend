"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthBootstrap } from "@/hooks/useAuthBootstrap";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status } = useAuthBootstrap();

  useEffect(() => {
    if (status === "unauthenticated") {
      const next = `${window.location.pathname}${window.location.search}`;
      router.replace(`/sign-in?next=${encodeURIComponent(next)}`);
    }
  }, [router, status]);

  if (status !== "ready") {
    return <LoadingScreen label="Checking session..." />;
  }

  return <>{children}</>;
}
