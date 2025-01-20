import { Prisma } from "@prisma/client";
import RedisClass from "../client";

type PopulatedRoom = Prisma.RoomGetPayload<{
  include: {
    players: {
      include: {
        user: true
      }
    };
  }
}>
export async function getRoomState(roomId: string): Promise<PopulatedRoom | null> {
  const redis = await RedisClass.getInstance();
  const data = await redis.get(`game:${roomId}`);
  return data ? JSON.parse(data) : null;
}

export async function saveRoomState(roomId: string, roomState: object) {
  const redis = await RedisClass.getInstance();
  await redis.set(`game:${roomId}`, JSON.stringify(roomState), {
    EX: 3600,
  });
}



