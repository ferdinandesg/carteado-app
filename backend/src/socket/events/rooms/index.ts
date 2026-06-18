import { Namespace, Socket } from "socket.io";
import { CHANNEL } from "@/socket/channels";
import { JoinRoomEventHandler } from "./JoinRoomEventHandler";
import { LeaveRoomEventHandler } from "./LeaveRoomEventHandler";
import { PlayerReconnectedEventHandler } from "./PlayerReconnectedEventHandler";
import { SetPlayerStatusEventHandler } from "./SetPlayerReadyEventHandler";
import { StartGameEventHandler } from "./StartGameEventHandler";
import { SocketContext } from "@/@types/socket";
import { registerSafeSocketEvent } from "../registerSafeSocketEvent";
import {
  JoinRoomPayload,
  PlayerReconnectedPayload,
  SetPlayerStatusPayload,
} from "../payloads";

export function registerRoomEvents(socket: Socket, channel: Namespace): void {
  const context: Omit<SocketContext, "payload"> = { socket, channel };

  registerSafeSocketEvent<JoinRoomPayload>(
    socket,
    CHANNEL.CLIENT.JOIN_ROOM,
    (payload) => JoinRoomEventHandler({ ...context, payload })
  );

  registerSafeSocketEvent(socket, CHANNEL.CLIENT.LEAVE_ROOM, (payload) =>
    LeaveRoomEventHandler({ ...context, payload })
  );

  registerSafeSocketEvent<PlayerReconnectedPayload>(
    socket,
    CHANNEL.CLIENT.PLAYER_RECONNECTED,
    (payload) => PlayerReconnectedEventHandler({ ...context, payload })
  );

  registerSafeSocketEvent<SetPlayerStatusPayload>(
    socket,
    CHANNEL.CLIENT.SET_PLAYER_STATUS,
    (payload) => SetPlayerStatusEventHandler({ ...context, payload })
  );

  registerSafeSocketEvent(socket, CHANNEL.CLIENT.START_GAME, (payload) =>
    StartGameEventHandler({ ...context, payload })
  );
}
