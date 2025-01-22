import { Namespace, Socket } from "socket.io";

export default function emitToRoom<T = any>(
  channel: Socket | Namespace,
  roomId: string,
  event: string,
  payload: T
) {
  let action;
  if (channel instanceof Socket) {
    action = channel.broadcast.to(roomId);
  } else {
    action = channel.to(roomId);
  }

  action.emit(event, payload);
}
