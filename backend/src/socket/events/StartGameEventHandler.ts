import { SocketContext } from "../../@types/socket";
import Deck from "../../cards/interface";
import GameClass from "../../game/game";
import prisma from "../../prisma";

export async function StartGameEventHandler(
  context: SocketContext
): Promise<void> {
  try {
    const { socket, channel } = context;
    const roomId = socket.user.room;

    if (channel.adapter.rooms.get(roomId).size < 2) {
      channel.to(roomId).emit("error", "Falta membros!");
      return;
    }
    const room = await prisma.room.findFirst({
      where: { hash: roomId, status: "open" },
      include: { players: { include: { user: true } } },
    });
    if (!room) {
      channel.to(roomId).emit("error", "Falta membros!");
      return;
    }
    await prisma.room.updateMany({
      where: { hash: roomId, status: "open" },
      data: { status: "playing" },
    });

    new GameClass(room.players);
    channel.to(roomId).emit("player_turn", GameClass.playerTurn);

    room.players.forEach((player) => {
      const tableCards = GameClass.givePlayerCards(player.user.id);
      channel.to(roomId).emit(
        "give_cards",
        JSON.stringify({
          id: player.userId,
          tableCards,
        })
      );
    });
    channel.to(roomId).emit("begin_match");
  } catch (er) {
    console.error(er);
  }
}
