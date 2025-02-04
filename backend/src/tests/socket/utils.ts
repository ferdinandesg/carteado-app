// test/socket/utils.ts
import { io, Socket } from "socket.io-client";

export function createTestSocket(token: string): Socket {
  return io("http://localhost:4000/room", {
    path: "/carteado_socket",
    auth: { token },
  });
}

export function connectAndJoinRoom(
  token: string,
  roomHash: string
): Promise<Socket> {
  return new Promise((resolve, reject) => {
    const socket = createTestSocket(token);

    socket.on("connect", () => {
      socket.emit("join_room", { roomHash });
    });
    socket.on("error", (err) => {
      reject(err);
    });
    resolve(socket);
  });
}

export function closeSockets(...sockets: Socket[]) {
  sockets.forEach((socket) => {
    socket.close();
  });
}
