import emitToRoom from "@socket/utils/emitToRoom";
import { SocketContext } from "../../../@types/socket";
import { getGameState, saveGameState } from "../../../redis/game";
import ErrorHandler from "src/utils/error.handler";

export async function PlayCardEventHandler(
  context: SocketContext
): Promise<void> {
  const { payload, socket, channel } = context;
  try {
    const { card } = payload;
    const roomHash = socket.user.room;
    if (!roomHash) throw "Você não está em uma sala";
    const game = await getGameState(roomHash);
    game.playCard(card, socket.user.id);

    await saveGameState(roomHash, game);
    emitToRoom(channel, roomHash, "game_update", game);
  } catch (error) {
    ErrorHandler(error, socket);
  }
}
