import { Namespace, Socket } from "socket.io";
import { CHANNEL } from "@/socket/channels";
import { SocketContext } from "@/@types/socket";
import { AcceptTrucoEventHandler } from "./AcceptTrucoEventHandler";
import { AskTrucoEventHandler } from "./AskTrucoEventHandler";
import { DrawTableEventHandler } from "./DrawTableEventHandler";
import { PickHandEventHandler } from "./PickHandEventHandler";
import { PlayCardEventHandler } from "./PlayCardEventHandler";
import { RejectTrucoEventHandler } from "./RejectTrucoEventHandler";
import { RetrieveCardEventHandler } from "./RetrieveCardEventHandler";
import { EndTurnEventHandler } from "../EndTurnEventHandler";
import { registerSafeSocketEvent } from "../registerSafeSocketEvent";
import { PickHandPayload, PlayCardPayload } from "../payloads";

export function registerCardEvents(socket: Socket, channel: Namespace): void {
  const context: Omit<SocketContext, "payload"> = { socket, channel };

  registerSafeSocketEvent<PlayCardPayload>(
    socket,
    CHANNEL.CLIENT.PLAY_CARD,
    (payload) => PlayCardEventHandler({ ...context, payload })
  );
  registerSafeSocketEvent<PickHandPayload>(
    socket,
    CHANNEL.CLIENT.PICK_HAND,
    (payload) => PickHandEventHandler({ ...context, payload })
  );
  registerSafeSocketEvent(socket, CHANNEL.CLIENT.RETRIEVE_CARD, (payload) =>
    RetrieveCardEventHandler({ ...context, payload })
  );
  registerSafeSocketEvent(socket, CHANNEL.CLIENT.END_TURN, (payload) =>
    EndTurnEventHandler({ ...context, payload })
  );
  registerSafeSocketEvent(socket, CHANNEL.CLIENT.DRAW_TABLE, (payload) =>
    DrawTableEventHandler({ ...context, payload })
  );

  registerSafeSocketEvent(socket, CHANNEL.CLIENT.ASK_TRUCO, (payload) =>
    AskTrucoEventHandler({ ...context, payload })
  );
  registerSafeSocketEvent(socket, CHANNEL.CLIENT.REJECT_TRUCO, (payload) =>
    RejectTrucoEventHandler({ ...context, payload })
  );
  registerSafeSocketEvent(socket, CHANNEL.CLIENT.ACCEPT_TRUCO, (payload) =>
    AcceptTrucoEventHandler({ ...context, payload })
  );
}
