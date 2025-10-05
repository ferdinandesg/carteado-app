import emitToRoom from "@socket/utils/emitToRoom";
import { SocketContext } from "../../../@types/socket";
import { getGameState, saveGameState } from "../../../redis/game";
import ErrorHandler from "src/utils/error.handler";
import { CarteadoGame } from "src/game/CarteadoGameRules";

export async function RetrieveCardEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, channel } = context;
  try {
    const roomHash = socket.user.room;
    if (!roomHash) throw "Você não está em uma sala";
    const game = (await getGameState(roomHash)) as CarteadoGame;
    game.rules.undoPlay(game, socket.user.id);
    await saveGameState(roomHash, game);
    emitToRoom(channel, roomHash, "game_updated", game);
  } catch (error) {
    ErrorHandler(error, socket);
  }
}
