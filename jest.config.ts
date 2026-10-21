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
  coverageThreshold: {
    global: {},
    "./shared/": { statements: 75, branches: 72, functions: 74, lines: 76 },
    "./backend/src/": {
      statements: 73,
      branches: 60,
      functions: 68,
      lines: 74,
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
