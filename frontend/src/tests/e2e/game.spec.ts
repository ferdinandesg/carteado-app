import { test, expect } from "@playwright/test";

import { testIds } from "@/tests/testIds";

import { createRoom, expectLobbyVisible, markReady } from "./helpers/room";

test.describe("Fluxo de sala e lobby", () => {
  test("owner cria sala Carteado e marca pronto", async ({ page }) => {
    await createRoom(page, { name: "Sala E2E Carteado" });
    await expectLobbyVisible(page);
    await markReady(page);
    await expect(page.getByText("Pronto", { exact: true })).toBeVisible();
  });
});

test.describe("Fluxo de partida", () => {
  test.skip("inicia partida Carteado com 2 jogadores", async ({ page }) => {
    // Requer segundo browser/context autenticado entrando na mesma sala.
    await createRoom(page);
    await markReady(page);
    await page.getByTestId(testIds.lobby.startGame).click();
    await expect(page.getByTestId(testIds.game.root)).toBeVisible();
  });
});
