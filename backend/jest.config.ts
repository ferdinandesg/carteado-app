import { Config } from "@jest/types";

const config: Config.InitialOptions = {
  testEnvironment: "node",
  // rootDir na raiz do monorepo: o instrumentador de cobertura ignora arquivos
  // fora do rootDir, e o motor (`shared/engine`) é testado a partir daqui.
  rootDir: "..",
  roots: ["<rootDir>/backend"],
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      { tsconfig: "<rootDir>/backend/tsconfig.json" },
    ],
  },
  setupFiles: ["<rootDir>/backend/jest.setup.ts"],
  moduleDirectories: ["node_modules", "src"],
  moduleNameMapper: {
    "^prisma$": "<rootDir>/backend/src/prisma",
    "^@/(.*)$": "<rootDir>/backend/src/$1",
    "^@shared/(.*)$": "<rootDir>/shared/$1",
    "^shared/(.*)$": "<rootDir>/shared/$1",
  },
  testMatch: ["<rootDir>/backend/src/**/*.test.ts"],
  testPathIgnorePatterns: ["/node_modules/", "/tests/integration/"],
};

export default config;
