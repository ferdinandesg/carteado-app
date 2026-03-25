import RedisClass from "@/lib/redis/client";
import prisma from "@/prisma";
import { logger } from "@/utils/logger";

export type HealthStatus = "ok" | "degraded" | "unhealthy";

export type HealthCheckResult = {
  status: HealthStatus;
  redis: "up" | "down";
  database: "up" | "down";
};

export async function checkHealth(): Promise<HealthCheckResult> {
  let redisStatus: "up" | "down" = "down";
  let dbStatus: "up" | "down" = "down";

  try {
    const redis = await RedisClass.getDataClient();
    await redis.ping();
    redisStatus = "up";
  } catch (err) {
    logger.warn({ err }, "Health check: Redis ping failed");
  }

  try {
    await (prisma as any).$queryRaw`SELECT 1`;
    dbStatus = "up";
  } catch (err) {
    logger.warn({ err }, "Health check: Database ping failed");
  }

  const status: HealthStatus =
    redisStatus === "up" && dbStatus === "up"
      ? "ok"
      : redisStatus === "down" && dbStatus === "down"
        ? "unhealthy"
        : "degraded";

  return { status, redis: redisStatus, database: dbStatus };
}
