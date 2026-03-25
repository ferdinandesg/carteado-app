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
  const serializedGuest = await redis.get(REDIS_KEYS.guest(id));

  if (serializedGuest) {
    return JSON.parse(String(serializedGuest));
  }
  throw "Guest não encontrado";
}
