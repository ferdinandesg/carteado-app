import { Namespace, Socket } from "socket.io";
import { CHANNEL } from "../channels";
import { PlayCardEventHandler } from "./PlayCardEventHandler";
import { RoomEventHandler } from "./RoomEventHandler";
import { DisconnectingEventHandler } from "./DisconnectingEventHandler";
import { JoinChatEventHandler } from "./JoinChatEventHandler";
import { SendMessageEventHandler } from "./SendMessageEventHandler";
import { StartGameEventHandler } from "./StartGameEventHandler";
import { PickHandEventHandler } from "./PickHandEventHandler";
import { EndTurnEventHandler } from "./EndTurnEventHandler";

export async function ConnectionEventHandler(
  socket: Socket,
  channel: Namespace
): Promise<void> {
  console.log(`Socket Id: ${socket.id}`);
  const context = { socket, channel };
  socket.on(CHANNEL.CLIENT.JOIN_CHAT, (payload) =>
    JoinChatEventHandler({ ...context, payload })
  );
  socket.on(CHANNEL.CLIENT.SEND_MESSAGE, (payload) =>
    SendMessageEventHandler({ ...context, payload })
  );

  socket.on(CHANNEL.CLIENT.JOIN_ROOM, (payload) =>
    RoomEventHandler({ ...context, payload })
  );
  socket.on(CHANNEL.CLIENT.PLAY_CARD, (payload) =>
    PlayCardEventHandler({ ...context, payload })
  );

  socket.on(CHANNEL.CLIENT.START_GAME, (payload) =>
    StartGameEventHandler({ ...context, payload })
  );
  socket.on(CHANNEL.CLIENT.PICK_HAND, (payload) =>
    PickHandEventHandler({ ...context, payload })
  );
  socket.on(CHANNEL.CLIENT.END_TURN, (payload) =>
    EndTurnEventHandler({ ...context, payload })
  );

  socket.on("disconnecting", () => {
    DisconnectingEventHandler({ ...context });
  });
}
