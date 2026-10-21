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

// Só alerta: falhar aqui derrubaria a produção se o secret atual for curto.
const RECOMMENDED_JWT_SECRET_LENGTH = 32;

let cached: Env | null = null;

export function loadEnv(): Env {
  if (cached) return cached;
  const parsed = EnvSchema.safeParse(process.env);
  if (!parsed.success) {
    if (process.env.NODE_ENV !== "production") {
      logger.error(
        { fieldErrors: parsed.error.flatten().fieldErrors },
        "Invalid environment variables."
      );
    }
    throw new Error("Environment validation failed");
  }
  cached = parsed.data;
  if (
    cached.NODE_ENV === "production" &&
    cached.JWT_SECRET_KEY.length < RECOMMENDED_JWT_SECRET_LENGTH
  ) {
    logger.warn(
      { length: cached.JWT_SECRET_KEY.length },
      `JWT_SECRET_KEY is shorter than ${RECOMMENDED_JWT_SECRET_LENGTH} chars; rotate it to a longer random value.`
    );
  }
  return cached;
}

export const env = loadEnv();
