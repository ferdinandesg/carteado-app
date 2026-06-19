import { test, expect } from "@playwright/test";

import { createRoom, markReady } from "./helpers/room";

test.describe("Fluxo de Criação de Sala", () => {
  test("deve navegar para a página de criação e criar uma sala de Carteado", async ({
    page,
  }) => {
    await createRoom(page, { name: "Sala teste" });
    await expect(page.getByText("Esperando jogadores...")).toBeVisible();
    await expect(page.getByText("Não pronto")).toBeVisible();
    await markReady(page);
    await expect(page.getByText("Pronto", { exact: true })).toBeVisible();
  });
});
