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
    channel.to(socket.user.room).emit(
      "refresh_room",
      JSON.stringify({
        bunch: result.bunch,
        player: result.player,
        turn: result.turn,
      })
    );

    channel.to(socket.user.email).emit("player_turn");
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
    console.error(er);
    socket.emit("error", er.message);
  }
}
