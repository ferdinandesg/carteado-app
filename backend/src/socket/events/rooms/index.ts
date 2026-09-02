import { Namespace, Socket } from "socket.io";
import { CHANNEL } from "@/socket/channels";
import { JoinRoomEventHandler } from "./JoinRoomEventHandler";
import { LeaveRoomEventHandler } from "./LeaveRoomEventHandler";
import { SetPlayerStatusEventHandler } from "./SetPlayerReadyEventHandler";
import { StartGameEventHandler } from "./StartGameEventHandler";
import { BaseSocketContext } from "@/@types/socket";
import { registerSafeSocketEvent } from "../registerSafeSocketEvent";
import { JoinRoomPayload, SetPlayerStatusPayload } from "../payloads";

export function registerRoomEvents(socket: Socket, channel: Namespace): void {
  const context: BaseSocketContext = { socket, channel };

  registerSafeSocketEvent<JoinRoomPayload>(
    socket,
    CHANNEL.CLIENT.JOIN_ROOM,
    (payload) => JoinRoomEventHandler({ ...context, payload })
  );

  registerSafeSocketEvent<SetPlayerStatusPayload>(
    socket,
    CHANNEL.CLIENT.SET_PLAYER_STATUS,
    (payload) => SetPlayerStatusEventHandler({ ...context, payload })
  );

  // O cliente envia { roomHash } no quit, mas a sala vem do próprio socket.
  registerSafeSocketEvent<void>(socket, CHANNEL.CLIENT.LEAVE_ROOM, () =>
    LeaveRoomEventHandler(context)
  );

  registerSafeSocketEvent<void>(socket, CHANNEL.CLIENT.START_GAME, () =>
    StartGameEventHandler(context)
  );
}
