import emitToRoom from "@socket/utils/emitToRoom";
import { SocketContext } from "../../@types/socket";
import { getGameState, saveGameState } from "../../redis/game";
import ErrorHandler from "src/utils/error.handler";
export async function EndTurnEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, channel } = context;
  const { room } = socket.user;
  if (!room) return;
  try {
    const game = await getGameState(room);
    game.endTurn(socket.user.id);
    await saveGameState(room, game);
    emitToRoom(channel, room, "game_updated", game);
  } catch (error) {
    ErrorHandler(error, socket);
  }
}
