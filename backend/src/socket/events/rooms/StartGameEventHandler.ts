import { SocketContext } from "../../../@types/socket";
import GameClass from "../../../game/game";
import prisma from "../../../prisma";

export async function StartGameEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, channel } = context;
  const roomId = socket.user.room;
  try {
    const room = await prisma.room.findFirst({
      where: { hash: roomId, status: "open" },
      include: { players: { include: { user: true } } },
    });

    if (!room) {
      channel.to(roomId).emit("error", "Sala não encontrada!");
      return;
    }

    if (channel.adapter.rooms.get(roomId)?.size < 2) {
      channel.to(roomId).emit("error", "Falta membros!");
      return;
    }
    channel.emit("info", "Iniciando partida");

    await prisma.room.updateMany({
      where: { hash: roomId, status: "open" },
      data: { status: "playing" },
    });

    new GameClass(room.players);
    channel.to(roomId).emit("player_turn", GameClass.playerTurn);

    room.players.forEach(async (player) => {
      const tableCards = GameClass.givePlayerCards(player.user.id);
      channel.to(roomId).emit(
        "give_cards",
        JSON.stringify({
          id: player.userId,
          tableCards,
        })
      );
      await prisma.player.update({
        where: { id: player.id },
        data: { table: tableCards, status: "choosing" },
      });
    });
    channel.to(roomId).emit("start_game");
  } catch (er) {
    channel
      .to(roomId)
      .emit("error", typeof er === "string" ? er : JSON.stringify(er));
    console.error(er);
  }
}
