"use client";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Socket, io } from "socket.io-client";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import axiosInstance from "@/hooks/axios";

type SocketContextProps = {
  socket: Socket | undefined;
};
const SocketContext = createContext<SocketContextProps | null>(null);
export function SocketProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data, status } = useSession({
    required: false,
  });
  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") return router.push("/");
    console.log({
      data,
    });
    axiosInstance.interceptors.request.use((config) => {
      config.headers.Authorization = data?.user.id;
      return config;
    });
    const instance = io(`${process.env.NEXT_PUBLIC_API_URL}/room`, {
      reconnectionDelayMax: 10000,
      query: { user: JSON.stringify(data?.user) },
    });
    instance.on("error", (message) => toast(message));
    instance.on("info", (message) => toast(message));
    setSocket(instance);
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
    throw new Error(
      "useSocketContext must be used within a SocketContextProvider"
    );
  return context;
}
