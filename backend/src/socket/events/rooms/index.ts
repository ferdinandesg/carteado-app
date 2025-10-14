import { Namespace, Socket } from "socket.io";
import { CHANNEL } from "@socket/channels";
import { SocketContext } from "src/@types/socket";
import { JoinRoomEventHandler } from "./JoinRoomEventHandler";
import { LeaveRoomEventHandler } from "./LeaveRoomEventHandler";
import { PlayerReconnectedEventHandler } from "./PlayerReconnectedEventHandler";
import { SetPlayerStatusEventHandler } from "./SetPlayerReadyEventHandler";
import { StartGameEventHandler } from "./StartGameEventHandler";

export function registerRoomEvents(socket: Socket, channel: Namespace): void {
  const context: Omit<SocketContext, "payload"> = { socket, channel };

  socket.on(CHANNEL.CLIENT.JOIN_ROOM, (payload) =>
    JoinRoomEventHandler({ ...context, payload })
  );

  socket.on(CHANNEL.CLIENT.LEAVE_ROOM, (payload) =>
    LeaveRoomEventHandler({ ...context, payload })
  );

  socket.on("player_reconnected", (payload) =>
    PlayerReconnectedEventHandler({ ...context, payload })
  );

  socket.on(CHANNEL.CLIENT.SET_PLAYER_STATUS, (payload) =>
    SetPlayerStatusEventHandler({ ...context, payload })
  );

  socket.on(CHANNEL.CLIENT.START_GAME, (payload) =>
    StartGameEventHandler({ ...context, payload })
  );
}
