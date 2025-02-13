import { createClient, RedisClientType } from "redis";
import { expireRoomByHash } from "@services/room.service"; // Sua função para expirar a sala no banco

class RedisClass {
  private static dataClient: RedisClientType | null = null;
  private static subscribeClient: RedisClientType | null = null;

  private constructor() {}

  public static async getDataClient(): Promise<RedisClientType> {
    if (!RedisClass.dataClient) {
      RedisClass.dataClient = createClient({
        url: process.env.REDIS_URL || "redis://localhost:6379",
      });

      RedisClass.dataClient.on("error", (err) => {
        console.error("Redis error:", err);
      });

      await RedisClass.dataClient.connect();
      console.log("Connected to Redis for data operations");

      await RedisClass.getSubscribeClient();
    }

    return RedisClass.dataClient;
  }

  public static async getSubscribeClient(): Promise<RedisClientType> {
    if (!RedisClass.subscribeClient) {
      RedisClass.subscribeClient = createClient({
        url: process.env.REDIS_URL || "redis://localhost:6379",
      });

      RedisClass.subscribeClient.on("error", (err) => {
        console.error("Redis error:", err);
      });

      await RedisClass.subscribeClient.connect();
      console.log("Connected to Redis for subscribing to events");

      RedisClass.subscribeClient.pSubscribe(
        "__keyevent@0__:expired",
        async (channel) => {
          if (channel.startsWith("room:")) {
            const roomHash = channel.split(":")[1];
            await expireRoomByHash(roomHash);
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
      console.log("Disconnected from Redis for data operations");
    }

    if (RedisClass.subscribeClient) {
      await RedisClass.subscribeClient.disconnect();
      RedisClass.subscribeClient = null;
      console.log("Disconnected from Redis for subscribing to events");
    }
  }
}

export default RedisClass;
