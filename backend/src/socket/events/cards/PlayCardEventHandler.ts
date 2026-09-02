import { Card } from "shared/cards";
import { SocketContext } from "@/@types/socket";
import { playCard } from "@/services/game.service";
import { playCardSchema } from "@/schemas/socket.schemas";
import { handleGameAction, parsePayload } from "../handleGameAction";
import { PlayCardPayload } from "../payloads";

export function PlayCardEventHandler(
  context: SocketContext<PlayCardPayload>
): Promise<void> {
  return handleGameAction(context, async (roomHash, userId) => {
    const { card } = parsePayload(playCardSchema, context.payload);
    const result = await playCard(roomHash, userId, card as Card);
    context.socket.log.info({ roomHash, card }, "Card played.");
    return result;
  });
}
