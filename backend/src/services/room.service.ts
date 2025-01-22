import { Room } from "@prisma/client";
import prisma from "../prisma";
import { getRoomState, saveRoomState } from "../redis/room";
import { randomUUID } from "node:crypto";

export async function createRoom(room: Partial<Room>, userId: string): Promise<Room> {
  try {
    const uuid = randomUUID();
    const hash = uuid.substring(uuid.length - 4);
    const chat = await prisma.chat.create({});
    const createdRoom = await prisma.room.create({
      data: {
        hash,
        name: room.name,
        chatId: chat.id,
        size: room.size,
        ownerId: userId
      },
    });
    await saveRoomState(hash, createdRoom);
    return createdRoom;
  } catch (error) {
    throw error;
  }
}

export async function listRooms() {
  try {
    const rooms = await prisma.room.findMany({
      include: { players: true, owner: true },
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
      where: { hash },
      include: { players: { include: { user: true } } },
    });

    if (!room) throw "Sala não encontrada";
    return room;
  } catch (error) {
    throw error;
  }
}
