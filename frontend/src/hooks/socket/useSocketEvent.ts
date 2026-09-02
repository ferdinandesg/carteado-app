import { useEffect, useRef } from "react";
import type { ServerToClientEvents } from "shared/socket";

import { useSocket } from "@/contexts/socket.context";

type UntypedListenerApi = {
  on(event: string, listener: (...args: unknown[]) => void): unknown;
  off(event: string, listener: (...args: unknown[]) => void): unknown;
};

type UseSocketEventOptions = {
  /** Quando `false`, o listener não é registrado (útil para aguardar auth/room). */
  enabled?: boolean;
};

/**
 * Registra um listener tipado para um evento do servidor e o remove no unmount.
 * O handler mais recente é sempre usado (via ref), então o consumidor não
 * precisa memoizá-lo e o socket não re-subscreve a cada render.
 */
export function useSocketEvent<E extends keyof ServerToClientEvents>(
  event: E,
  handler: ServerToClientEvents[E],
  { enabled = true }: UseSocketEventOptions = {}
) {
  const { socket } = useSocket();
  const handlerRef = useRef(handler);

  useEffect(() => {
    handlerRef.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!enabled) return;

    // O `on` genérico do socket.io não aceita `ServerToClientEvents[E]` com E
    // aberto; a tipagem é garantida na assinatura pública deste hook.
    const listener = (...args: unknown[]) =>
      (handlerRef.current as (...a: unknown[]) => void)(...args);
    const emitter = socket as unknown as UntypedListenerApi;

    emitter.on(event, listener);
    return () => {
      emitter.off(event, listener);
    };
  }, [socket, event, enabled]);
}
