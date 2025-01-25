import emitToRoom from "@socket/utils/emitToRoom";
import { SocketContext } from "../../../@types/socket";
import { getGameState, saveGameState } from "../../../redis/game";
export async function DrawTableEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, channel } = context;
  try {
    const roomHash = socket.user.room;
    if (!roomHash) throw "Você não está em uma sala";
    const game = await getGameState(roomHash);
    const result = game.drawTable(socket.user.id);
    if (result && result.error) {
      socket.emit("error", result.error);
      return;
    }
    await saveGameState(roomHash, game);
    emitToRoom(channel, roomHash, "game_update", game);
  } catch (er) {
    console.error(er);
    socket.emit("error", JSON.stringify(er));
  }
}
