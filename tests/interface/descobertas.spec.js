import { expect, test } from "@playwright/test";
import { initialDiscoveryRoute, openDiscoveryRound, solveDiscoveryRound } from "./descobertas-rodadas.js";

const button = (page, name) => page.getByRole("button", { name, exact: true });
const mission = (page) => page.locator(".discovery-screen");
const player = (page) => page.locator("#game-audio");
const creatures = (page) => mission(page).locator(".glow-creature:not([hidden])");
const hiding = (page) => mission(page).locator("[data-glint]");

function creatureGlow(creature) {
  return creature.evaluate((element) => {
    const style = getComputedStyle(element, "::before");
    return { animation: style.animationName, background: style.backgroundImage };
  });
}

async function openMission(page, playbackRate = 1) {
  await page.goto("./");
  await player(page).evaluate((audio, rate) => { audio.defaultPlaybackRate = rate; }, playbackRate);
  await button(page, "Começar").tap();
  await button(page, "Pular apresentação").tap();
  await button(page, "Planeta das Descobertas").tap();
  await button(page, "Pular apresentação").tap();
}

test("explora o vale, acrescenta uma criatura e corrige a quantidade com ajuda", async ({ page }) => {
  await openMission(page, 3);
  await expect(creatures(page)).toHaveCount(1);
  const restingGlow = await creatureGlow(creatures(page).first());
  expect(restingGlow.animation).toBe("creature-glow");
  await button(page, "Ajuda").tap();
  await expect(mission(page).locator(".discovery-hollows")).toHaveAttribute("data-help-focus", "");
  await expect(hiding(page)).not.toHaveAttribute("data-guide");
  await button(page, "Flor do vale").tap();
  await expect(page.getByText("Veja onde o brilho aparece.")).toBeVisible();
  await expect(hiding(page)).toHaveAttribute("data-bright", "");
  await expect(hiding(page)).not.toHaveAttribute("data-guide");
  await button(page, "Ajuda").tap();
  await expect(hiding(page)).toHaveAttribute("data-guide", "");
  await expect(page.getByText("Toque no brilho dourado.")).toBeVisible();
  await expect(creatures(page)).toHaveCount(1);

  const firstX = (await button(page, "Luzinha 1").boundingBox()).x;
  await hiding(page).tap();
  await expect(mission(page)).toHaveAttribute("data-phase", "count");
  await expect(creatures(page)).toHaveCount(2);
  expect((await button(page, "Luzinha 1").boundingBox()).x).toBeCloseTo(firstX);
  await expect(button(page, "Luzinha 2")).toHaveAttribute("data-new", "");
  await button(page, "Ajuda").tap();
  await expect(mission(page).locator(".discovery-group")).toHaveAttribute("data-help-focus", "");
  await expect(button(page, "2")).not.toHaveAttribute("data-guide");
  await button(page, "1").tap();
  await expect(button(page, "Luzinha 1")).toHaveAttribute("data-count-hint", "");
  expect((await creatureGlow(creatures(page).first())).background).not.toBe(restingGlow.background);
  await button(page, "Luzinha 1").tap();
  await expect(button(page, "Luzinha 1")).toHaveAttribute("data-counted", "");
  await expect(button(page, "Luzinha 2")).toHaveAttribute("data-count-hint", "");
  await expect(button(page, "2")).not.toHaveAttribute("data-guide");
  await button(page, "3").tap();
  await expect(button(page, "2")).toHaveAttribute("data-guide", "");
  await expect(creatures(page)).toHaveCount(2);
  await expect(button(page, "2")).toBeEnabled();
  await button(page, "Ouvir").tap();
  await expect(player(page)).toHaveAttribute("src", /descobertas-numero\.mp3$/);

  await button(page, "2").tap();
  await expect(mission(page)).toHaveAttribute("data-phase", "lit");
  await expect(mission(page).locator(".light-pattern")).toBeVisible();
  expect((await creatureGlow(creatures(page).first())).animation).toBe("none");
  await expect(creatures(page).first().locator("img")).toHaveCSS("animation-name", "light-reply");
  await expect(button(page, "Conferir")).toHaveCount(0);
  await expect(button(page, "Continuar")).toHaveCount(0);
  await expect(player(page)).toHaveAttribute("src", /descobertas-sinal\.mp3$/);
  await expect(mission(page)).toHaveAttribute("data-phase", "search");
  await expect(creatures(page)).toHaveCount(3);
});

test("mantém a fala de chegada, aceita repetição e cancela a reação ao voltar ao mapa", async ({ page }) => {
  await openMission(page, 2);
  await player(page).evaluate((audio) => {
    window.finishedDiscoveries = [];
    audio.addEventListener("ended", () => window.finishedDiscoveries.push(audio.currentSrc.split("/").at(-1)));
  });
  await hiding(page).tap();
  await expect(player(page)).toHaveAttribute("src", /descobertas-chegou\.mp3$/);
  await button(page, "2").tap();
  await expect(mission(page)).toHaveAttribute("data-phase", "lit");
  await expect(player(page)).toHaveAttribute("src", /descobertas-sinal\.mp3$/);
  expect(await page.evaluate(() => window.finishedDiscoveries)).toContain("descobertas-chegou.mp3");

  await button(page, "Ouvir").tap();
  await expect(player(page)).toHaveAttribute("src", /descobertas-sinal\.mp3$/);
  await expect.poll(() => player(page).evaluate((audio) => audio.currentTime)).toBeGreaterThan(0);
  await button(page, "Voltar ao mapa").tap();
  await expect(button(page, "Planeta das Descobertas")).toHaveAttribute("data-completed", "false");
  await button(page, "Planeta das Descobertas").tap();
  await expect(creatures(page)).toHaveCount(1);
  await expect(hiding(page)).toHaveAttribute("data-place", "flower");
  await hiding(page).tap();
  await page.evaluate(() => {
    window.movement = document.querySelector("[data-new]").getAnimations()
      .find((animation) => animation.animationName === undefined);
  });
  expect(await page.evaluate(() => window.movement?.playState)).toBe("running");
  expect((await creatureGlow(creatures(page).first())).animation).toBe("creature-glow");
  await button(page, "Voltar ao mapa").tap();
  expect(await page.evaluate(() => window.movement?.playState)).toBe("idle");
  expect(await page.evaluate(() => document.getAnimations().some((animation) =>
    animation.animationName === "creature-glow"))).toBe(false);
  await page.waitForTimeout(1550);
  await expect(page.locator('[data-screen="map"]')).toBeVisible();
  await expect(button(page, "Planeta das Descobertas")).toHaveAttribute("data-completed", "false");
});

test("compara mais, menos e iguais no vale com pistas, correção e repetição", async ({ page }) => {
  test.slow();
  await openMission(page, 3);
  for (const [index, total] of [2, 4].entries()) {
    await openDiscoveryRound(page, index + 1);
    await solveDiscoveryRound(page, total);
  }
  const comparison = mission(page).locator(".discovery-comparison");
  const equals = button(page, "Iguais");
  await openDiscoveryRound(page, 3);
  await expect(player(page)).toHaveAttribute("src", /descobertas-mais[.]mp3$/);
  await expect(equals).toHaveText("=");
  await button(page, "Ajuda").tap();
  await expect(comparison.locator("[data-help-focus]")).toHaveCount(2);
  await button(page, "Grupo da esquerda, 2 luzinhas").tap();
  await expect(comparison.locator("[data-pair]")).toHaveCount(4);
  await button(page, "Ajuda").tap();
  await expect(comparison.locator("[data-unpaired]")).toHaveCount(2);
  await expect(comparison.locator("[data-chosen]")).toHaveCount(0);
  await button(page, "Ouvir").tap();
  await expect(player(page)).toHaveAttribute("src", /descobertas-comparar-pares[.]mp3$/);
  await solveDiscoveryRound(page, "right");
  await expect(button(page, "Grupo da direita, 4 luzinhas")).toHaveAttribute("data-chosen", "");

  await openDiscoveryRound(page, 4);
  await expect(player(page)).toHaveAttribute("src", /descobertas-menos[.]mp3$/);
  await equals.tap();
  await expect(mission(page)).toHaveAttribute("data-phase", "compare");
  await solveDiscoveryRound(page, "left");

  await openDiscoveryRound(page, 5);
  await expect(player(page)).toHaveAttribute("src", /descobertas-iguais[.]mp3$/);
  const left = button(page, "Grupo da esquerda, 4 luzinhas");
  const right = button(page, "Grupo da direita, 4 luzinhas");
  await expect(left.locator(".discovery-formation")).toHaveAttribute("data-layout", "row");
  await expect(right.locator(".discovery-formation")).toHaveAttribute("data-layout", "clusters");
  await left.tap();
  await expect(mission(page)).toHaveAttribute("data-phase", "compare");
  await solveDiscoveryRound(page, "equal");
  await expect(equals).toHaveAttribute("data-answered", "");
  await expect(comparison.locator("[data-chosen]")).toHaveCount(2);
  await expect(page.locator('[data-screen="complete"]')).toBeVisible();
  await button(page, "Jogar de novo").tap();
  await openDiscoveryRound(page, 1);
  await expect(hiding(page)).toHaveAttribute("data-place", "flower");
  await button(page, "Voltar ao mapa").tap();
  await expect(page.locator('[data-screen="map"] [data-clue="lights"]')).toHaveCount(1);
});

test("acomoda o mapa e as fases de descoberta em três telas em paisagem", async ({ page }) => {
  test.slow();
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.route("**/assets/audio/*.mp3", (route) => route.abort());
  for (const [width, height] of [[568, 320], [667, 375], [780, 360]]) {
    await page.evaluate(() => document.fullscreenElement && document.exitFullscreen());
    await page.setViewportSize({ width, height });
    await page.goto("./");
    await button(page, "Começar").tap();
    await button(page, "Pular apresentação").tap();
    await fit();
    await button(page, "Planeta das Descobertas").tap();
    await fit();
    await button(page, "Pular apresentação").tap();
    await fit();
    const glow = await creatureGlow(creatures(page).first());
    expect(glow.animation).toBe("none");
    expect(glow.background).toContain("radial-gradient");
    await button(page, "Ajuda").tap();
    await fit();
    await hiding(page).tap();
    await button(page, "Ajuda").tap();
    await button(page, "Ajuda").tap();
    await expect(button(page, "Luzinha 1")).toHaveAttribute("data-count-hint", "");
    await expect(button(page, "Luzinha 1")).toHaveCSS("outline-style", "solid");
    await fit();
    await button(page, "2").tap();
    await fit();
    await expect(button(page, "Ouvir")).toHaveAccessibleDescription(/Áudio indisponível/);
    for (const round of [2, 3, 4, 5]) {
      await openDiscoveryRound(page, round);
      await fit();
      for (let help = 0; help < 3; help++) await button(page, "Ajuda").tap();
      await fit();
      if (round >= 3) {
        const sprites = await mission(page).locator(".discovery-formation .glow-creature")
          .evaluateAll((nodes) => nodes.map((node) => node.offsetWidth));
        expect(Math.max(...sprites) - Math.min(...sprites)).toBeLessThanOrEqual(1);
      }
      await solveDiscoveryRound(page, initialDiscoveryRoute[round - 1]);
    }
    await expect(page.locator('[data-screen="complete"]')).toBeVisible();

    async function fit() {
      const layout = await page.evaluate(() => ({
        width: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight,
        controls: [...document.querySelectorAll("main button:not(:disabled)")]
          .filter((node) => node.getClientRects().length)
          .map((node) => Math.min(node.offsetWidth, node.offsetHeight)),
      }));
      expect(layout.width).toBeLessThanOrEqual(width + 1);
      expect(layout.height).toBeLessThanOrEqual(height + 1);
      expect(Math.min(...layout.controls)).toBeGreaterThanOrEqual(48);
    }
  }
});
