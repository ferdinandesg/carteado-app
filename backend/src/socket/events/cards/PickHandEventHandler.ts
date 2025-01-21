import emitToRoom from "src/socket/utils/emitToRoom";
import { SocketContext } from "../../../@types/socket";
import { getGameState, saveGameState } from "../../../redis/game";

export async function PickHandEventHandler(
  context: SocketContext
): Promise<void> {
  const { payload, socket, channel } = context;
  const { cards } = payload;
  const roomHash = socket.user.room;
  const game = await getGameState(roomHash)
  const result = game.pickHand(socket.user.id, cards);
  if (result.isFinished) channel.to(roomHash).emit("all_chosed");
  game.status = "playing";
  emitToRoom(channel, roomHash, "game_update", game);

  await saveGameState(roomHash, game);
}
