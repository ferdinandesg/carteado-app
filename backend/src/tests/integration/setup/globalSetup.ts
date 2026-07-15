import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { MongoDBContainer } from "@testcontainers/mongodb";
import { GenericContainer, Wait } from "testcontainers";

const SETUP_DIR = __dirname;
const ENV_FILE = path.join(SETUP_DIR, ".integration-env.json");
const BACKEND_ROOT = path.resolve(SETUP_DIR, "../../../..");

type IntegrationEnv = {
  DATABASE_URL: string;
  REDIS_URL: string;
  JWT_SECRET_KEY: string;
  NODE_ENV: string;
};

type StartedContainers = {
  mongo?: MongoDBContainer;
  redis?: Awaited<ReturnType<GenericContainer["start"]>>;
};

const started: StartedContainers = {};

function writeEnvFile(env: IntegrationEnv): void {
  fs.writeFileSync(ENV_FILE, JSON.stringify(env, null, 2));
}

function buildLocalDevUrls(): IntegrationEnv {
  const user = process.env.MONGO_INITDB_ROOT_USERNAME ?? "root";
  const password = process.env.MONGO_INITDB_ROOT_PASSWORD ?? "password";
  const database = "carteado_integration";

  const databaseUrl =
    process.env.DATABASE_URL ??
    `mongodb://${user}:${password}@127.0.0.1:27017/${database}?authSource=admin&directConnection=true`;

  const redisUrl = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";

  return {
    DATABASE_URL: databaseUrl,
    REDIS_URL: redisUrl,
    JWT_SECRET_KEY: process.env.JWT_SECRET_KEY ?? "integration-test-jwt-secret",
    NODE_ENV: "test",
  };
}

async function startTestcontainers(): Promise<IntegrationEnv> {
  started.mongo = await new MongoDBContainer("mongo:7.0").start();
  started.redis = await new GenericContainer("redis:7-alpine")
    .withExposedPorts(6379)
    .withWaitStrategy(Wait.forLogMessage("Ready to accept connections"))
    .start();

  const host = started.mongo.getHost();
  const port = started.mongo.getMappedPort(27017);
  const databaseUrl = `mongodb://${host}:${port}/carteado_integration?directConnection=true`;
  const redisUrl = `redis://${started.redis.getHost()}:${started.redis.getMappedPort(6379)}`;

  return {
    DATABASE_URL: databaseUrl,
    REDIS_URL: redisUrl,
    JWT_SECRET_KEY: "integration-test-jwt-secret",
    NODE_ENV: "test",
  };
}

async function resolveIntegrationEnv(): Promise<IntegrationEnv> {
  if (process.env.DATABASE_URL && process.env.REDIS_URL) {
    return buildLocalDevUrls();
  }

  try {
    return await startTestcontainers();
  } catch (error) {
    console.warn(
      "Testcontainers unavailable; falling back to local dev:services URLs.",
      error
    );
    return buildLocalDevUrls();
  }
}

function pushPrismaSchema(databaseUrl: string): void {
  execSync("npx prisma db push --skip-generate", {
    cwd: BACKEND_ROOT,
    env: { ...process.env, DATABASE_URL: databaseUrl },
    stdio: "inherit",
  });
}

export default async function globalSetup(): Promise<() => Promise<void>> {
  const env = await resolveIntegrationEnv();
  writeEnvFile(env);
  pushPrismaSchema(env.DATABASE_URL);

  return async () => {
    await started.redis?.stop();
    await started.mongo?.stop();
    if (fs.existsSync(ENV_FILE)) {
      fs.unlinkSync(ENV_FILE);
    }
  };
}
