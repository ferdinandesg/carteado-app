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
import { AskTrucoEventHandler } from "./cards/AskTrucoEventHandler";
import { RejectTrucoEventHandler } from "./cards/RejectTrucoEventHandler";
import { AcceptTrucoEventHandler } from "./cards/AcceptTrucoEventHandler";
import { LeaveRoomEventHandler } from "./rooms/LeaveRoomEventHandler";
import { retrieveSession } from "src/redis/userSession";

const retrieveUserData = async (socket: Socket) => {
  const session = await retrieveSession(socket.user.id);
  if (session) {
    console.log(`User Id: ${socket.user.id} reconnected`);
    socket.user.room = session.roomHash;
    socket.user.status = session.status;
    socket.emit("reconnected", {
      message: "WELCOME_BACK",
    });
  }
  console.log(`User Id: ${socket.user.id} connected`);
};

export async function ConnectionEventHandler(
  socket: Socket,
  channel: Namespace
): Promise<void> {
  const context = { socket, channel };

  await retrieveUserData(socket);

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
  socket.on(CHANNEL.CLIENT.LEAVE_ROOM, (payload) =>
    LeaveRoomEventHandler({ ...context, payload })
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

  socket.on("ask_truco", (payload) => {
    AskTrucoEventHandler({ ...context, payload });
  });
  socket.on("reject_truco", (payload) => {
    RejectTrucoEventHandler({ ...context, payload });
  });
  socket.on("accept_truco", (payload) => {
    AcceptTrucoEventHandler({ ...context, payload });
  });

  socket.on("disconnecting", () => DisconnectingEventHandler({ ...context }));
}
