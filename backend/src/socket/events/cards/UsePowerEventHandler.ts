import { SocketContext } from "@/@types/socket";
import { usePower } from "@/services/game.service";
import { usePowerSchema } from "@/schemas/power.schemas";
import { handleGameAction, parsePayload } from "../handleGameAction";
import { UsePowerPayload } from "../payloads";

/**
 * Evento único para todos os poderes: valida o payload e delega ao motor,
 * que roteia `powerId` para a strategy correta (ver game/powers).
 */
export function UsePowerEventHandler(
  context: SocketContext<UsePowerPayload>
): Promise<void> {
  return handleGameAction(context, (roomHash, userId) => {
    const payload = parsePayload(usePowerSchema, context.payload);
    return usePower(roomHash, userId, payload as UsePowerPayload);
  });
}
