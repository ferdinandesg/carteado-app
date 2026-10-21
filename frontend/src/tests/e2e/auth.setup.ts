import { test as setup } from "@playwright/test";

import { loginAsGuest } from "./helpers/room";

const authFile = "playwright/.auth/user.json";

setup("authenticate", async ({ page }) => {
  await loginAsGuest(page, "automacao");

  // Salva o estado de autenticação (cookies, local storage) no arquivo 'authFile'
  await page.context().storageState({ path: authFile });
});
