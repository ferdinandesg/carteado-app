import { SocketContext } from "../../@types/socket";
import GameClass from "../../game/game";
import prisma from "../../prisma";

export async function PickHandEventHandler(
  context: SocketContext
): Promise<void> {
  const { payload, socket, channel } = context;
  const { cards } = payload;
  const result = GameClass.pickHand(socket.user.id, cards);
  await prisma.player.update({ where: { id: result.player.id }, data: { hand: result.player.hand, table: result.player.table } })

  channel
    .to(socket.user.room)
    .emit(
      "selected_hand",
      JSON.stringify({ id: socket.user.id, player: result.player })
    );
  if (result.isFinished) channel.to(socket.user.room).emit("begin_match");
}
