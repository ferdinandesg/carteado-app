import { Message } from "@prisma/client";
import RedisClass from "../client";

export async function getMessages(roomHash: string) {
  const redis = await RedisClass.getInstance();
  const data = await redis.get(`chat:${roomHash}`);
  return data ? JSON.parse(data) : [];
}

export async function saveMessages(roomHash: string, messages: Message[]) {
  const redis = await RedisClass.getInstance();
  await redis.set(`chat:${roomHash}`, JSON.stringify(messages), {
    EX: 7200,
  });
}
