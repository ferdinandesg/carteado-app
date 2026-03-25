import { Message } from "@prisma/client";
import RedisClass from "@/lib/redis/client";
import { REDIS_KEYS, REDIS_TTL } from "@/config/redis";

export async function getMessages(roomHash: string) {
  const redis = await RedisClass.getDataClient();
  const data = await redis.get(REDIS_KEYS.chat(roomHash));
  return data ? JSON.parse(String(data)) : [];
}

export async function saveMessages(roomHash: string, messages: Message[]) {
  const redis = await RedisClass.getDataClient();
  await redis.set(REDIS_KEYS.chat(roomHash), JSON.stringify(messages), {
    EX: REDIS_TTL.chat,
  });
}
