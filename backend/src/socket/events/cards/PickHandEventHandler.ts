import { SocketContext } from "../../../@types/socket";
import GameClass from "../../../game/game";
import prisma from "../../../prisma";

export async function PickHandEventHandler(
  context: SocketContext
): Promise<void> {
  const { payload, socket, channel } = context;
  const { cards } = payload;
  const result = GameClass.pickHand(socket.user.id, cards);

  channel
    .to(socket.user.room)
    .emit("selected_hand", JSON.stringify({ player: result.player }));
  if (result.isFinished) channel.to(socket.user.room).emit("all_chosed");
  await prisma.player.update({
    where: { id: result.player.id },
    data: {
      hand: result.player.hand,
      table: result.player.table,
      status: "playing",
    },
  });
}
