import { SocketContext } from "../../../@types/socket";
import GameClass from "../../../game/game";
import prisma from "../../../prisma";
import { saveGameState } from "../../../redis/game";
import { getRoomState, saveRoomState } from "../../../redis/room";
import getRoomPlayers from "src/socket/utils/getRoomPlayers";
import emitToRoom from "@socket/utils/emitToRoom";
import ErrorHandler from "src/utils/error.handler";

export async function StartGameEventHandler(
  context: SocketContext
): Promise<void> {
  const { socket, channel } = context;
  if (!socket.user?.room || !socket.user) return;
  const roomHash = socket.user.room;
  try {
    const room = await getRoomState(roomHash);
    if (!room) throw "ROOM_NOT_FOUND";
    const roomId = room.id;
    if (room.status !== "open") throw "ROOM_IS_PLAYING";
    if (socket.user.id !== room.ownerId) throw "OWNER_SHOULD_BEGIN";

    const users = getRoomPlayers(room.hash, channel);
    const isAllUsersReady = users.every((user) => user.status === "READY");
    if (!isAllUsersReady) throw "PLAYERS_NOT_READY";

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
    const roomSize = channel.adapter.rooms.get(room.hash)?.size || 0;
    if (roomSize < room.size) throw "ROOM_NOT_FULL";

    emitToRoom(channel, room.hash, "info", "MATCH_STARTED");

    await prisma.room.updateMany({
      where: { hash: roomHash, status: "open" },
      data: { status: "playing" },
    });

    room.players = players;
    const game = new GameClass(room.players);
    game.status = "playing";
    game.players.forEach((p) => {
      p.status = "chosing";
      const hand = game.givePlayerCards(p.userId);
      p.hand = hand || [];
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
  } catch (error) {
    ErrorHandler(error, socket);
  }
}
