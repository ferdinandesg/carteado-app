import { BaseSocketContext } from "@/@types/socket";
import { endTurn } from "@/services/game.service";
import { handleGameAction } from "./handleGameAction";

export function EndTurnEventHandler(context: BaseSocketContext): Promise<void> {
  return handleGameAction(context, endTurn);
}
