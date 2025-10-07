import { z } from "zod";

// Define schema for environment variables
const EnvSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().positive().default(3001),
  REDIS_URL: z.string().url().optional(),
  JWT_SECRET: z.string().min(4, "JWT_SECRET must be at least 4 chars"),
  DATABASE_URL: z.string().optional(),
});

export type Env = z.infer<typeof EnvSchema>;

let cached: Env | null = null;

export function loadEnv(): Env {
  if (cached) return cached;
  const parsed = EnvSchema.safeParse(process.env);
  console.log({
    parsed,
    env: process.env,
  });
  if (!parsed.success) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error(
        "❌ Invalid environment variables:",
        parsed.error.flatten().fieldErrors
      );
    }
    throw new Error("Environment validation failed");
  }
  cached = parsed.data;
  return cached;
}

export const env = loadEnv();
