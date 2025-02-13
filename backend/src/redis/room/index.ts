import { Prisma } from "@prisma/client";
import RedisClass from "../client";
import { GuestType, SocketUser } from "shared/types";
import { GamePlayer } from "src/game/game";

type PopulatedRoom = {
  spectators: (SocketUser | GuestType)[];
  players: GamePlayer[];
} & Prisma.RoomGetPayload<object>;

export async function getRoomState(
  roomHash: string
): Promise<PopulatedRoom | null> {
  const redis = await RedisClass.getDataClient();
  const data = await redis.get(`room:${roomHash}`);
  return data ? JSON.parse(data) : null;
}

export async function saveRoomState(roomHash: string, roomState: object) {
  const redis = await RedisClass.getDataClient();
  await redis.set(`room:${roomHash}`, JSON.stringify(roomState), {
    EX: 7200,
  });
}
