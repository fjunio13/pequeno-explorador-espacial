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

test("o toque em Começar abre o mapa narrado em tela cheia", async ({ page }) => {
  await page.goto("./");
  expect(await page.evaluate(() => document.fullscreenElement)).toBeNull();
  await page.getByRole("button", { name: "Começar" }).tap();

  const map = page.getByRole("heading", { name: "Mapa espacial" });
  const audio = page.locator("#game-audio");
  await expect(map).toBeVisible();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement === document.documentElement)).toBe(true);
  await expect(audio).toHaveAttribute("src", /mapa\.mp3$/);
  await expect.poll(() => audio.evaluate((player) => player.currentTime)).toBeGreaterThan(0);

  await page.evaluate(() => document.exitFullscreen());
  expect(await page.evaluate(() => document.fullscreenElement)).toBeNull();
  await expect(map).toBeVisible();
});

test("o mapa abre com narração quando o navegador recusa a tela cheia", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = () => {
      window.fullscreenRequested = true;
      return Promise.reject(new DOMException("Tela cheia bloqueada", "NotAllowedError"));
    };
  });
  await page.goto("./");
  await page.getByRole("button", { name: "Começar" }).tap();

  await expect(page.getByRole("heading", { name: "Mapa espacial" })).toBeVisible();
  const audio = page.locator("#game-audio");
  await expect(audio).toHaveAttribute("src", /mapa\.mp3$/);
  await expect.poll(() => audio.evaluate((player) => player.currentTime)).toBeGreaterThan(0);
  expect(await page.evaluate(() => window.fullscreenRequested)).toBe(true);
  expect(await page.evaluate(() => document.fullscreenElement)).toBeNull();
  expect(errors).toEqual([]);
});
