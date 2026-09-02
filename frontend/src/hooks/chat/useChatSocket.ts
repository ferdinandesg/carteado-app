import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { ChatMessage } from "shared/socket";

import { useSocket } from "@/contexts/socket.context";
import { useSocketEvent } from "@/hooks/socket/useSocketEvent";

type ChatState = {
  messages: ChatMessage[];
  isLoading: boolean;
  unreadCount: number;
};

type UseChatSocketOptions = {
  /** Quando retorna `true`, mensagens novas não contam como não lidas. */
  isFocused?: () => boolean;
};

/** Sala de chat: histórico, mensagens em tempo real e envio. */
export function useChatSocket(
  roomHash: string,
  { isFocused = () => true }: UseChatSocketOptions = {}
) {
  const { t } = useTranslation();
  const { socket, isConnected } = useSocket();
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: true,
    unreadCount: 0,
  });

  const isFocusedRef = useRef(isFocused);
  useEffect(() => {
    isFocusedRef.current = isFocused;
  }, [isFocused]);

  const append = useCallback((message: ChatMessage) => {
    const focused = isFocusedRef.current();
    setState((prev) => ({
      ...prev,
      messages: [...prev.messages, message],
      unreadCount: focused ? prev.unreadCount : prev.unreadCount + 1,
    }));
  }, []);

  useSocketEvent("join_chat", ({ message }) =>
    append({
      name: "system",
      message: t("ServerMessages.infos.PLAYER_JOINED", { player: message }),
    })
  );
  useSocketEvent("receive_message", append);
  // `load_messages` é o histórico completo: substitui em vez de acumular,
  // o que também evita duplicatas ao re-entrar no chat após reconexão.
  useSocketEvent("load_messages", (messages) =>
    setState((prev) => ({ ...prev, messages, isLoading: false }))
  );

  useEffect(() => {
    if (!roomHash || !isConnected) return;
    socket.emit("join_chat", { roomHash });
  }, [socket, roomHash, isConnected]);

  const sendMessage = useCallback(
    (message: string) => {
      const trimmed = message.trim();
      if (!trimmed) return;
      socket.emit("send_message", { roomHash, message: trimmed });
    },
    [socket, roomHash]
  );

  const markAsRead = useCallback(() => {
    setState((prev) =>
      prev.unreadCount === 0 ? prev : { ...prev, unreadCount: 0 }
    );
  }, []);

  return { ...state, sendMessage, markAsRead };
}
