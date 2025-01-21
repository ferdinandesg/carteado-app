import { Socket } from "socket.io";

export default function emitToUser<T = any>(socket: Socket, event: string, payload: T) {
  socket.emit(
    event,
    payload
  );
}