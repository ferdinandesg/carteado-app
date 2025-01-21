import emitToRoom from "src/socket/utils/emitToRoom";
import { SocketContext } from "../../../@types/socket";
import { getGameState } from "../../../redis/game";

export async function RetrieveCardEventHandler(
  context: SocketContext
): Promise<void> {
  const { payload, socket, channel } = context;
  try {
    const { card } = payload;
    const roomHash = socket.user.room;
    const game = await getGameState(roomHash);
    const result = game.retrieveCard(card, socket.user.id);
    if (result.error) {
      socket.emit("error", result.error);
      return;
    }
    emitToRoom(channel, roomHash, "game_update", game);
  } catch (er) {
    socket.emit("error", er.message);
  }
}
