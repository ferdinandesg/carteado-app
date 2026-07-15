"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useRef,
  useSyncExternalStore,
} from "react";
import type { Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { gameSocket } from "@/lib/socket/client";

type SocketContextValue = {
  socket: Socket;
  isConnected: boolean;
};

const SocketContext = createContext<SocketContextValue | null>(null);

function subscribeToSocketConnection(onStoreChange: () => void) {
  gameSocket.on("connect", onStoreChange);
  gameSocket.on("disconnect", onStoreChange);
  return () => {
    gameSocket.off("connect", onStoreChange);
    gameSocket.off("disconnect", onStoreChange);
  };
}

function getSocketConnectedSnapshot() {
  return gameSocket.connected;
}

function bindSocketListeners(
  socket: Socket,
  token: string,
  translate: (key: string) => string
) {
  const onConnectError = (err: Error) => {
    toast.error(translate(`ServerMessages.errors.${err.message}`));
  };

  const onError = (err: string) => {
    toast.error(translate(`ServerMessages.errors.${err}`));
  };

  const onInfo = (message: string) => {
    toast.info(translate(`ServerMessages.infos.${message}`));
  };

  const onConnect = () => {
    socket.auth = { token };
  };

  socket.on("connect_error", onConnectError);
  socket.on("error", onError);
  socket.on("info", onInfo);
  socket.on("connect", onConnect);

  return () => {
    socket.off("connect_error", onConnectError);
    socket.off("error", onError);
    socket.off("info", onInfo);
    socket.off("connect", onConnect);
  };
}

export function SocketProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const translateRef = useRef(t);

  useEffect(() => {
    translateRef.current = t;
  }, [t]);

  const router = useRouter();
  const { status, data } = useSession();
  const token = data?.user?.accessToken;
  const isConnected = useSyncExternalStore(
    subscribeToSocketConnection,
    getSocketConnectedSnapshot,
    () => false
  );

  useEffect(() => {
    if (status === "loading") return;

    const isAuthenticated = status === "authenticated" && Boolean(token);

    if (!isAuthenticated) {
      gameSocket.disconnect();
      router.replace("/");
      return;
    }

    gameSocket.auth = { token };
    const unbind = bindSocketListeners(gameSocket, token!, (key) =>
      translateRef.current(key)
    );

    if (!gameSocket.connected) {
      gameSocket.connect();
    }

    return unbind;
  }, [status, token, router]);

  return (
    <SocketContext.Provider value={{ socket: gameSocket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
}
