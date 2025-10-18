import emitToRoom from "@/socket/utils/emitToRoom";
import { SocketContext } from "../../../@types/socket";
import ErrorHandler from "utils/error.handler";
import { TrucoGame } from "game/TrucoGameRules";
import { getGameInstance, saveGameInstance } from "@/services/game.service";

export async function AcceptTrucoEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, channel } = context;
  try {
    const roomHash = socket.user.room;
    if (!roomHash) throw "ROOM_NOT_FOUND";
    const game = await getGameInstance<TrucoGame>(roomHash);
    game.rules.acceptTruco(game, socket.user.id);

    await saveGameInstance(roomHash, game);
    emitToRoom(channel, roomHash, "game_updated", game);
  } catch (error) {
    ErrorHandler(error, socket);
  }
}
