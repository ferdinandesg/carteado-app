import { ReactNode, createContext, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
const DEFAULT_USER = {
  email: "convidado@gmail.com",
  name: "Nome do convidado",
  image: ""
}
type SocketContextProps = {
  socket: Socket | undefined;
  joinRoom: (roomId: string) => Promise<void>;
};
export const SocketContext = createContext<SocketContextProps | null>(null);
export function SocketProvider({ children }: { children: ReactNode }) {
  const { data, status } = useSession();
  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    if (status !== "loading") {
      const user = data?.user ?? DEFAULT_USER
      const instance = io("http://localhost:3001/room", {
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
