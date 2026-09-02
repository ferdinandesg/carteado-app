import type { GameSocket } from "./client";

export type SocketConnectionStatus = {
  isConnected: boolean;
  /** `true` entre a queda e a reconexão automática do Socket.IO. */
  isReconnecting: boolean;
  lastDisconnectReason: string | null;
};

const SERVER_SNAPSHOT: SocketConnectionStatus = {
  isConnected: false,
  isReconnecting: false,
  lastDisconnectReason: null,
};

/**
 * Store externa (padrão `useSyncExternalStore`) que espelha o estado de conexão
 * de um socket. O snapshot só troca de referência quando algum campo muda,
 * então consumidores não re-renderizam à toa.
 */
export function createConnectionStatusStore(socket: GameSocket) {
  let snapshot: SocketConnectionStatus = {
    isConnected: socket.connected,
    isReconnecting: false,
    lastDisconnectReason: null,
  };
  const listeners = new Set<() => void>();

  const update = (patch: Partial<SocketConnectionStatus>) => {
    const next = { ...snapshot, ...patch };
    const changed = (
      Object.keys(next) as (keyof SocketConnectionStatus)[]
    ).some((key) => next[key] !== snapshot[key]);
    if (!changed) return;
    snapshot = next;
    listeners.forEach((listener) => listener());
  };

  const onConnect = () => update({ isConnected: true, isReconnecting: false });
  const onDisconnect = (reason: string) =>
    update({ isConnected: false, lastDisconnectReason: reason });
  const onReconnectAttempt = () => update({ isReconnecting: true });
  const onReconnectFailed = () => update({ isReconnecting: false });

  let attached = 0;
  const attach = () => {
    if (attached++ > 0) return;
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.io.on("reconnect_attempt", onReconnectAttempt);
    socket.io.on("reconnect_failed", onReconnectFailed);
  };
  const detach = () => {
    if (--attached > 0) return;
    socket.off("connect", onConnect);
    socket.off("disconnect", onDisconnect);
    socket.io.off("reconnect_attempt", onReconnectAttempt);
    socket.io.off("reconnect_failed", onReconnectFailed);
  };

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      attach();
      return () => {
        listeners.delete(listener);
        detach();
      };
    },
    getSnapshot: () => snapshot,
    getServerSnapshot: () => SERVER_SNAPSHOT,
  };
}
