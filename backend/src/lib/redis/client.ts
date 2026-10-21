import { createClient, RedisClientType } from "redis";
import { env } from "@/config/env";
import { logger } from "@/utils/logger";
import { REDIS_KEY_PREFIX } from "@/config/redis";

type RoomExpiredHandler = (roomHash: string) => Promise<unknown>;

const REDIS_URL = env.REDIS_URL || "redis://localhost:6379";

class RedisClass {
  private static dataClient: RedisClientType | null = null;
  private static subscribeClient: RedisClientType | null = null;
  private static roomExpiredHandler: RoomExpiredHandler | null = null;

  private constructor() {}

  public static onRoomExpired(handler: RoomExpiredHandler): void {
    RedisClass.roomExpiredHandler = handler;
  }

  public static async getDataClient(): Promise<RedisClientType> {
    if (!RedisClass.dataClient) {
      RedisClass.dataClient = createClient({ url: REDIS_URL });

      RedisClass.dataClient.on("error", (err) => {
        logger.error({ err }, "Redis data client error.");
      });

      await RedisClass.dataClient.connect();
      logger.info("Connected to Redis for data operations.");

      await RedisClass.getSubscribeClient();
    }

    return RedisClass.dataClient;
  }

  public static async getSubscribeClient(): Promise<RedisClientType> {
    if (!RedisClass.subscribeClient) {
      RedisClass.subscribeClient = createClient({ url: REDIS_URL });

      RedisClass.subscribeClient.on("error", (err) => {
        logger.error({ err }, "Redis subscribe client error.");
      });

      await RedisClass.subscribeClient.connect();
      logger.info("Connected to Redis for subscribing to events.");

      RedisClass.subscribeClient.pSubscribe(
        "__keyevent@0__:expired",
        async (key) => {
          if (key.startsWith(REDIS_KEY_PREFIX.room)) {
            const roomHash = key.slice(REDIS_KEY_PREFIX.room.length);
            await RedisClass.roomExpiredHandler?.(roomHash);
          }
        }
      );
    }

    return RedisClass.subscribeClient;
  }

  public static async disconnect(): Promise<void> {
    if (RedisClass.dataClient) {
      await RedisClass.dataClient.disconnect();
      RedisClass.dataClient = null;
      logger.info("Disconnected from Redis for data operations.");
    }

    if (RedisClass.subscribeClient) {
      await RedisClass.subscribeClient.disconnect();
      RedisClass.subscribeClient = null;
      logger.info("Disconnected from Redis for subscribing to events.");
    }
  }
}

export default RedisClass;
