import { SocketContext } from "../../@types/socket";
import GameClass from "../../game/game";

export async function PickHandEventHandler(
  context: SocketContext
): Promise<void> {
  const { payload, socket, channel } = context;
  const { cards } = payload;
  const result = GameClass.pickHand(socket.user.id, cards);
  channel
    .to(socket.user.room)
    .emit(
      "selected_hand",
      JSON.stringify({ email: socket.user.email, player: result.player })
    );
  if (result.isFinished) channel.to(socket.user.room).emit("begin_match");
}
