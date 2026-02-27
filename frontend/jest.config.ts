import path from "node:path";
import nextJest from "next/jest.js";
import { pathsToModuleNameMapper } from "ts-jest";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const tsconfig = require("./tsconfig.json") as {
  compilerOptions: { paths?: Record<string, string[]> };
};

const createJestConfig = nextJest({
  dir: path.resolve(__dirname),
});

// Add any custom config to be passed to Jest
const customJestConfig = {
  // Add more setup options before each test is run
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],

  // Use jsdom as the test environment for browser-like environment
  testEnvironment: "jsdom",

  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  moduleNameMapper: pathsToModuleNameMapper(
    tsconfig.compilerOptions?.paths ?? {},
    {
      prefix: "<rootDir>/",
    }
  ),

  // Stop running tests after `n` failures
  // bail: 1, // Uncomment if you want tests to stop on the first failure

  // The root directory that Jest should scan for tests and modules within
  rootDir: ".",

  // E2E tests use Playwright, not Jest
  testPathIgnorePatterns: ["/node_modules/", "/tests/e2e/", "e2e\\.test\\.ts"],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);
