import { BaseSocketContext } from "@/@types/socket";
import { pickUpBunch } from "@/services/game.service";
import { handleGameAction } from "../handleGameAction";

export function DrawTableEventHandler(
  context: BaseSocketContext
): Promise<void> {
  return handleGameAction(context, pickUpBunch);
}
