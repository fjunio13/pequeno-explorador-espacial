import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

const button = (page, name) => page.getByRole("button", { name, exact: true });
const screen = (page, name) => page.locator('[data-screen="' + name + '"]');
const room = (page) => screen(page, "energy");
const player = (page) => page.locator("#game-audio");
const add = (page, value) => room(page).locator('[data-action="add"][data-value="' + value + '"]');
const remove = (page, value) => room(page).locator('[data-action="remove"][data-value="' + value + '"]');
const gaps = (page) => room(page).locator(".energy-cell[data-needed]");

function cellGlow(cell) {
  return cell.evaluate((element) => {
    const style = getComputedStyle(element, "::after");
    return { animation: style.animationName, shadow: style.boxShadow };
  });
}

async function openMap(page, rate = 4) {
  await page.goto("./");
  await player(page).evaluate((audio, rate) => { audio.defaultPlaybackRate = rate; }, rate);
  await button(page, "Começar").tap();
}

async function firstWorkshop(page) {
  await button(page, "Oficina de Energia").tap();
  await expect(screen(page, "energy-arrival")).toBeVisible();
  await button(page, "Pular apresentação").tap();
}

async function expectFit(page) {
  const sizes = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
    innerWidth,
    innerHeight,
    buttonSize: Math.min(...Array.from(document.querySelectorAll("main button:not(:disabled)"))
      .filter((button) => button.getClientRects().length)
      .map((button) => Math.min(button.offsetWidth, button.offsetHeight))),
  }));
  expect(sizes.width).toBeLessThanOrEqual(sizes.innerWidth + 1);
  expect(sizes.height).toBeLessThanOrEqual(sizes.innerHeight + 1);
  expect(sizes.buttonSize).toBeGreaterThanOrEqual(48);
}

async function finishWorkshop(page, { target, modules, fill, choice, checkFit = false }) {
  await expect(room(page)).toHaveAttribute("data-mode", "build");
  await expect(room(page).locator("[data-target]")).toHaveText(String(target));
  if (checkFit) await expectFit(page);
  for (const value of modules) await add(page, value).tap();
  await expect(room(page)).toHaveAttribute("data-mode", "complete");
  if (checkFit) await expectFit(page);
  await add(page, fill).tap();
  await expect(room(page)).toHaveAttribute("data-mode", "compare");
  if (checkFit) await expectFit(page);
  await button(page, "Carga da " + choice).tap();
  await expect(screen(page, "energy-complete")).toBeVisible();
  if (checkFit) await expectFit(page);
}

test("reproduz a apresentação, aceita correções e orienta as três modalidades", async ({ page, baseURL }) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400 || !response.url().startsWith(baseURL)) errors.push(response.url());
  });
  await openMap(page, 2);
  await expect(screen(page, "map").locator(".planet-grid .planet-button")).toHaveCount(3);
  await button(page, "Oficina de Energia").tap();
  await expect(screen(page, "energy-arrival")).toBeVisible();
  await screen(page, "energy-arrival").locator("img").evaluate((img) => img.decode());
  await expect(player(page)).toHaveAttribute("src", /oficina-chegada\.mp3$/);
  await expect.poll(() => player(page).evaluate((audio) => audio.currentTime)).toBeGreaterThan(0.55);
  await button(page, "Ouvir").tap();
  await expect.poll(() => player(page).evaluate((audio) => audio.currentTime)).toBeLessThan(0.49);
  await button(page, "Pular apresentação").tap();

  await expect(room(page).locator("[data-target]")).toHaveText("7");
  await expect(add(page, 5).locator(".energy-piece i")).toHaveCount(5);
  await add(page, 5).tap();
  await add(page, 5).tap();
  await expect(room(page).locator("[data-total]")).toHaveText("10");
  await expect(room(page).locator("[data-note]")).toContainText("retirar");
  await button(page, "Ajuda").tap();
  await button(page, "Ajuda").tap();
  await expect(remove(page, 5)).toHaveAttribute("data-guide", "");
  await expect(room(page)).toHaveAttribute("data-solved", "false");
  await remove(page, 5).tap();
  await expect(add(page, 1)).toHaveAttribute("data-guide", "");
  await add(page, 1).tap();
  await add(page, 1).tap();
  await expect(room(page)).toHaveAttribute("data-solved", "true");
  await expect(player(page)).toHaveAttribute("src", /oficina-carga-pronta\.mp3$/);
  await remove(page, 1).tap();
  await expect(room(page).locator("[data-total]")).toHaveText("6");
  await expect(room(page)).toHaveAttribute("data-solved", "false");
  await page.waitForTimeout(1450);
  await expect(room(page)).toHaveAttribute("data-mode", "build");
  await add(page, 1).tap();

  await expect(room(page)).toHaveAttribute("data-mode", "complete");
  await expect(room(page).locator(".energy-cell[data-fixed]")).toHaveCount(7);
  await expect(gaps(page)).toHaveCount(3);
  const gap = await cellGlow(gaps(page).first());
  expect(gap.animation).toBe("energy-gap-glow");
  expect((await cellGlow(room(page).locator(".energy-cell[data-lit]").first())).animation).toBe("none");
  await button(page, "Ajuda").tap();
  expect((await cellGlow(gaps(page).first())).shadow).not.toBe(gap.shadow);
  await expect(add(page, 3)).not.toHaveAttribute("data-guide");
  await add(page, 1).tap();
  await expect(gaps(page)).toHaveCount(2);
  await remove(page, 1).tap();
  await expect(gaps(page)).toHaveCount(3);
  await add(page, 5).tap();
  await expect(room(page).locator("[data-total]")).toHaveText("7");
  await add(page, 3).tap();
  await expect(room(page).locator("[data-total]")).toHaveText("10");
  await expect(gaps(page)).toHaveCount(0);
  await expect(room(page)).toHaveAttribute("data-mode", "compare");

  await expect(room(page).locator("[data-comparison-number]:visible")).toHaveCount(0);
  await button(page, "Carga da esquerda").tap();
  await button(page, "Ajuda").tap();
  await expect(room(page).locator(".energy-cell[data-difference]")).toHaveCount(6);
  await button(page, "Ajuda").tap();
  await expect(button(page, "Carga da direita")).toHaveAttribute("data-guide", "");
  await expect(room(page)).toHaveAttribute("data-solved", "false");
  await button(page, "Carga da direita").tap();
  await expect(screen(page, "energy-complete")).toBeVisible();
  await expect(player(page)).toHaveAttribute("src", /oficina-pronta\.mp3$/);
  await expect.poll(() => player(page).evaluate((audio) => audio.currentTime)).toBeGreaterThan(0);
  await button(page, "Voltar ao mapa").tap();
  await expect(screen(page, "map").locator(".planet-clue")).toHaveCount(0);
  await expect(button(page, "Responder ao sinal")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("repete o mesmo conjunto de desafios e progride até os painéis de vinte", async ({ page }) => {
  test.slow();
  await page.setViewportSize({ width: 568, height: 320 });
  await openMap(page);
  await firstWorkshop(page);
  await finishWorkshop(page, { target: 7, modules: [5, 1, 1], fill: 3, choice: "direita", checkFit: true });

  await button(page, "Repetir desafios").tap();
  await expect(room(page).locator("[data-target]")).toHaveText("7");
  await expect(room(page).locator("[data-total]")).toHaveText("0");
  await button(page, "Voltar ao mapa").tap();
  await button(page, "Oficina de Energia").tap();
  await finishWorkshop(page, { target: 13, modules: [10, 1, 1, 1], fill: 2, choice: "esquerda", checkFit: true });
  await button(page, "Mais desafios").tap();
  await expect(add(page, 10).locator(".energy-piece i")).toHaveCount(10);
  await expect(room(page).locator(".energy-goal .energy-frame")).toHaveCount(2);
  await finishWorkshop(page, { target: 18, modules: [10, 5, 1, 1, 1], fill: 3, choice: "direita", checkFit: true });

  await button(page, "Mais desafios").tap();
  await expect(room(page).locator("[data-target]")).toHaveText("20");
  await add(page, 10).tap();
  await add(page, 10).tap();
  await expect(room(page).locator("[data-live] .energy-frame[data-full]")).toHaveCount(2);
});

test("sair durante o retorno de áudio cancela o avanço para o próximo desafio", async ({ page }) => {
  await openMap(page, 2);
  await firstWorkshop(page);
  await add(page, 5).tap();
  await add(page, 1).tap();
  await add(page, 1).tap();
  await expect(room(page)).toHaveAttribute("data-solved", "true");
  await expect(player(page)).toHaveAttribute("src", /oficina-carga-pronta\.mp3$/);
  await button(page, "Ouvir").tap();
  await button(page, "Voltar ao mapa").tap();

  await button(page, "Planeta das Estrelas").tap();
  await button(page, "Pular apresentação").tap();
  await expect(player(page)).toHaveAttribute("src", /pedido-1\.mp3$/);
  await page.waitForTimeout(1900);
  await expect(screen(page, "mission")).toHaveAttribute("data-planet", "stars");
  await button(page, "Voltar ao mapa").tap();
  await button(page, "Oficina de Energia").tap();
  await expect(room(page)).toHaveAttribute("data-mode", "build");
  await expect(room(page).locator("[data-target]")).toHaveText("6");
});

test("a oficina mantém controles grandes em três dimensões Android horizontais", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [width, height] of [[568, 320], [667, 375], [780, 360]]) {
    await page.evaluate(() => document.fullscreenElement && document.exitFullscreen());
    await page.setViewportSize({ width, height });
    await openMap(page);
    await expectFit(page);
    await button(page, "Oficina de Energia").tap();
    await expectFit(page);
    await button(page, "Pular apresentação").tap();
    await expectFit(page);
    await add(page, 5).tap();
    await add(page, 1).tap();
    await add(page, 1).tap();
    await expect(room(page)).toHaveAttribute("data-mode", "complete");
    await expectFit(page);
    await expect(gaps(page)).toHaveCount(3);
    const glow = await cellGlow(gaps(page).first());
    expect(glow.animation).toBe("none");
    expect(glow.shadow).toContain("inset");
  }
});

test("o destaque do complemento é removido ao sair da oficina", async ({ page }) => {
  await openMap(page);
  await firstWorkshop(page);
  for (const value of [5, 1, 1]) await add(page, value).tap();
  await expect(room(page)).toHaveAttribute("data-mode", "complete");
  const activeGlow = () => page.evaluate(() => document.getAnimations().some((animation) =>
    animation.animationName === "energy-gap-glow"));
  expect(await activeGlow()).toBe(true);
  await button(page, "Voltar ao mapa").tap();
  await expect(screen(page, "map")).toBeVisible();
  expect(await activeGlow()).toBe(false);
});
