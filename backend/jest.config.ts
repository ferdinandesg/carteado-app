import { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: "./",
  setupFiles: ["<rootDir>/jest.setup.ts"],
  moduleDirectories: ["node_modules", "src"],
  moduleNameMapper: {
    "^prisma$": "<rootDir>/src/prisma",
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@shared/(.*)$": "<rootDir>/../shared/$1",
    "^shared/(.*)$": "<rootDir>/../shared/$1",
  },
  testMatch: ["<rootDir>/src/**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/"],
};

export default config;
