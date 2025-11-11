import { defineConfig, devices } from "@playwright/test";
const authFile = "playwright/.auth/user.json";
export default defineConfig({
  testDir: "./src/tests/e2e",

  // Adicione esta seção 'use'
  use: {
    // Defina a URL base do seu servidor de desenvolvimento.
    // O padrão do Next.js é 3000, mas ajuste se o seu for diferente.
    baseURL: "http://localhost:3000",

    // Outras opções globais podem ir aqui
    trace: "on-first-retry",
  },

  // ...resto da sua configuração, como 'projects'...
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
