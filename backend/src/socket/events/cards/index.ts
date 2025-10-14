import { Namespace, Socket } from "socket.io";
import { CHANNEL } from "@socket/channels";
import { SocketContext } from "src/@types/socket";
import { AcceptTrucoEventHandler } from "./AcceptTrucoEventHandler";
import { AskTrucoEventHandler } from "./AskTrucoEventHandler";
import { DrawTableEventHandler } from "./DrawTableEventHandler";
import { PickHandEventHandler } from "./PickHandEventHandler";
import { PlayCardEventHandler } from "./PlayCardEventHandler";
import { RejectTrucoEventHandler } from "./RejectTrucoEventHandler";
import { RetrieveCardEventHandler } from "./RetrieveCardEventHandler";
import { EndTurnEventHandler } from "../EndTurnEventHandler";

export function registerCardEvents(socket: Socket, channel: Namespace): void {
  const context: Omit<SocketContext, "payload"> = { socket, channel };

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
}
