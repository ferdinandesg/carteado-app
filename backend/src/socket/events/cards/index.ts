import { Namespace, Socket } from "socket.io";
import { CHANNEL } from "@/socket/channels";
import { BaseSocketContext } from "@/@types/socket";
import { AcceptTrucoEventHandler } from "./AcceptTrucoEventHandler";
import { AskTrucoEventHandler } from "./AskTrucoEventHandler";
import { DrawTableEventHandler } from "./DrawTableEventHandler";
import { PickHandEventHandler } from "./PickHandEventHandler";
import { PlayCardEventHandler } from "./PlayCardEventHandler";
import { RejectTrucoEventHandler } from "./RejectTrucoEventHandler";
import { RetrieveCardEventHandler } from "./RetrieveCardEventHandler";
import { UsePowerEventHandler } from "./UsePowerEventHandler";
import { EndTurnEventHandler } from "../EndTurnEventHandler";
import { registerSafeSocketEvent } from "../registerSafeSocketEvent";
import { PickHandPayload, PlayCardPayload, UsePowerPayload } from "../payloads";

export function registerCardEvents(socket: Socket, channel: Namespace): void {
  const context: BaseSocketContext = { socket, channel };

  // Eventos com payload (validado por zod dentro do handler)
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
  registerSafeSocketEvent<UsePowerPayload>(
    socket,
    CHANNEL.CLIENT.USE_POWER,
    (payload) => UsePowerEventHandler({ ...context, payload })
  );

  // Eventos sem payload
  const noPayloadEvents: Record<
    string,
    (ctx: BaseSocketContext) => Promise<void>
  > = {
    [CHANNEL.CLIENT.RETRIEVE_CARD]: RetrieveCardEventHandler,
    [CHANNEL.CLIENT.END_TURN]: EndTurnEventHandler,
    [CHANNEL.CLIENT.DRAW_TABLE]: DrawTableEventHandler,
    [CHANNEL.CLIENT.ASK_TRUCO]: AskTrucoEventHandler,
    [CHANNEL.CLIENT.REJECT_TRUCO]: RejectTrucoEventHandler,
    [CHANNEL.CLIENT.ACCEPT_TRUCO]: AcceptTrucoEventHandler,
  };
  for (const [event, handler] of Object.entries(noPayloadEvents)) {
    registerSafeSocketEvent<void>(socket, event, () => handler(context));
  }
}
