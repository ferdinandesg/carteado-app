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
import { useTranslation } from "react-i18next";
import logger from "@//tests/utils/logger";

type SocketContextProps = {
  socket: Socket;
};

const SocketContext = createContext<SocketContextProps | null>(null);

// Criamos a instância do socket fora do componente, com autoConnect: false.
// Isso garante que temos uma instância única que não tenta se conectar sozinha.
const socketInstance = io(`${process.env.NEXT_PUBLIC_SOCKET_URL}/room`, {
  reconnectionDelayMax: 10000,
  path: "/carteado_socket",
  transports: ["websocket"],
  autoConnect: false,
});

export function SocketProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const router = useRouter();
  const { data, status } = useSession(); // required: false é o padrão
  const token = data?.user?.accessToken;

  // Usamos o useState para expor a instância no contexto
  const [socket, setSocket] = useState<Socket>(socketInstance);

  // Efeito colateral para salvar o token, separado da lógica do socket.
  useEffect(() => {
    if (token) {
      localStorage.setItem("accessToken", token);
    }
  }, [token]);

  // Efeito principal que gerencia o ciclo de vida da conexão do socket.
  useEffect(() => {
    if (status === "loading") return;

    if (status === "authenticated" && token) {
      // Autenticamos e conectamos o socket apenas quando temos um token.
      socketInstance.auth = { token };
      socketInstance.connect();

      const onError = (err: string) => {
        return toast.error(t(`ServerMessages.errors.${err}`));
      };

      const onConnectError = (err: Error) => {
        return toast.error(t(`ServerMessages.errors.${err.message}`));
      };

      const onInfo = (message: string) => {
        return toast.info(t(`ServerMessages.infos.${message}`));
      };

      // Adicionamos os listeners com as funções corretas
      socketInstance.on("connect_error", onConnectError);
      socketInstance.on("error", onError);
      socketInstance.on("info", onInfo);
      socketInstance.on("connect", () => {
        if (socketInstance.recovered) {
          if (socketInstance.recovered) {
            logger.info("Reconexão bem-sucedida. A sincronizar estado...");
            socketInstance.emit("player_reconnected");
          }
        }
      });

      // A função de limpeza é crucial.
      return () => {
        socketInstance.off("connect_error", onConnectError);
        socketInstance.off("error", onError);
        socketInstance.off("info", onInfo);
        socketInstance.disconnect();
      };
    } else {
      socketInstance.disconnect();
      router.push("/");
    }
  }, [status, token, router, t]); // <-- Array de dependências completo

  return (
    <SocketContext.Provider value={{ socket }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context)
    throw new Error("useSocket must be used within a SocketProvider");
  return context;
}
