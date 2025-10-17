import { Namespace, Socket } from "socket.io";
import { CHANNEL } from "@/socket/channels";
import { JoinChatEventHandler } from "./JoinChatEventHandler";
import { SendMessageEventHandler } from "./SendMessageEventHandler";
import { SocketContext } from "@/@types/socket";

export function registerChatEvents(socket: Socket, channel: Namespace): void {
  const context: Omit<SocketContext, "payload"> = { socket, channel };

  socket.on(CHANNEL.CLIENT.JOIN_CHAT, (payload) =>
    JoinChatEventHandler({ ...context, payload })
  );
  socket.on(CHANNEL.CLIENT.SEND_MESSAGE, (payload) =>
    SendMessageEventHandler({ ...context, payload })
  );
}
