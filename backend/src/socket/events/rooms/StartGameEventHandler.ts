import { SocketContext } from "../../../@types/socket";
import GameClass from "../../../game/game";
import prisma from "../../../prisma";
import { saveGameState } from "../../../redis/game";
import { getRoomState, saveRoomState } from "../../../redis/room";

export async function StartGameEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, channel } = context;
  const roomId = socket.user.room;
  try {
    const room = await getRoomState(roomId);

    if (!room) {
      channel.to(roomId).emit("error", "Sala não encontrada!");
      return;
    }

    if (socket.user.id !== room.ownerId) {
      channel.to(roomId).emit("error", "Apenas o dono da sala pode iniciar a partida!");
      return
    }

    const users = [];

    for (const socketId of channel.adapter.rooms.get(roomId)) {
      const socket = channel.sockets.get(socketId);
      if (socket && socket.user) {
        users.push(socket.user);
      }
    }

    if (channel.adapter.rooms.get(roomId)?.size < 1) {
      channel.to(roomId).emit("error", "Falta membros!");
      return;
    }
    channel.emit("info", "Iniciando partida");

    await prisma.room.updateMany({
      where: { hash: roomId, status: "open" },
      data: { status: "playing" },
    });
    await saveRoomState(roomId, {
      ...room,
      status: "playing",
    });
    room.players = users

    const game = new GameClass(room.players);
    game.status = "playing";
    game.players.forEach(p => {
      p.status = "chosing";
      p.hand = game.givePlayerCards(p.id);
    });

    await saveGameState(roomId, game);
    
    game.players.forEach((player) => {
      channel.to(player.id).emit('give_cards', player.hand);
    });

    channel.to(roomId).emit("start_game", {
      message: 'O jogo começou!',
      players: game.players.map(p =>
        ({ id: p.id, name: (p as any).name, cardCount: p.hand.length })
      ),
      currentTurn: game.playerTurn,
      cardsOnTable: game.cards
    });
  } catch (er) {
    console.error(er);
    throw er
  }
}
