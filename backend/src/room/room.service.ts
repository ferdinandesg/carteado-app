import { Room } from "@prisma/client";
import prisma from "../prisma";
import { getRoomState, saveRoomState } from "../redis/room";

export async function createRoom(room: Partial<Room>, userId: string): Promise<Room> {
  try {
    const chat = await prisma.chat.create({});
    const createdRoom = await prisma.room.create({
      data: {
        hash: room.hash,
        name: room.name,
        chatId: chat.id,
        status: "open",
        size: room.size,
        ownerId: userId,
      },
    });
    await prisma.player.create({
      data: { userId, roomId: createdRoom.id },
    });
    await saveRoomState(createdRoom.id, createdRoom);
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

export async function getRoom(hash: string) {
  try {
    const roomCache = await getRoomState(hash)
    if (roomCache) {
      return roomCache
    }
    const room = await prisma.room.findFirst({
      where: { hash: hash },
      include: { players: { include: { user: true } } },
    });
    if (!room) throw "Sala não encontrada";
    return room;
  } catch (error) {
    throw error;
  }
}
