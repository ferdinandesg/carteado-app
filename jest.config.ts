import { Config } from "@jest/types";

const config: Config.InitialOptions = {
  projects: ["<rootDir>/shared", "<rootDir>/backend", "<rootDir>/frontend"],
  collectCoverageFrom: [
    "shared/**/*.ts",
    "!shared/dist/**",
    "!shared/jest.config.ts",
    "backend/src/**/*.ts",
    "!backend/src/index.ts",
    "!backend/src/tests/**",
    "!backend/src/scripts/**",
    "!backend/src/@types/**",
    "frontend/src/**/*.{ts,tsx}",
    "!frontend/src/tests/**",
    "!frontend/src/app/**/layout.tsx",
    "!**/*.test.{ts,tsx}",
    "!**/*.d.ts",
    "!**/node_modules/**",
  ],
  coverageReporters: ["text-summary", "json-summary", "lcov"],
  // Ratchet: ~2 pontos abaixo do baseline medido. Só sobe; nunca baixar para passar o CI.
  // (Fase 2: o motor saiu de backend/src para shared/engine; os números migraram juntos.)
  coverageThreshold: {
    global: {},
    "./shared/": { statements: 90, branches: 79, functions: 88, lines: 93 },
    "./backend/src/": {
      statements: 66,
      branches: 48,
      functions: 57,
      lines: 66,
    },
    "./frontend/src/": {
      statements: 59,
      branches: 55,
      functions: 53,
      lines: 61,
    },
  },
};

export default config;
