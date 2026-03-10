import { Redirect } from "expo-router";
import { useConvexAuth } from "convex/react";

export default function Index() {
  const { isAuthenticated } = useConvexAuth();

  return isAuthenticated ? (
    <Redirect href="/(authenticated)/(tabs)" />
  ) : (
    <Redirect href="/(public)/sign-in" />
  );
}
