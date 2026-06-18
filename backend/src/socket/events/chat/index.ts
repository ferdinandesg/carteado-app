import { Namespace, Socket } from "socket.io";
import { CHANNEL } from "@/socket/channels";
import { JoinChatEventHandler } from "./JoinChatEventHandler";
import { SendMessageEventHandler } from "./SendMessageEventHandler";
import { SocketContext } from "@/@types/socket";
import { registerSafeSocketEvent } from "../registerSafeSocketEvent";
import { JoinChatPayload, SendMessagePayload } from "../payloads";

export function registerChatEvents(socket: Socket, channel: Namespace): void {
  const context: Omit<SocketContext, "payload"> = { socket, channel };

  registerSafeSocketEvent<JoinChatPayload>(
    socket,
    CHANNEL.CLIENT.JOIN_CHAT,
    (payload) => JoinChatEventHandler({ ...context, payload })
  );
  registerSafeSocketEvent<SendMessagePayload>(
    socket,
    CHANNEL.CLIENT.SEND_MESSAGE,
    (payload) => SendMessageEventHandler({ ...context, payload })
  );
}
