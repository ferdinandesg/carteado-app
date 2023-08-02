import prisma from "../prisma";
import { CHANNEL } from "../socket/channels";
import SocketClass from "../socket/socket";
import { RoomInterface } from "./room.schema";

const ROOMS: RoomInterface[] = [];
export async function createRoom(room: RoomInterface) {
  try {
    const chat = await prisma.chat.create({});
    const createdRoom = await prisma.room.create({
      data: { hash: room.hash, name: room.name, chatId: chat.id },
    });
    return createdRoom;
  } catch (error) {
    throw error;
  }
}

export async function listRooms() {
  try {
    const rooms = await prisma.room.findMany({});
    return { rooms: ROOMS };
  } catch (error) {
    throw error;
  }
}
export async function getByHash(hash: string) {
  try {
    const room = await prisma.room.findFirst({
      where: { hash },
      include: { players: { select: { user: true } } },
    });
    console.log({ room });

    return room;
  } catch (error) {
    throw error;
  }
}

export async function joinRoom(hash: string, player: string) {
  try {
    const room = await prisma.room.findFirst({ where: { hash: hash } });
    if (!room) throw "Room not found";
    SocketClass.io.to(hash).emit(CHANNEL.SERVER.PLAYER_JOINED, player);
  } catch (error) {
    throw error;
  }
}
