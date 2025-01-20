import { Prisma } from "@prisma/client";
import RedisClass from "../client";

type PopulatedRoom = Prisma.RoomGetPayload<{
  include: {
    players: true
   
  }
}>

export async function getRoomState(roomId: string): Promise<PopulatedRoom | null> {
  const redis = await RedisClass.getInstance();
  console.log({roomId})
  const data = await redis.get(`room:${roomId}`);
  return data ? JSON.parse(data) : null;
}

export async function saveRoomState(roomId: string, roomState: object) {
  const redis = await RedisClass.getInstance();
  await redis.set(`room:${roomId}`, JSON.stringify(roomState), {
    EX: 3600,
  });
}



