import { BaseSocketContext } from "@/@types/socket";
import { undoPlay } from "@/services/game.service";
import { handleGameAction } from "../handleGameAction";

export function RetrieveCardEventHandler(
  context: BaseSocketContext
): Promise<void> {
  return handleGameAction(context, undoPlay);
}
