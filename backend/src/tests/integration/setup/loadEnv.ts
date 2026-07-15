import fs from "node:fs";
import path from "node:path";

const envFile = path.join(__dirname, ".integration-env.json");

if (fs.existsSync(envFile)) {
  const env = JSON.parse(fs.readFileSync(envFile, "utf-8")) as Record<
    string,
    string
  >;
  for (const [key, value] of Object.entries(env)) {
    if (!key.startsWith("__")) {
      process.env[key] = value;
    }
  }
}

process.env.JWT_SECRET_KEY ??= "integration-test-jwt-secret";
process.env.NODE_ENV = "test";
