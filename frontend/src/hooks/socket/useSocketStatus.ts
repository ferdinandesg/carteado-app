import { useSocket } from "@/contexts/socket.context";
import type { SocketConnectionStatus } from "@/lib/socket/connectionStatus";

/** Estado de conexão do socket da sala (`isConnected`, `isReconnecting`, ...). */
export function useSocketStatus(): SocketConnectionStatus {
  const { isConnected, isReconnecting, lastDisconnectReason } = useSocket();
  return { isConnected, isReconnecting, lastDisconnectReason };
}
