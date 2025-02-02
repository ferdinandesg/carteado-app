import { ReactNode, createContext, useContext, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

type SocketContextProps = {
  socket: Socket | undefined;
};

const SocketContext = createContext<SocketContextProps | null>(null);

export function SocketProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { data, status } = useSession({ required: false });
  const [socket, setSocket] = useState<Socket | undefined>(undefined);
  const token = data?.user?.accessToken;
  if (token) {
    localStorage.setItem("accessToken", token);
  }
  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") return router.push("/");


    if (token) {
      const instance = io(`${process.env.NEXT_PUBLIC_API_URL}/room`, {
        reconnectionDelayMax: 10000,
        auth: {
          token,
        },
        path: "/carteado_socket",
        transports: ["websocket"],
      });

      instance.on("error", (message) => toast(t(`ServerMessages.errors.${message}`)));
      instance.on("info", (message) => toast(t(`ServerMessages.infos.${message}`)));
      setSocket(instance);

      return () => {
        instance.disconnect();
      };
    }
  }, [status]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context)
    throw new Error("useSocketContext must be used within a SocketContextProvider");
  return context;
}
