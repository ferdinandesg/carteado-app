import { SocketContext } from "../../@types/socket";
import GameClass from "../../game/game";
import prisma from "../../prisma";

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
        "refresh_cards",
        JSON.stringify({ bunch: GameClass.bunch, player: result.player })
      );
  } catch (er) {
    console.log(er);

    socket.emit("error", er.message);
  }
}
