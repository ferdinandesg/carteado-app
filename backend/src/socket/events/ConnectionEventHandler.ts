import { Namespace, Socket } from "socket.io";
import { DisconnectingEventHandler } from "./DisconnectingEventHandler";
import { logger } from "@/utils/logger";
import { registerRoomEvents } from "./rooms";
import { registerCardEvents } from "./cards";
import { registerChatEvents } from "./chat";
import { registerSafeSocketEvent } from "./registerSafeSocketEvent";
import { CHANNEL } from "@/socket/channels";

export function ConnectionEventHandler(
  socket: Socket,
  channel: Namespace
): void {
  registerRoomEvents(socket, channel);
  registerCardEvents(socket, channel);
  registerChatEvents(socket, channel);

  registerSafeSocketEvent(socket, CHANNEL.SERVER.DISCONNECTING, () =>
    DisconnectingEventHandler({ socket, channel })
  );

  logger.info({ userId: socket.user?.id }, "Socket connected.");
}
