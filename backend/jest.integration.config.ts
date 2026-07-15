import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "./",
  displayName: "backend-integration",
  setupFiles: ["<rootDir>/src/tests/integration/setup/loadEnv.ts"],
  globalSetup: "<rootDir>/src/tests/integration/setup/globalSetup.ts",
  moduleDirectories: ["node_modules", "src"],
  moduleNameMapper: {
    "^prisma$": "<rootDir>/src/prisma",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@shared/(.*)$": "<rootDir>/../shared/$1",
    "^shared/(.*)$": "<rootDir>/../shared/$1",
  },
  testMatch: ["<rootDir>/src/tests/integration/**/*.integration.test.ts"],
  testPathIgnorePatterns: ["/node_modules/"],
  testTimeout: 60_000,
};

export default config;
