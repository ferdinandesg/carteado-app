import { io, Socket } from "socket.io-client";

export const gameSocket: Socket = io(
  `${process.env.NEXT_PUBLIC_SOCKET_URL}/room`,
  {
    reconnectionDelayMax: 10000,
    path: "/carteado_socket",
    transports: ["websocket"],
    autoConnect: false,
  }
);
