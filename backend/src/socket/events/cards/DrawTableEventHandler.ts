import { SocketContext } from "../../../@types/socket";
import { getGameState } from "../../../redis/game";
export async function DrawTableEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, channel } = context;
  try {
    const roomId = socket.user.room;
    const game = await getGameState(roomId)
    const result = game.drawTable(socket.user.id);
    if (result.error) {
      socket.emit("error", result.error);
      return
    }
    socket.broadcast.to(roomId).emit("game_update", game);

  } catch (er) {
    console.error(er);
    socket.emit("error", er.message);
  }
}
