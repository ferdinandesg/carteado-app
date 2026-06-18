import emitToRoom from "@/socket/utils/emitToRoom";
import { SocketContext } from "@/@types/socket";
import ErrorHandler from "@/utils/error.handler";
import { getGameInstance, saveGameInstance } from "@/services/game.service";
import { CHANNEL } from "@/socket/channels";
export async function EndTurnEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, channel } = context;
  const { room } = socket.user;
  if (!room) return;
  try {
    const game = await getGameInstance(room);
    game.endTurn(socket.user.id);
    await saveGameInstance(room, game);
    emitToRoom(channel, room, CHANNEL.SERVER.GAME_UPDATED, game);
  } catch (error) {
    ErrorHandler(error, socket);
  }
}
