import RedisClass from "../client";
import { Participant } from "shared/types/room";

import { Room } from "@prisma/client";
export type RoomWithParticipants = Room & { participants: Participant[] };

export async function getRoomState(
  roomHash: string
): Promise<RoomWithParticipants | null> {
  const redis = await RedisClass.getDataClient();
  const data = await redis.get(`room:${roomHash}`);
  return data ? JSON.parse(String(data)) : null;
}

export async function saveRoomState(roomHash: string, roomState: object) {
  const redis = await RedisClass.getDataClient();
  await redis.set(`room:${roomHash}`, JSON.stringify(roomState), {
    EX: 7200,
  });
}

export async function atomicallyUpdateRoomState(
  roomHash: string,
  updateFn: (room: RoomWithParticipants) => RoomWithParticipants | null
): Promise<RoomWithParticipants | null> {
  const redis = await RedisClass.getDataClient();
  const key = `room:${roomHash}`;

  for (let i = 0; i < 3; i++) {
    // Retry up to 3 times
    await redis.watch(key);
    const currentData = (await redis.get(key)) as string;
    const room = currentData ? JSON.parse(currentData) : null;

    if (!room) {
      await redis.unwatch();
      return null;
    }

    const updatedRoom = updateFn(room);

    if (!updatedRoom) {
      await redis.unwatch();
      return room;
    }

    const multi = redis.multi();
    multi.set(key, JSON.stringify(updatedRoom), { EX: 7200 });
    const result = await multi.exec();

    if (result) {
      return updatedRoom; // Success
    }
  }

  throw new Error("Failed to update room state after multiple retries.");
}
