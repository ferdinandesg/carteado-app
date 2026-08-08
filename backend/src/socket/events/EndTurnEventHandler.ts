import emitToRoom from "@/socket/utils/emitToRoom";
import { SocketContext } from "@/@types/socket";
import ErrorHandler from "@/utils/error.handler";
import { endTurn } from "@/services/game.service";
import { CHANNEL } from "@/socket/channels";
export async function EndTurnEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, channel } = context;
  const { room } = socket.user;
  if (!room) return;
  try {
    const game = await endTurn(room, socket.user.id);
    emitToRoom(channel, room, CHANNEL.SERVER.GAME_UPDATED, game);
  } catch (error) {
    ErrorHandler(error, socket);
  }
}
