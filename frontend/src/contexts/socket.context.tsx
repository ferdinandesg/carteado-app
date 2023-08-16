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
const DEFAULT_USER = {
  email: "convidado@gmail.com",
  name: "",
  image: "",
};
type SocketContextProps = {
  socket: Socket | undefined;
  authGuest: (name: string) => void;
};
const SocketContext = createContext<SocketContextProps | null>(null);
export function SocketProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data, status } = useSession({
    required: false,
  });
  const [defaultUser, setDefaultUser] = useState(DEFAULT_USER);
  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") return router.push("/");
    const instance = io("http://localhost:3001/room", {
      reconnectionDelayMax: 10000,
      query: { user: JSON.stringify(data?.user) },
    });
    instance.on("error", (message) => toast(message));
    setSocket(instance);
  }, [status]);

  const authGuest = (name: string) => {
    setDefaultUser((m) => {
      m.name = name;
      return m;
    });
  };

  return (
    <SocketContext.Provider value={{ authGuest, socket }}>
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
