import { Socket } from "socket.io/dist/socket";
import RedisClass from "./client";
import { logger } from "@/utils/logger";

export async function storeSession(socket: Socket, roomHash: string) {
  const redis = await RedisClass.getDataClient();
  const session = {
    userId: socket.user.id,
    name: socket.user.name,
    roomHash: roomHash,
    status: "playing",
  };

  await redis.set(`session:${socket.user.id}`, JSON.stringify(session), {
    EX: 300,
  });
}

export async function retrieveSession(userId: string) {
  const redis = await RedisClass.getDataClient();
  const sessionData = await redis.get(`session:${userId}`);
  if (!sessionData) return null;
  return JSON.parse(String(sessionData));
}

export async function expireSession(userId: string) {
  const redis = await RedisClass.getDataClient();
  logger.info(`User ${userId} disconnected. Setting session TTL.`);
  redis.expire(`session:${userId}`, 300);
}
