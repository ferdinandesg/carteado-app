import { EmptyGuestType, GuestType } from "shared/types";
import RedisClass from "@/lib/redis/client";
import { REDIS_KEYS, REDIS_TTL } from "@/config/redis";

export async function saveGuest(guest: EmptyGuestType): Promise<void> {
  const redis = await RedisClass.getDataClient();
  const serializedGuest = JSON.stringify(guest);
  await redis.set(REDIS_KEYS.guest(guest.id), serializedGuest, {
    EX: REDIS_TTL.guest,
  });
}

export async function getGuest(id: string): Promise<GuestType> {
  const redis = await RedisClass.getDataClient();
  const key = REDIS_KEYS.guest(id);
  const serializedGuest = await redis.get(key);

  if (serializedGuest) {
    return JSON.parse(String(serializedGuest));
  }
  throw "Guest não encontrado";
}

/** Renova TTL do guest a cada conexão autenticada (socket/HTTP). */
export async function touchGuest(id: string): Promise<void> {
  const redis = await RedisClass.getDataClient();
  const key = REDIS_KEYS.guest(id);
  const serializedGuest = await redis.get(key);
  if (!serializedGuest) return;
  await redis.set(key, serializedGuest, { EX: REDIS_TTL.guest });
}
