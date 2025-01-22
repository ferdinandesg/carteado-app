import { SocketContext } from "../../@types/socket";
import { getGameState, saveGameState } from "../../redis/game";
import emitToRoom from "../utils/emitToRoom";

export async function EndTurnEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, channel } = context;
  const { room } = socket.user;
  try {
    const game = await getGameState(room);
    const result = game.endTurn(socket.user.id);
    if (result.error) throw result.error;
    await saveGameState(room, game);
    emitToRoom(channel, room, "game_update", game);
  } catch (er) {
    console.error(er);
    socket.emit("error", typeof er === "string" ? er : er.message);
  }
}
