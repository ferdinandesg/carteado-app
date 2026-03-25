import { Namespace, Socket } from "socket.io";
import { registerChatEvents } from "./index";

export function ChatConnectionEventHandler(
  socket: Socket,
  channel: Namespace
): void {
  registerChatEvents(socket, channel);
}
