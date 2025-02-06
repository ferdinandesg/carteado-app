import emitToRoom from "@socket/utils/emitToRoom";
import { SocketContext } from "../../../@types/socket";
import { getGameState, saveGameState } from "../../../redis/game";
import { CarteadoGame } from "src/game/CarteadoGameRules";

export async function PickHandEventHandler(
  context: SocketContext
): Promise<void> {
  const { payload, socket, channel } = context;
  const { cards } = payload;
  const roomHash = socket.user.room;
  if (!roomHash) throw "USER_NOT_IN_ROOM";
  const game = (await getGameState(roomHash)) as CarteadoGame;

  game.rules.pickHand(game, socket.user.id, cards);

  emitToRoom(channel, roomHash, "game_update", game);

  await saveGameState(roomHash, game);
}
