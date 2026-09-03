import { useCallback } from "react";
import type { ClientToServerEvents } from "shared/socket";

import { useSocket } from "@/contexts/socket.context";

export type SocketEmit = <E extends keyof ClientToServerEvents>(
  event: E,
  ...args: Parameters<ClientToServerEvents[E]>
) => void;

/** Retorna um `emit` tipado e referencialmente estável para o socket da sala. */
export function useSocketEmit(): SocketEmit {
  const { socket } = useSocket();

  return useCallback<SocketEmit>(
    (event, ...args) => {
      socket.emit(event, ...args);
    },
    [socket]
  );
}
