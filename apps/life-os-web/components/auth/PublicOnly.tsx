"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthBootstrap } from "@/hooks/useAuthBootstrap";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export function PublicOnly({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { status } = useAuthBootstrap();

  useEffect(() => {
    if (status === "ready") {
      router.replace("/home");
    }
  }, [router, status]);

  if (status === "loading") {
    return <LoadingScreen label="Checking session..." />;
  }

  if (status === "ready") {
    return <LoadingScreen label="Redirecting..." />;
  }

  return <>{children}</>;
}
