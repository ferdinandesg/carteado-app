import RedisClass from "../client";
import { Participant } from "shared/types/room";

import { Room } from "@prisma/client";
export type RoomWithParticipants = Room & { participants: Participant[] };

export async function getRoomState(
  roomHash: string
): Promise<RoomWithParticipants | null> {
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
