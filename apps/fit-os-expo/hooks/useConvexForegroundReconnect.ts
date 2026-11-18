import { useEffect } from "react";
import type { ConvexReactClient } from "convex/react";
import { AppState, type AppStateStatus } from "react-native";
import { toLocalDateKey } from "@/utils/calorieWeek";

type LiveSocket = {
  state?: string;
};

type WebSocketManagerLike = {
  socket?: LiveSocket;
  closeAndReconnect?: (reason: string) => void;
  tryRestart?: () => void;
};

function convexSocket(client: ConvexReactClient) {
  const sync = (
    client as unknown as {
      sync?: { webSocketManager?: WebSocketManagerLike };
    }
  ).sync;
  return sync?.webSocketManager;
}

function isSocketOpen(client: ConvexReactClient) {
  return convexSocket(client)?.socket?.state === "ready";
}

/**
 * Open a fresh Convex socket. onOpen resends every current subscription,
 * including the home query whose date range just moved to today.
 *
 * Closing the raw socket is not enough: a socket iOS froze overnight often
 * never fires onclose, so the client keeps treating it as connected and the
 * new day's query is never sent.
 */
export function reconnectConvexClient(client: ConvexReactClient) {
  const manager = convexSocket(client);
  const state = manager?.socket?.state;
  if (state === "ready" || state === "connecting") {
    manager?.closeAndReconnect?.("AppForeground");
    return;
  }
  // A token refresh stops the socket. If that restart never happened, start
  // it now. Otherwise today's query has nowhere to go.
  if (state === "stopped") {
    manager?.tryRestart?.();
  }
}

export function useConvexForegroundReconnect(client: ConvexReactClient | null) {
  useEffect(() => {
    if (!client) return;

    let lastDateKey = toLocalDateKey(new Date());
    const onChange = (state: AppStateStatus) => {
      if (state !== "active") return;

      const nextDateKey = toLocalDateKey(new Date());
      const dayChanged = nextDateKey !== lastDateKey;
      lastDateKey = nextDateKey;
      // Same-day resume can reuse an open socket. A new day cannot.
      if (!dayChanged && isSocketOpen(client)) return;

      // useLocalToday updates in this same event. Reconnect after that
      // render so the new socket asks for today's range, not yesterday's.
      setTimeout(() => reconnectConvexClient(client), 0);
    };

    const subscription = AppState.addEventListener("change", onChange);
    return () => subscription.remove();
  }, [client]);
}
