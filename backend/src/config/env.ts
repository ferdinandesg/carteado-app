import { logger } from "@/utils/logger";
import { z } from "zod";

// Define schema for environment variables
const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  REDIS_URL: z.string().optional(),
  DATABASE_URL: z.string().optional(),
  JWT_SECRET_KEY: z.string().min(4, "JWT_SECRET_KEY must be at least 4 chars"),
});

export type Env = z.infer<typeof EnvSchema>;

let cached: Env | null = null;

export function loadEnv(): Env {
  if (cached) return cached;
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    if (process.env.NODE_ENV !== "production") {
      logger.error(
        parsed.error.flatten().fieldErrors,
        "❌ Invalid environment variables:"
      );
    }
    throw new Error("Environment validation failed");
  }
  cached = parsed.data;
  return cached;
}

export const env = loadEnv();
