import { io, Socket } from "socket.io-client";

export function createTestSocket(token: string, port: number): Socket {
  return io(`http://localhost:${port}/room`, {
    path: "/carteado_socket",
    auth: { token },
    transports: ["websocket"],
  });
}

export function connectAndJoinRoom(
  token: string,
  roomHash: string,
  port: number
): Promise<Socket> {
  return new Promise((resolve, reject) => {
    const socket = createTestSocket(token, port);

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

export function waitForEvent<T>(socket: Socket, eventName: string): Promise<T> {
  return new Promise((resolve, reject) => {
    socket.once(eventName, (data: T) => resolve(data));
    socket.once("error", (err) => reject(err));
  });
}
