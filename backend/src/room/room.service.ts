import prisma from "../prisma";
import { RoomInterface } from "./room.schema";

export async function createRoom(room: RoomInterface, userId: string) {
  try {
    const chat = await prisma.chat.create({});
    const createdRoom = await prisma.room.create({
      data: {
        hash: room.hash,
        name: room.name,
        chatId: chat.id,
        status: "open",
        size: room.size,
      },
    });
    await prisma.player.create({
      data: { userId, roomId: createdRoom.id },
    });
    return createdRoom;
  } catch (error) {
    console.log(error);

    throw error;
  }
}

export async function listRooms() {
  try {
    const rooms = await prisma.room.findMany({
      include: { players: true },
      orderBy: { createdAt: "desc" },
    });
    return rooms;
  } catch (error) {
    throw error;
  }
}
export async function getByHash(hash: string, userId: string) {
  try {
    const room = await prisma.room.findFirst({
      where: { hash },
      include: { players: { include: { user: true } } },
    });
    if(!room) throw "Sala não encontrada"
    if (
      !room.players.some((x) => x.user.id === userId) &&
      room.players.length < room.size
    ) {
      const newPlayer = await prisma.player.create({
        data: { userId, roomId: room.id },
        include: { user: true },
      });
      room.players.push(newPlayer);
    }
    return room;
  } catch (error) {
    throw error;
  }
}

export async function joinRoom(hash: string) {
  try {
    const room = await prisma.room.findFirst({
      where: { hash: hash },
      include: { players: { include: { user: true } } },
    });
    if (!room) throw "Sala não encontrada";
    if (room.players.length > room.size) {
      if (!room) throw "A sala já está cheia";
    }
    // if (!room.players.some((x) => x.user.email === socket.user.email)) {
    //   await prisma.player.create({
    //     data: { userId: x.user.id, roomId: room.id },
    //   });
    // }
    // SocketClass.io.to(hash).emit(CHANNEL.SERVER.PLAYER_JOINED, player);
    return room;
  } catch (error) {
    throw error;
  }
}
