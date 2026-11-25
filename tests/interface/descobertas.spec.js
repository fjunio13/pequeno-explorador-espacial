import { expect, test } from "@playwright/test";

const button = (page, name) => page.getByRole("button", { name, exact: true });
const mission = (page) => page.locator(".discovery-screen");
const player = (page) => page.locator("#game-audio");
const creatures = (page) => mission(page).locator(".glow-creature:not([hidden])");
const hiding = (page) => mission(page).locator("[data-glint]");

async function openMission(page, playbackRate = 1) {
  await page.goto("./");
  await player(page).evaluate((audio, rate) => { audio.defaultPlaybackRate = rate; }, playbackRate);
  await button(page, "Começar").tap();
  await button(page, "Planeta das Descobertas").tap();
  await button(page, "Pular apresentação").tap();
}

test("explora o vale, acrescenta uma criatura e corrige a quantidade com ajuda", async ({ page }) => {
  await openMission(page, 3);
  await expect(creatures(page)).toHaveCount(1);
  await button(page, "Flor do vale").tap();
  await expect(page.getByText("Experimente outro lugar.")).toBeVisible();
  await button(page, "Ajuda").tap();
  await expect(hiding(page)).toHaveAttribute("data-guide", "");
  await button(page, "Ajuda").tap();
  await expect(page.getByText("Toque no brilho dourado.")).toBeVisible();
  await expect(creatures(page)).toHaveCount(1);

  const firstX = (await button(page, "Luzinha 1").boundingBox()).x;
  await hiding(page).tap();
  await expect(mission(page)).toHaveAttribute("data-phase", "count");
  await expect(creatures(page)).toHaveCount(2);
  expect((await button(page, "Luzinha 1").boundingBox()).x).toBeCloseTo(firstX);
  await expect(button(page, "Luzinha 2")).toHaveAttribute("data-new", "");
  await button(page, "Luzinha 1").tap();
  await expect(button(page, "Luzinha 1")).toHaveAttribute("data-counted", "");
  await button(page, "1").tap();
  await expect(page.getByText("Vamos contar de novo?")).toBeVisible();
  await button(page, "Ajuda").tap();
  await expect(creatures(page).and(mission(page).locator("[data-count-hint]"))).toHaveCount(2);
  await button(page, "3").tap();
  await expect(button(page, "2")).toHaveAttribute("data-guide", "");
  await expect(creatures(page)).toHaveCount(2);
  await expect(button(page, "2")).toBeEnabled();
  await button(page, "Ouvir").tap();
  await expect(player(page)).toHaveAttribute("src", /descobertas-numero\.mp3$/);

  await button(page, "2").tap();
  await expect(mission(page)).toHaveAttribute("data-phase", "lit");
  await expect(mission(page).locator(".light-pattern")).toBeVisible();
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
    window.movement = document.querySelector("[data-new]").getAnimations()[0];
  });
  expect(await page.evaluate(() => window.movement?.playState)).toBe("running");
  await button(page, "Voltar ao mapa").tap();
  expect(await page.evaluate(() => window.movement?.playState)).toBe("idle");
  await page.waitForTimeout(1550);
  await expect(page.locator('[data-screen="map"]')).toBeVisible();
  await expect(button(page, "Planeta das Descobertas")).toHaveAttribute("data-completed", "false");
});

test("acomoda o mapa e as fases de descoberta em três telas em paisagem", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [width, height] of [[568, 320], [667, 375], [780, 360]]) {
    await page.evaluate(() => document.fullscreenElement && document.exitFullscreen());
    await page.setViewportSize({ width, height });
    await page.goto("./");
    await button(page, "Começar").tap();
    await fit();
    await button(page, "Planeta das Descobertas").tap();
    await fit();
    await button(page, "Pular apresentação").tap();
    await fit();
    await hiding(page).tap();
    await fit();
    await button(page, "2").tap();
    await fit();

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
