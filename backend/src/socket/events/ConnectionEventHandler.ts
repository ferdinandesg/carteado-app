import { Namespace, Socket } from "socket.io";
import { CHANNEL } from "../channels";
import { PlayCardEventHandler } from "./cards/PlayCardEventHandler";
import { PickHandEventHandler } from "./cards/PickHandEventHandler";
import { DrawTableEventHandler } from "./cards/DrawTableEventHandler";
import { RetrieveCardEventHandler } from "./cards/RetrieveCardEventHandler";
import { JoinRoomEventHandler } from "./rooms/JoinRoomEventHandler";
import { StartGameEventHandler } from "./rooms/StartGameEventHandler";
import { JoinChatEventHandler } from "./chat/JoinChatEventHandler";
import { SendMessageEventHandler } from "./chat/SendMessageEventHandler";
import { EndTurnEventHandler } from "./EndTurnEventHandler";
import { DisconnectingEventHandler } from "./DisconnectingEventHandler";
import { SetPlayerStatusEventHandler } from "./rooms/SetPlayerReadyEventHandler";

export async function ConnectionEventHandler(
  socket: Socket,
  channel: Namespace
): Promise<void> {
  console.log(`Socket Id: ${socket.id}`);
  const context = { socket, channel };

  //CHAT EVENTS
  socket.on(CHANNEL.CLIENT.JOIN_CHAT, (payload) =>
    JoinChatEventHandler({ ...context, payload })
  );
  socket.on(CHANNEL.CLIENT.SEND_MESSAGE, (payload) =>
    SendMessageEventHandler({ ...context, payload })
  );

  //ROOM EVENTS
  socket.on(CHANNEL.CLIENT.JOIN_ROOM, (payload) =>
    JoinRoomEventHandler({ ...context, payload })
  );
  socket.on(CHANNEL.CLIENT.START_GAME, (payload) =>
    StartGameEventHandler({ ...context, payload })
  );

  socket.on(CHANNEL.CLIENT.SET_PLAYER_STATUS, (payload) =>
    SetPlayerStatusEventHandler({ ...context, payload })
  );

  //CARD EVENTS
  socket.on(CHANNEL.CLIENT.PLAY_CARD, (payload) =>
    PlayCardEventHandler({ ...context, payload })
  );
  socket.on(CHANNEL.CLIENT.PICK_HAND, (payload) =>
    PickHandEventHandler({ ...context, payload })
  );
  socket.on(CHANNEL.CLIENT.RETRIEVE_CARD, (payload) =>
    RetrieveCardEventHandler({ ...context, payload })
  );
  socket.on(CHANNEL.CLIENT.END_TURN, (payload) =>
    EndTurnEventHandler({ ...context, payload })
  );
  socket.on(CHANNEL.CLIENT.DRAW_TABLE, (payload) =>
    DrawTableEventHandler({ ...context, payload })
  );

  socket.on("disconnecting", () => DisconnectingEventHandler({ ...context }));
}
