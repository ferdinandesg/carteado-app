import { Room } from "@prisma/client";
import prisma from "../prisma";
import { getRoomState, saveRoomState } from "../redis/room";
import { randomUUID } from "node:crypto";
import { GuestType, SocketUser } from "shared/types";

export async function createRoom(
  {
    name,
    size,
    rule,
  }: {
    name: string;
    size: number;
    rule: "CarteadoGameRules" | "TrucoGameRules";
  },
  user: SocketUser | GuestType
): Promise<Room> {
  const uuid = randomUUID();
  const hash = uuid.substring(uuid.length - 4);
  const chat = await prisma.chat.create({});
  const createdRoom = await prisma.room.create({
    data: {
      hash,
      rule,
      name: name,
      chatId: chat.id,
      size: size,
      ...(user.role === "user" && { ownerId: user.id }),
    },
  });
  await saveRoomState(hash, createdRoom);
  return createdRoom;
}

export async function listRooms() {
  const rooms = await prisma.room.findMany({
    where: { status: { in: ["open", "playing"] } },
    include: { players: true, owner: true },
    orderBy: { createdAt: "desc" },
  });
  return rooms;
}

export async function getRoom(hash: string) {
  const roomCache = await getRoomState(hash);
  if (roomCache) {
    return roomCache;
  }
  const room = await prisma.room.findFirst({
    where: { hash },
    include: { players: { include: { user: true } } },
  });

  if (!room) throw "Sala não encontrada";
  return room;
}

export async function expireRoomByHash(hash: string) {
  const room = await prisma.room.updateMany({
    where: { hash, status: { not: "finished" } },
    data: { status: "expired" },
  });
  return room;
}
