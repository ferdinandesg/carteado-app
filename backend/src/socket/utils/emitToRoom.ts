import { Namespace, Socket } from "socket.io";

export default function emitToRoom<T>(
  channel: Socket | Namespace,
  roomHash: string,
  event: string,
  payload: T
) {
  let action;
  if (channel instanceof Socket) {
    action = channel.broadcast.to(roomHash);
  } else {
    action = channel.to(roomHash);
  }
  action.emit(event, payload);
}
