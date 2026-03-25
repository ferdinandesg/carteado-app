import type { Config } from "@jest/types";

const config: Config.InitialOptions = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  testMatch: ["<rootDir>/**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/dist/"],
  moduleNameMapper: {
    "^shared$": "<rootDir>/types/index.ts",
    "^shared/(.*)$": "<rootDir>/$1",
  },
};

export default config;
