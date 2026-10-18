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
 * Drop the websocket and open a new one. onOpen reissues every current
 * subscription, including a bootstrap query whose date range just changed.
 * Closing the raw socket is not enough: a socket iOS froze overnight often
 * never fires onclose, so the client keeps treating it as connected.
 */
export function reconnectConvexClient(client: ConvexReactClient) {
  const manager = convexSocket(client);
  const state = manager?.socket?.state;
  if (state !== "ready" && state !== "connecting") return;
  manager?.closeAndReconnect?.("AppForeground");
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
      if (!dayChanged && isSocketOpen(client)) return;

      // The date hooks set state in this same event. Wait until that render
      // subscribes with the new range, then restart so the refetch uses it.
      setTimeout(() => reconnectConvexClient(client), 0);
    };

    const subscription = AppState.addEventListener("change", onChange);
    return () => subscription.remove();
  }, [client]);
}
