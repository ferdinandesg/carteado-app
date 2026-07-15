import prisma from "@/prisma";
import RedisClass from "@/lib/redis/client";

export async function resetIntegrationState(): Promise<void> {
  const redis = await RedisClass.getDataClient();
  await redis.flushDb();

  await prisma.player.deleteMany();
  await prisma.game.deleteMany();
  await prisma.room.deleteMany();
  await prisma.chat.deleteMany();
  await prisma.user.deleteMany();
}
