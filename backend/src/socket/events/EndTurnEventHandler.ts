import { SocketContext } from "../../@types/socket";
import { getGameState } from "../../redis/game";

export async function EndTurnEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, channel } = context;
  const { room } = socket.user;
  try {

    const game = await getGameState(room);
    const result = game.endTurn(socket.user.id);
    if (result.error) {
      socket.emit("error", result.error);
      return;
    }
    socket.broadcast.to(room).emit("game_update", game);
  } catch (er) {
    console.error(er);
    socket.emit("error", er.message);
  }
}
