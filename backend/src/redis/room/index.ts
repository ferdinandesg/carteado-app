import { Prisma, User } from "@prisma/client";
import RedisClass from "../client";
import { PopulatedPlayer } from "src/game/game";

type PopulatedRoom = {
  spectators: User[];
  players: PopulatedPlayer[];
} & Prisma.RoomGetPayload<object>;

export async function getRoomState(
  roomId: string
): Promise<PopulatedRoom | null> {
  const redis = await RedisClass.getInstance();
  const data = await redis.get(`room:${roomId}`);
  return data ? JSON.parse(data) : null;
}

export async function saveRoomState(roomId: string, roomState: object) {
  const redis = await RedisClass.getInstance();
  await redis.set(`room:${roomId}`, JSON.stringify(roomState), {
    EX: 3600,
  });
}
