import { test as setup, expect } from "@playwright/test";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  // Navega para a página de login do NextAuth
  await page.goto("/");
  await page.getByRole("button", { name: "Entrar como convidado" }).click();
  await page.getByTestId("guest-name-input").click();
  await page.getByTestId("guest-name-input").fill("automacao");
  await page.getByRole("img", { name: "Avatar" }).nth(1).click();
  await page.getByRole("img", { name: "-bit Blue" }).click();
  await page.getByRole("button", { name: "Jogar" }).click();

  // Espera pela navegação para a página do menu e verifica
  await expect(page.getByRole("img", { name: "user.name" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "automacao" })).toBeVisible();

  // Salva o estado de autenticação (cookies, local storage) no arquivo 'authFile'
  // Este passo é crucial!
  await page.context().storageState({ path: authFile });
});
