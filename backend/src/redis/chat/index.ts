import { Message } from "@prisma/client";
import RedisClass from "../client";

export async function getMessages(roomId: string) {
  const redis = await RedisClass.getInstance()
  const data = await redis.get(`chat:${roomId}`);
  return data ? JSON.parse(data) : [];
}

export async function saveMessages(roomId: string, messages: Message[]) {
  const redis = await RedisClass.getInstance();
  await redis.set(`chat:${roomId}`, JSON.stringify(messages), {
    EX: 3600,
  });
}