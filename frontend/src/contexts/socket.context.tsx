import { ReactNode, createContext, useEffect, useState } from "react";
import { Socket, io } from "socket.io-client";
import { useSession } from "next-auth/react";
import { toast } from "react-toastify";
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
      const instance = io("http://localhost:3001/room", {
        query: { user: data?.user ? JSON.stringify(data.user) : null },
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
