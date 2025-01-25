import { SocketContext } from "../../../@types/socket";
import GameClass from "../../../game/game";
import prisma from "../../../prisma";
import { saveGameState } from "../../../redis/game";
import { getRoomState, saveRoomState } from "../../../redis/room";
import getRoomPlayers from "src/socket/utils/getRoomPlayers";
import emitToRoom from "src/socket/utils/emitToRoom";

export async function StartGameEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, channel } = context;
  const roomHash = socket.user.room;
  try {
    const room = await getRoomState(roomHash);
    const roomId = room.id;
    if (!room) throw "Sala não encontrada!";
    if (room.status !== "open") throw "A sala já está em jogo!";
    if (socket.user.id !== room.ownerId)
      throw "Apenas o dono da sala pode iniciar a partida!";

    const users = getRoomPlayers(room.hash, channel);
    const isAllUsersReady = users.every((user) => user.status === "READY");
    if (!isAllUsersReady) throw "Nem todos os jogadores estão prontos!";

    await prisma.player.createMany({
      data: users.map((user) => ({
        roomId,
        status: "chosing",
        userId: user.id,
      })),
    });
    const players = await prisma.player.findMany({
      where: { roomId: room.id },
      include: { user: true },
    });

    if (channel.adapter.rooms.get(roomId)?.size < room.size)
      throw "Faltam jogadores na sala!";

    emitToRoom(channel, room.hash, "info", "Iniciando partida");

    await prisma.room.updateMany({
      where: { hash: roomId, status: "open" },
      data: { status: "playing" },
    });

    room.players = players;
    const game = new GameClass(room.players);
    game.status = "playing";
    game.players.forEach((p) => {
      p.status = "chosing";
      p.hand = game.givePlayerCards(p.userId);
      p.name = p.user.name;
      p.image = p.user.image;
      p.email = p.user.email;
    });

    await saveGameState(room.hash, game);

    const newRoom = {
      ...room,
      status: "playing",
    };
    await saveRoomState(room.hash, newRoom);

    emitToRoom(channel, room.hash, "game_update", game);
    emitToRoom(channel, room.hash, "room_update", {
      room: newRoom,
      players: game.players,
    });
  } catch (er) {
    channel.emit("error", JSON.stringify({ message: er }));
    console.error(er);
    throw er;
  }
}
