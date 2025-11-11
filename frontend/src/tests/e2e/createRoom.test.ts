import { test, expect } from "@playwright/test";

test.describe("Fluxo de Criação de Sala", () => {
  test("deve navegar para a página de criação e criar uma sala de Carteado", async ({
    page,
  }) => {
    await page.goto("/menu");
    await page.getByRole("button", { name: "Criar sala" }).click();
    await page.getByTestId("room-name-input").click();
    await page.getByTestId("room-name-input").fill("Sala teste");
    await page.getByTestId("room-size-button-2").click();
    await page.getByTestId("room-rule-button-CarteadoGameRules").click();
    await page.getByTestId("create-room-button").click();
    await expect(page.getByText("Esperando jogadores...")).toBeVisible();
    await expect(page.getByText("Não pronto")).toBeVisible();
    await page.getByRole("button", { name: "Estou pronto" }).click();
    await expect(page.getByText("Pronto", { exact: true })).toBeVisible();
    // Verifica o redirecionamento e o conteúdo da nova sala
    await expect(page).toHaveURL(/\/room\/\w+/); // Expressão regular para a URL da sala
  });
});
