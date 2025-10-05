import prisma from "../prisma";
import {
  getRoomState,
  RoomWithParticipants,
  saveRoomState,
} from "../redis/room";
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
): Promise<RoomWithParticipants> {
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
  const room = {
    ...createdRoom,
    participants: [],
  };
  await saveRoomState(hash, room);
  return room;
}

export async function listRooms() {
  const dbRooms = await prisma.room.findMany({
    where: { status: { in: ["open", "playing"] } },
    orderBy: { createdAt: "desc" },
  });

  const cacheRooms = (await Promise.all(
    dbRooms.map(async (room) => {
      const roomCache = await getRoomState(room.hash);
      return roomCache || room;
    })
  )) as RoomWithParticipants[];
  const rooms = dbRooms.reduce<RoomWithParticipants[]>((acc, room) => {
    const cacheRoom = cacheRooms.find((r) => r.hash === room.hash);
    acc.push({
      ...room,
      participants: cacheRoom?.participants || [],
    });
    return acc;
  }, []);

  return rooms;
}

export async function getRoom(hash: string): Promise<RoomWithParticipants> {
  const roomCache = await getRoomState(hash);
  console.log({
    roomCache,
  });
  if (roomCache) {
    return roomCache;
  }
  const room = await prisma.room.findFirst({
    where: { hash },
  });

  if (!room) throw "Sala não encontrada";
  return { ...room, participants: [] };
}

export async function expireRoomByHash(hash: string) {
  const room = await prisma.room.updateMany({
    where: { hash, status: { not: "finished" } },
    data: { status: "expired" },
  });
  return room;
}
