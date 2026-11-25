import { expect, test } from "@playwright/test";

const title = "Pequeno Explorador Espacial";
const orientationHint = "Vire o aparelho para jogar na horizontal.";

test("abre em paisagem e carrega os recursos no subdiretório do jogo", async ({ page, baseURL }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  const [stylesheet, script, entry] = await Promise.all([
    page.waitForResponse(new URL("src/ui/styles.css", baseURL).href),
    page.waitForResponse(new URL("src/main.js", baseURL).href),
    page.goto("./"),
  ]);

  expect(entry?.ok()).toBe(true);
  expect(stylesheet.ok()).toBe(true);
  expect(script.ok()).toBe(true);
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(page.getByText(orientationHint)).toBeHidden();
  expect(errors).toEqual([]);
});

test("orienta a girar o celular e oculta a mensagem ao voltar à paisagem", async ({ page, viewport }) => {
  await page.setViewportSize({ width: viewport.height, height: viewport.width });
  await page.goto("./");

  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await expect(page.getByText(orientationHint)).toBeVisible();

  await page.setViewportSize(viewport);
  await expect(page.getByText(orientationHint)).toBeHidden();
});
