import emitToRoom from "@/socket/utils/emitToRoom";
import { SocketContext } from "../../../@types/socket";
import ErrorHandler from "utils/error.handler";
import { CarteadoGame } from "game/CarteadoGameRules";
import { getGameInstance, saveGameInstance } from "@/services/game.service";
export async function DrawTableEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, channel } = context;
  try {
    const roomHash = socket.user.room;
    if (!roomHash) throw "Você não está em uma sala";
    const game = await getGameInstance<CarteadoGame>(roomHash);
    game.rules.pickUpBunch(game, socket.user.id);
    await saveGameInstance(roomHash, game);
    emitToRoom(channel, roomHash, "game_updated", game);
  } catch (error) {
    ErrorHandler(error, socket);
  }
}
