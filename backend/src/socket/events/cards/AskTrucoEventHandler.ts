import emitToRoom from "@socket/utils/emitToRoom";
import { SocketContext } from "../../../@types/socket";
import { getGameState, saveGameState } from "../../../redis/game";
import ErrorHandler from "src/utils/error.handler";
import { TrucoGame } from "src/game/TrucoGameRules";

export async function AskTrucoEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, channel } = context;
  try {
    const roomHash = socket.user.room;
    if (!roomHash) throw "ROOM_NOT_FOUND";
    const game = (await getGameState(roomHash)) as TrucoGame;
    game.rules.askTruco(game, socket.user.id);

    await saveGameState(roomHash, game);
    emitToRoom(channel, roomHash, "game_updated", game);
  } catch (error) {
    ErrorHandler(error, socket);
  }
}
