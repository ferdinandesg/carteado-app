import { expect, Page } from "@playwright/test";

import { testIds } from "@/tests/testIds";

type CreateRoomOptions = {
  name?: string;
  size?: number;
  rule?: "CarteadoGameRules" | "TrucoGameRules";
};

export async function createRoom(
  page: Page,
  {
    name = "Sala E2E",
    size = 2,
    rule = "CarteadoGameRules",
  }: CreateRoomOptions = {}
) {
  await page.goto("/menu");
  await page.getByRole("button", { name: "Criar sala" }).click();
  await page.getByTestId("room-name-input").fill(name);
  await page.getByTestId(`room-size-button-${size}`).click();
  await page.getByTestId(`room-rule-button-${rule}`).click();
  await page.getByTestId("create-room-button").click();
  await expect(page).toHaveURL(/\/room\/\w+/);
}

/** Mesmo fluxo do `auth.setup.ts`, para contextos extras (segundo jogador). */
export async function loginAsGuest(page: Page, name: string) {
  await page.goto("/");
  await page.getByRole("button", { name: "Entrar como convidado" }).click();
  await page.getByTestId("guest-name-input").fill(name);
  await page.getByRole("img", { name: "Avatar" }).nth(1).click();
  await page.getByRole("img", { name: "-bit Blue" }).click();
  await page.getByRole("button", { name: "Jogar" }).click();
  await expect(page.getByRole("heading", { name })).toBeVisible();
}

export async function markReady(page: Page) {
  await page.getByTestId(testIds.lobby.ready).click();
}

export async function startGame(page: Page) {
  await page.getByTestId(testIds.lobby.startGame).click();
}

export async function expectLobbyVisible(page: Page) {
  await expect(page.getByTestId(testIds.room.stage)).toBeVisible();
  await expect(page.getByTestId(testIds.lobby.ready)).toBeVisible();
}

export async function expectGameVisible(page: Page) {
  await expect(page.getByTestId(testIds.game.root)).toBeVisible();
}
