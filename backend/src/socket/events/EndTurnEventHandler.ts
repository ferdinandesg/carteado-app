import { SocketContext } from "../../@types/socket";
import Deck from "../../cards/interface";
import GameClass from "../../game/game";
import prisma from "../../prisma";

export async function EndTurnEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, channel } = context;
  try {
    const result = GameClass.endTurn(socket.user.id);
    channel
      .to(socket.user.room)
      .emit(
        "refresh_cards",
        JSON.stringify({ bunch: GameClass.bunch, player: result.player })
      );
    channel.to(socket.user.room).emit("player_turn", GameClass.playerTurn);
  } catch (er) {
    console.error(er);
    socket.emit("error", er.message);
  }
}
