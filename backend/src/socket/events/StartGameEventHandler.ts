import { SocketContext } from "../../@types/socket";
import Deck from "../../cards/interface";
import GameClass from "../../game/game";
import prisma from "../../prisma";

export async function StartGameEventHandler(
  context: SocketContext
): Promise<void> {
  try {
    const { payload, socket, channel } = context;
    const roomId = socket.user.room;

    if (channel.adapter.rooms.get(roomId).size < 2) {
      channel.to(roomId).emit("error", "Falta membros!");
      return;
    }
    const room = await prisma.room.findFirst({
      where: { hash: roomId },
      include: { players: { include: { user: true } } },
    });
    new GameClass(room.players);

    room.players.forEach((player) => {
      const tableCards = GameClass.givePlayerCards(player.user.id);
      channel.to(roomId).emit(
        "give_cards",
        JSON.stringify({
          email: player.user.email,
          tableCards,
        })
      );
    });
    channel.to(roomId).emit("select_cards", GameClass.playerTurn);
  } catch (er) {
    console.error(er);
  }
}
