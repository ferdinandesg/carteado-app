import { Card } from "shared/cards";
import { SocketContext } from "@/@types/socket";
import { pickHand } from "@/services/game.service";
import { pickHandSchema } from "@/schemas/socket.schemas";
import { handleGameAction, parsePayload } from "../handleGameAction";
import { PickHandPayload } from "../payloads";

export function PickHandEventHandler(
  context: SocketContext<PickHandPayload>
): Promise<void> {
  return handleGameAction(context, (roomHash, userId) => {
    const { cards } = parsePayload(pickHandSchema, context.payload);
    return pickHand(roomHash, userId, cards as Card[]);
  });
}
