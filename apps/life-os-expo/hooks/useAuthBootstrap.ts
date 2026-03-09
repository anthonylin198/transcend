import { api, useConvexAuth, useQuery } from "@transcend/convex";

type BootStatus = "unauthenticated" | "loading" | "ready";

export function useAuthBootstrap() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const homeBootstrap = useQuery(
    api.home.bootstrap,
    isAuthenticated ? {} : ("skip" as any),
  );

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
