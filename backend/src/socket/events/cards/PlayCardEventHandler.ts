import { SocketContext } from "../../../@types/socket";
import GameClass from "../../../game/game";
import prisma from "../../../prisma";

export async function PlayCardEventHandler(
  context: SocketContext
): Promise<void> {
  const { payload, socket, channel } = context;
  try {
    const { card } = payload;
    const result = GameClass.playCard(card, socket.user.id);

    channel
      .to(socket.user.room)
      .emit(
        "refresh_room",
        JSON.stringify({ bunch: GameClass.bunch, player: result.player })
      );

    Promise.allSettled([
      prisma.player.update({
        where: { id: result.player.id },
        data: { hand: result.player.hand, table: result.player.table },
      }),
      prisma.room.update({
        where: { id: result.player.roomId },
        data: { bunch: result.bunch },
      }),
    ]).then((settled) => console.log({ settled }));
  } catch (er) {
    socket.emit("error", er.message);
  }
}
