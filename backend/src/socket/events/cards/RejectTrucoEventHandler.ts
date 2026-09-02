import { BaseSocketContext } from "@/@types/socket";
import { rejectTruco } from "@/services/game.service";
import { handleGameAction } from "../handleGameAction";

export function RejectTrucoEventHandler(
  context: BaseSocketContext
): Promise<void> {
  return handleGameAction(context, (roomHash) => rejectTruco(roomHash));
}
