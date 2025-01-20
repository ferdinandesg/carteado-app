import { SocketContext } from "../../../@types/socket";
import GameClass from "../../../game/game";
import prisma from "../../../prisma";
import { saveGameState } from "../../../redis/game";
import { getRoomState } from "../../../redis/room";

export async function StartGameEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, channel } = context;
  const roomId = socket.user.room;
  try {
    const room = await getRoomState(roomId);
    if (!room || socket.id !== room.ownerId) {
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
    const game = new GameClass(room.players);
    room.status = "playing";
    room.players.forEach(p => {
      p.status = "chosing";
      p.hand = game.givePlayerCards(p.user.id);
    });

    await saveGameState(roomId, game);
    room.players.forEach((player) => {
      channel.to(player.id).emit('give_cards', player.hand);
    });

    channel.to(roomId).emit("start_game", {
      message: 'O jogo começou!',
      players: room.players.map(p =>
        ({ id: p.id, name: p.user.name, cardCount: p.hand.length })
      ),
      currentTurn: game.playerTurn,
      cardsOnTable: game.cards
    });
  } catch (er) {
    console.error(er);
    throw er
  }
}
