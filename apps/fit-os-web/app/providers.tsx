"use client";

import { ConvexAuthProvider } from "@convex-dev/auth/react";
import { ConvexReactClient } from "convex/react";

const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convexClient = convexUrl ? new ConvexReactClient(convexUrl) : null;

export function Providers({ children }: { children: React.ReactNode }) {
  if (!convexClient) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black px-6 text-center text-zinc-300">
        Missing `NEXT_PUBLIC_CONVEX_URL`. Add it to the web app env to connect
        to Convex.
      </div>
    );
  }

  return (
    <ConvexAuthProvider client={convexClient}>{children}</ConvexAuthProvider>
  );
}
