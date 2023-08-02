import { SocketContext } from "../../@types/socket";
import Deck from "../../cards/interface";
import GameClass from "../../game/game";
import prisma from "../../prisma";

export async function EndTurnEventHandler(
  context: SocketContext
): Promise<void> {
  try {
    const { payload, socket, channel } = context;

    const result = GameClass.endTurn(socket.user.id);
    if (!result.error) {
      channel
        .to(socket.user.room)
        .emit(
          "refresh_cards",
          JSON.stringify({ bunch: GameClass.bunch, player: result.player, playerTurn: GameClass.playerTurn })
        );
    } else {
      socket.emit("error", result.message);
    }
  } catch (er) {
    console.error(er);
  }
}
