import { SocketContext } from "../../../@types/socket";
import { getGameState } from "../../../redis/game";

export async function RetrieveCardEventHandler(
  context: SocketContext
): Promise<void> {
  const { payload, socket, channel } = context;
  try {
    const { card } = payload;
    const roomId = socket.user.room;
    const game = await getGameState(roomId);
    const result = game.retrieveCard(card, socket.user.id);
    if(result.error) {
      socket.emit("error", result.error);
      return;
    }
    socket.broadcast.to(roomId).emit("game_update", game);

  } catch (er) {
    socket.emit("error", er.message);
  }
}
