const tsconfig = require("./tsconfig.json");
import { pathsToModuleNameMapper } from "ts-jest";

import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  dir: "./",
});

const config: Config = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "coverage",
  rootDir: "./",
  coverageProvider: "v8",
  moduleNameMapper: pathsToModuleNameMapper(
    tsconfig.compilerOptions.paths || {},
    {
      prefix: "<rootDir>/",
    }
  ),
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  testEnvironment: "jsdom",
  testPathIgnorePatterns: ["/node_modules/", "/.next/"],

  transform: {
    "^.+\\.(ts|tsx)$": "ts-jest",
  },
};
export default createJestConfig(config);
