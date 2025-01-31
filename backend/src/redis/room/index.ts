import { Prisma, User } from "@prisma/client";
import RedisClass from "../client";
import { PopulatedPlayer } from "src/game/game";

type PopulatedRoom = {
  spectators: User[];
  players: PopulatedPlayer[];
} & Prisma.RoomGetPayload<object>;

export async function getRoomState(
  roomHash: string
): Promise<PopulatedRoom | null> {
  const redis = await RedisClass.getInstance();
  const data = await redis.get(`room:${roomHash}`);
  return data ? JSON.parse(data) : null;
}

export async function saveRoomState(roomHash: string, roomState: object) {
  const redis = await RedisClass.getInstance();
  await redis.set(`room:${roomHash}`, JSON.stringify(roomState), {
    EX: 7200,
  });
}
