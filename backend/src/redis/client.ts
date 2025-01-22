import { createClient, RedisClientType } from "redis";

class RedisClass {
  private static instance: RedisClientType | null = null;

  private constructor() {}

  public static async getInstance(): Promise<RedisClientType> {
    if (!RedisClass.instance) {
      RedisClass.instance = createClient({
        url: process.env.REDIS_URL || "redis://localhost:6379",
      });

      RedisClass.instance.on("error", (err) => {
        console.error("Redis error:", err);
      });

      await RedisClass.instance.connect();
      console.log("Connected to Redis");
    }

    return RedisClass.instance;
  }

  public static async disconnect(): Promise<void> {
    if (RedisClass.instance) {
      await RedisClass.instance.disconnect();
      RedisClass.instance = null;
      console.log("Disconnected from Redis");
    }
  }
}

export default RedisClass;
