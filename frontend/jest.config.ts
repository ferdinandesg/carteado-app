import nextJest from "next/jest.js";
import { pathsToModuleNameMapper } from "ts-jest";
import tsconfig from "./tsconfig.json";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
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
  moduleNameMapper: pathsToModuleNameMapper(tsconfig.compilerOptions.paths, {
    prefix: "<rootDir>/",
  }),

  // Stop running tests after `n` failures
  // bail: 1, // Uncomment if you want tests to stop on the first failure

  // The root directory that Jest should scan for tests and modules within
  rootDir: ".", // Optional: `.` is the default

  // A list of paths to directories that Jest should use to search for files in
  // roots: ['<rootDir>'], // Optional: Defaults to rootDir
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(customJestConfig);
