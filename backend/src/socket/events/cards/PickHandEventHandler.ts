import { SocketContext } from "../../../@types/socket";
import { getGameState, getRoomState, saveGameState } from "../../../redis/actions";

export async function PickHandEventHandler(
  context: SocketContext
): Promise<void> {
  const { payload, socket, channel } = context;
  const { cards } = payload;
  const roomId = socket.user.room;
  const game = await getGameState(roomId)
  const result = game.pickHand(socket.user.id, cards);
  channel
    .to(roomId)
    .emit("selected_hand", JSON.stringify({ player: result.player }));
  if (result.isFinished) channel.to(roomId).emit("all_chosed");
  game.status = "playing";
  socket.broadcast.to(roomId).emit("game_update", game);
  await saveGameState(roomId, game);
}
