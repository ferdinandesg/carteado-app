import { SocketContext } from "../../@types/socket";
import GameClass from "../../game/game";
import prisma from "../../prisma";

export async function PlayCardEventHandler(
  context: SocketContext
): Promise<void> {
  try {
    const { payload, socket, channel } = context;
    const { card } = payload;
    const result = GameClass.playCard(card, socket.user.id);
    if (!result.error) {
      channel
        .to(socket.user.room)
        .emit(
          "refresh_cards",
          JSON.stringify({ bunch: GameClass.bunch, player: result.player})
        );
    } else {
      socket.emit("error", result.message);
    }
  } catch (er) {}
}
