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
      router.replace(safeInternalPath(window.location.search));
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

function safeInternalPath(search: string) {
  const next = new URLSearchParams(search).get("next");
  if (
    !next ||
    !next.startsWith("/") ||
    next.startsWith("//") ||
    next.startsWith("/sign-in") ||
    next.includes("\\")
  ) {
    return "/home";
  }
  return next;
}
