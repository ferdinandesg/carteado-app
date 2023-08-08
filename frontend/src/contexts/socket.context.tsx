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
import { toast } from "react-toastify";
const DEFAULT_USER = {
  email: "convidado@gmail.com",
  name: "Nome do convidado",
  image: "",
};
type SocketContextProps = {
  socket: Socket | undefined;
  joinRoom: (roomId: string) => Promise<void>;
};
const SocketContext = createContext<SocketContextProps | null>(null);
function SocketProvider({ children }: { children: ReactNode }) {
  const { data, status, update } = useSession({
    required: true,
    onUnauthenticated: () => {},
  });
  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    if (status === "authenticated") {
      const user = data?.user ?? DEFAULT_USER;
      const instance = io("http://localhost:3001/room", {
        reconnectionDelayMax: 10000,
        query: { user: JSON.stringify(user) },
      });
      instance.on("error", (message) => toast(message));
      setSocket(instance);
    }
  }, [status]);

  const joinRoom = async (roomId: string) => {
    if (!socket) return;
    socket?.emit("join_room", roomId);
  };
  return (
    <SocketContext.Provider value={{ joinRoom, socket }}>
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
