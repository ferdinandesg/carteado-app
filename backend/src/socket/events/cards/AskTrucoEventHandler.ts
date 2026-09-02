import { BaseSocketContext } from "@/@types/socket";
import { askTruco } from "@/services/game.service";
import { handleGameAction } from "../handleGameAction";

export function AskTrucoEventHandler(
  context: BaseSocketContext
): Promise<void> {
  return handleGameAction(context, askTruco);
}
