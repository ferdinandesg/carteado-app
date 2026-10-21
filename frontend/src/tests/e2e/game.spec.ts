import { test, expect } from "@playwright/test";

import {
  createRoom,
  expectGameVisible,
  expectLobbyVisible,
  loginAsGuest,
  markReady,
  startGame,
} from "./helpers/room";

test.describe("Fluxo de sala e lobby", () => {
  test("owner cria sala Carteado e marca pronto", async ({ page }) => {
    await createRoom(page, { name: "Sala E2E Carteado" });
    await expectLobbyVisible(page);
    await markReady(page);
    await expect(page.getByText("Pronto!", { exact: true })).toBeVisible();
  });
});

test.describe("Fluxo de partida", () => {
  test("inicia partida Carteado com 2 jogadores", async ({ page, browser }) => {
    await createRoom(page, { name: "Sala E2E Partida" });
    await expectLobbyVisible(page);
    const roomUrl = page.url();

    // Contexto novo = cookie de sessão separado, ou seja, outro usuário.
    const guestContext = await browser.newContext({ storageState: undefined });
    const guest = await guestContext.newPage();
    try {
      await loginAsGuest(guest, "convidado2");
      await guest.goto(roomUrl);
      await expectLobbyVisible(guest);

      await markReady(guest);
      await markReady(page);
      await startGame(page);

      await expectGameVisible(page);
      await expectGameVisible(guest);
    } finally {
      await guestContext.close();
    }
  });
});
