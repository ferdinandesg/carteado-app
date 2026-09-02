import { io, Socket } from "socket.io-client";
import type { ClientToServerEvents, ServerToClientEvents } from "shared/socket";

export type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

export const gameSocket: GameSocket = io(
  `${process.env.NEXT_PUBLIC_SOCKET_URL}/room`,
  {
    reconnectionDelayMax: 10000,
    path: "/carteado_socket",
    transports: ["websocket"],
    autoConnect: false,
  }
);
