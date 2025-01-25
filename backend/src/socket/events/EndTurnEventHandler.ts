import emitToRoom from "@socket/utils/emitToRoom";
import { SocketContext } from "../../@types/socket";
import { getGameState, saveGameState } from "../../redis/game";
export async function EndTurnEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, channel } = context;
  const { room } = socket.user;
  if (!room) return;
  try {
    const game = await getGameState(room);
    const result = game.endTurn(socket.user.id);
    if (!result || result.error) throw result?.error;
    await saveGameState(room, game);
    emitToRoom(channel, room, "game_update", game);
  } catch (er) {
    console.error(er);
    socket.emit("error", typeof er === "string" ? er : JSON.stringify(er));
  }
}
