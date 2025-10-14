import { Namespace, Socket } from "socket.io";
import { CHANNEL } from "@socket/channels";
import { SocketContext } from "src/@types/socket";
import { JoinChatEventHandler } from "./JoinChatEventHandler";
import { SendMessageEventHandler } from "./SendMessageEventHandler";

export function registerChatEvents(socket: Socket, channel: Namespace): void {
  const context: Omit<SocketContext, "payload"> = { socket, channel };

  socket.on(CHANNEL.CLIENT.JOIN_CHAT, (payload) =>
    JoinChatEventHandler({ ...context, payload })
  );
  socket.on(CHANNEL.CLIENT.SEND_MESSAGE, (payload) =>
    SendMessageEventHandler({ ...context, payload })
  );
}
