import { Socket } from "socket.io/dist/socket";
import RedisClass from "@/lib/redis/client";
import { logger } from "@/utils/logger";
import { REDIS_KEYS, REDIS_TTL } from "@/config/redis";

export async function storeSession(socket: Socket, roomHash: string) {
  const redis = await RedisClass.getDataClient();
  const session = {
    userId: socket.user.id,
    name: socket.user.name,
    roomHash: roomHash,
    status: "playing",
  };

  await redis.set(REDIS_KEYS.session(socket.user.id), JSON.stringify(session), {
    EX: REDIS_TTL.session,
  });
}

export async function retrieveSession(userId: string) {
  const redis = await RedisClass.getDataClient();
  const sessionData = await redis.get(REDIS_KEYS.session(userId));
  if (!sessionData) return null;
  return JSON.parse(String(sessionData));
}

export async function expireSession(userId: string) {
  const redis = await RedisClass.getDataClient();
  logger.info(`User ${userId} disconnected. Setting session TTL.`);
  redis.expire(REDIS_KEYS.session(userId), REDIS_TTL.session);
}
