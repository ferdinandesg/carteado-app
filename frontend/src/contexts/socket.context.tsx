"use client";

import { ReactNode, createContext, useContext, useEffect } from "react";
import type { Socket } from "socket.io-client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { gameSocket } from "@/lib/socket/client";
import logger from "@/lib/logger";

type SocketContextValue = {
  socket: Socket;
};

const SocketContext = createContext<SocketContextValue | null>(null);

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
    if (socket.recovered) {
      logger.info("Reconexão bem-sucedida. A sincronizar estado...");
      socket.emit("player_reconnected");
    }
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
  const router = useRouter();
  const { status, data } = useSession();
  const token = data?.user?.accessToken;

  useEffect(() => {
    if (status === "loading") return;

    const isAuthenticated = status === "authenticated" && Boolean(token);

    if (!isAuthenticated) {
      gameSocket.disconnect();
      router.replace("/");
      return;
    }

    gameSocket.auth = { token };
    const unbind = bindSocketListeners(gameSocket, token!, (key) => t(key));

    if (!gameSocket.connected) {
      gameSocket.connect();
    }

    return () => {
      unbind();
      gameSocket.disconnect();
    };
  }, [status, token, router]);

  return (
    <SocketContext.Provider value={{ socket: gameSocket }}>
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
