import { EmptyGuestType, GuestType } from "shared/types";
import RedisClass from "src/redis/client";

export async function saveGuest(guest: EmptyGuestType): Promise<void> {
  const redis = await RedisClass.getDataClient();
  const serializedGuest = JSON.stringify(guest);
  await redis.set(`guest:${guest.id}`, serializedGuest, {
    EX: 7200,
  });
}

export async function getGuest(id: string): Promise<GuestType> {
  const redis = await RedisClass.getDataClient();
  const serializedGuest = await redis.get(`guest:${id}`);
  if (serializedGuest) {
    return JSON.parse(String(serializedGuest));
  }
  throw "Guest não encontrado";
}
