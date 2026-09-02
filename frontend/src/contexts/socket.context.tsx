"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from "react";
import type { Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { toast, type Id as ToastId } from "react-toastify";
import { useTranslation } from "react-i18next";

import { gameSocket, type GameSocket } from "@/lib/socket/client";
import {
  createConnectionStatusStore,
  type SocketConnectionStatus,
} from "@/lib/socket/connectionStatus";
import logger from "@/lib/logger";

type SocketContextValue = SocketConnectionStatus & { socket: GameSocket };

type Translate = (key: string, options?: { defaultValue?: string }) => string;

const SocketContext = createContext<SocketContextValue | null>(null);

const connectionStatus = createConnectionStatusStore(gameSocket);

/**
 * Feedback ao usuário para eventos de infraestrutura (erros do servidor,
 * queda e reconexão). Listeners de domínio ficam nos hooks `useSocketEvent`.
 */
function bindFeedbackListeners(socket: GameSocket, translate: Translate) {
  let reconnectingToast: ToastId | null = null;

  const dismissReconnectingToast = () => {
    if (reconnectingToast === null) return;
    toast.dismiss(reconnectingToast);
    reconnectingToast = null;
  };

  const onConnectError = (err: Error) => {
    logger.error({ err }, "Socket connection failed.");
    toast.error(
      translate(`ServerMessages.errors.${err.message}`, {
        defaultValue: translate("ServerMessages.connection.FAILED"),
      })
    );
  };

  const onServerError = (code: string) => {
    toast.error(translate(`ServerMessages.errors.${code}`));
  };

  const onInfo = (code: string) => {
    toast.info(translate(`ServerMessages.infos.${code}`));
  };

  const onDisconnect = (reason: Socket.DisconnectReason) => {
    logger.warn({ reason }, "Socket disconnected.");
    // Desconexão explícita (logout/navegação) não é uma falha.
    if (reason === "io client disconnect") return;
    if (reconnectingToast !== null) return;
    reconnectingToast = toast.warn(
      translate("ServerMessages.connection.RECONNECTING"),
      { autoClose: false, closeOnClick: false }
    );
  };

  const onReconnect = (attempt: number) => {
    logger.info({ attempt }, "Socket reconnected.");
    dismissReconnectingToast();
    toast.success(translate("ServerMessages.connection.RECONNECTED"));
  };

  const onReconnectFailed = () => {
    logger.error("Socket reconnection failed.");
    dismissReconnectingToast();
    toast.error(translate("ServerMessages.connection.FAILED"));
  };

  socket.on("connect_error", onConnectError);
  socket.on("error", onServerError);
  socket.on("info", onInfo);
  socket.on("disconnect", onDisconnect);
  socket.io.on("reconnect", onReconnect);
  socket.io.on("reconnect_failed", onReconnectFailed);

  return () => {
    dismissReconnectingToast();
    socket.off("connect_error", onConnectError);
    socket.off("error", onServerError);
    socket.off("info", onInfo);
    socket.off("disconnect", onDisconnect);
    socket.io.off("reconnect", onReconnect);
    socket.io.off("reconnect_failed", onReconnectFailed);
  };
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const translateRef = useRef<Translate>(t);

  useEffect(() => {
    translateRef.current = t;
  }, [t]);

  const { status, data } = useSession();
  const token = data?.user?.accessToken;

  const connection = useSyncExternalStore(
    connectionStatus.subscribe,
    connectionStatus.getSnapshot,
    connectionStatus.getServerSnapshot
  );

  useEffect(() => {
    if (status === "loading") return;

    if (status !== "authenticated" || !token) {
      gameSocket.disconnect();
      return;
    }

    gameSocket.auth = { token };
    const unbind = bindFeedbackListeners(gameSocket, (key, options) =>
      translateRef.current(key, options)
    );

    if (!gameSocket.connected) {
      gameSocket.connect();
    }

    return unbind;
  }, [status, token]);

  const value = useMemo<SocketContextValue>(
    () => ({ socket: gameSocket, ...connection }),
    [connection]
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

export function useSocket(): SocketContextValue {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
