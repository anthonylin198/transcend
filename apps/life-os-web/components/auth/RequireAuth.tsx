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
      router.replace("/sign-in");
    }
  }, [router, status]);

  if (status !== "ready") {
    return <LoadingScreen label="Checking session..." />;
  }

  return <>{children}</>;
}
