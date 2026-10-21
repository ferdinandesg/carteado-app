import { defineConfig, devices } from "@playwright/test";
const authFile = "playwright/.auth/user.json";
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./src/tests/e2e",
  retries: isCI ? 1 : 0,

  use: {
    baseURL: "http://localhost:3000",
    trace: "on-first-retry",
  },

  // No CI o workflow sobe backend e `next start`; localmente reaproveita o
  // `npm run dev` que já estiver rodando ou sobe um novo.
  webServer: [
    {
      command: "npm run dev -w backend",
      cwd: "..",
      url: "http://localhost:4000/api/v1/health",
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: isCI ? "npm run start" : "npm run dev",
      url: "http://localhost:3000",
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],

  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: authFile,
      },
      // Garante que o projeto 'setup' seja executado ANTES deste.
      dependencies: ["setup"],
    },
  ],
});
