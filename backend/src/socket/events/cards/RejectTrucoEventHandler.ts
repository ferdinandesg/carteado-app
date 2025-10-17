import emitToRoom from "@/socket/utils/emitToRoom";
import { SocketContext } from "../../../@types/socket";
import { getGameState, saveGameState } from "@/lib/redis/game";
import ErrorHandler from "utils/error.handler";
import { TrucoGame } from "game/TrucoGameRules";

export async function RejectTrucoEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, channel } = context;
  try {
    const roomHash = socket.user.room;
    if (!roomHash) throw "ROOM_NOT_FOUND";
    const game = (await getGameState(roomHash)) as TrucoGame;
    game.rules.rejectTruco(game, socket.user.id);

    await saveGameState(roomHash, game);
    emitToRoom(channel, roomHash, "game_updated", game);
  } catch (error) {
    ErrorHandler(error, socket);
  }
}
