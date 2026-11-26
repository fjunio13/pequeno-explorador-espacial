import { expect, test } from "@playwright/test";

const title = "Pequeno Explorador Espacial";
const orientationHint = "Vire o aparelho para jogar na horizontal.";

test("abre em paisagem e carrega os recursos a partir da entrada do jogo", async ({ page, baseURL }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));

  const files = [
    "src/ui/styles.css",
    "src/main.js",
    "src/core/game.js",
    "assets/images/astronauta-e-nave.webp",
  ];
  const downloads = files.map((path) => page.waitForResponse(new URL(path, baseURL).href));
  const [entry, ...resources] = await Promise.all([page.goto("./"), ...downloads]);

  expect(entry?.ok()).toBe(true);
  for (const [index, resource] of resources.entries()) expect(resource.ok(), files[index]).toBe(true);
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
  await page.locator(".intro-art").evaluate((image) => image.decode());
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

const button = (page, name) => page.getByRole("button", { name, exact: true });
const player = (page) => page.locator("#game-audio");
const prologue = (page) => page.locator('[data-screen="prologue"]');

test("Começar abre a história na aba e Ouvir repete o primeiro trecho", async ({ page }) => {
  await page.goto("./");
  await player(page).evaluate((audio) => { audio.defaultPlaybackRate = 2; });
  await button(page, "Começar").tap();
  await expect(prologue(page)).toBeVisible();
  expect(await page.evaluate(() => document.fullscreenElement)).toBeNull();
  await expect(player(page)).toHaveAttribute("src", /farol-quem-piscou\.mp3$/);
  await expect(player(page)).toHaveAttribute("src", /farol-escolher-planeta\.mp3$/);
  await expect(prologue(page).locator(".prologue-planets img").first()).toBeVisible();
  await button(page, "Ouvir").tap();
  await expect(player(page)).toHaveAttribute("src", /farol-quem-piscou\.mp3$/);

  await expect(page.getByRole("heading", { name: "Mapa espacial" })).toBeVisible({ timeout: 10000 });
  await expect(player(page)).not.toHaveAttribute("src", /mapa\.mp3$/);
  await button(page, "Ouvir").tap();
  await expect(player(page)).toHaveAttribute("src", /mapa\.mp3$/);
});

test("permite pular e rever a introdução mesmo se a tela cheia for recusada", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    Element.prototype.requestFullscreen = () => {
      window.fullscreenRequested = true;
      return Promise.reject(new DOMException("Tela cheia bloqueada", "NotAllowedError"));
    };
  });
  await page.goto("./");
  await button(page, "Tela cheia").tap();
  await button(page, "Começar").tap();
  await expect(prologue(page)).toBeVisible();
  await button(page, "Pular apresentação").tap();
  await expect(player(page)).toHaveAttribute("src", /mapa\.mp3$/);
  await button(page, "Rever o começo").tap();
  await expect(prologue(page)).toHaveAttribute("data-phase", "question");
  await button(page, "Pular apresentação").tap();
  await button(page, "Início").tap();
  await button(page, "Começar").tap();
  await expect(prologue(page)).toHaveCount(0);
  await expect(button(page, "Planeta das Descobertas")).toBeVisible();
  expect(await page.evaluate(() => window.fullscreenRequested)).toBe(true);
  expect(await page.evaluate(() => document.fullscreenElement)).toBeNull();
  expect(errors).toEqual([]);
});

test("a história chega ao mapa sem áudio e respeita movimento reduzido", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/farol-*.mp3", (route) => route.abort());
  await page.setViewportSize({ width: 568, height: 320 });
  await page.goto("./");
  await button(page, "Começar").tap();
  await expect(button(page, "Ouvir")).toHaveAccessibleDescription(/Áudio indisponível/);
  await expect(prologue(page)).toHaveAttribute("data-phase", "signal");
  await expect(prologue(page).locator(".prologue-signal > svg")).toHaveCSS("animation-name", "none");
  await expect(prologue(page).locator(".light-pattern")).toBeVisible();
  await expect(prologue(page).locator(".prologue-planets img").first()).toBeVisible();
  await expect(button(page, "Planeta das Estrelas")).toBeVisible();
});
