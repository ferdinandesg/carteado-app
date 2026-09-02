import { BaseSocketContext } from "@/@types/socket";
import { acceptTruco } from "@/services/game.service";
import { handleGameAction } from "../handleGameAction";

export function AcceptTrucoEventHandler(
  context: BaseSocketContext
): Promise<void> {
  return handleGameAction(context, acceptTruco);
}
