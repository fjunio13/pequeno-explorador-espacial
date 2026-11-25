import { expect, test } from "@playwright/test";
import { initialCrystalRoute, openCrystalChallenge, solveCrystalChallenge } from "./cristais-rodadas.js";
import { readStarAmount, tapStars } from "./estrelas-rodadas.js";

test.describe.configure({ mode: "parallel" });

const planets = {
  stars: { name: "Planeta das Estrelas", clue: "direction", audio: "conclusao.mp3", arrival: "estrelas-chegada" },
  crystals: { name: "Planeta dos Cristais", clue: "antenna", audio: "cristais-conclusao.mp3", arrival: "cristais-chegada" },
  discoveries: { name: "Planeta das Descobertas", clue: "lights", audio: "descobertas-conclusao.mp3", arrival: "descobertas-chegada" },
};
const orders = [
  ["stars", "crystals", "discoveries"], ["stars", "discoveries", "crystals"],
  ["crystals", "stars", "discoveries"], ["crystals", "discoveries", "stars"],
  ["discoveries", "stars", "crystals"], ["discoveries", "crystals", "stars"],
];

const button = (page, name) => page.getByRole("button", { name, exact: true });
const screen = (page, name) => page.locator(`[data-screen="${name}"]`);
const player = (page) => page.locator("#game-audio");
const clues = (page) => screen(page, "map").locator(".planet-clue");

async function expectLandscapeFit(page) {
  const { width, height, viewportWidth, viewportHeight } = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
    viewportWidth: innerWidth,
    viewportHeight: innerHeight,
  }));
  expect(width).toBeLessThanOrEqual(viewportWidth + 1);
  expect(height).toBeLessThanOrEqual(viewportHeight + 1);
}

async function openMap(page, playbackRate = 1) {
  await page.goto("./");
  await player(page).evaluate((audio, rate) => {
    audio.defaultPlaybackRate = rate;
    window.finishedStory = [];
    audio.addEventListener("ended", () => window.finishedStory.push(audio.currentSrc.split("/").at(-1)));
  }, playbackRate);
  await button(page, "Começar").tap();
}

async function skipArrival(page, planet) {
  await expect(screen(page, "arrival")).toHaveAttribute("data-planet", planet);
  await expect(player(page)).toHaveAttribute("src", new RegExp(`/${planets[planet].arrival}\\.mp3$`));
  await button(page, "Pular apresentação").tap();
}

async function choosePlanet(page, planet) {
  await button(page, planets[planet].name).tap();
  await skipArrival(page, planet);
}

async function playMission(page, planet) {
  if (planet === "stars") {
    for (let round = 1; round <= 6; round++) {
      await tapStars(page, await readStarAmount(page, round));
    }
  } else if (planet === "crystals") {
    for (const [index, challenge] of initialCrystalRoute.entries()) {
      await openCrystalChallenge(page, index + 1);
      await solveCrystalChallenge(page, challenge);
    }
  } else {
    for (const amount of [2, 4, 5]) {
      const hiddenPlace = screen(page, "mission").locator("[data-glint]");
      await expect(hiddenPlace).toBeVisible();
      await expect(page.locator(".glow-creature:not([hidden])")).toHaveCount(amount - 1);
      await hiddenPlace.tap();
      await expect(page.locator(".glow-creature:not([hidden])")).toHaveCount(amount);
      await button(page, String(amount)).tap();
    }
  }
  await expect(screen(page, "complete")).toHaveAttribute("data-planet", planet);
  await expect(screen(page, "complete").locator(`[data-clue="${planets[planet].clue}"]`)).toBeVisible();
}

test("a apresentação aguarda a fala repetida, pode ser revista e é interrompida ao sair", async ({ page }) => {
  await openMap(page);
  await button(page, planets.stars.name).tap();
  await expect(screen(page, "arrival")).toHaveAttribute("data-planet", "stars");
  await expect(player(page)).toHaveAttribute("src", /estrelas-chegada\.mp3$/);
  await expect.poll(() => player(page).evaluate((audio) => audio.currentTime)).toBeGreaterThan(0.65);
  await button(page, "Ouvir").tap();
  await expect.poll(() => player(page).evaluate((audio) => audio.currentTime)).toBeLessThan(0.6);
  await expect(screen(page, "arrival")).toBeVisible();
  await expect(screen(page, "mission")).toHaveAttribute("data-planet", "stars", { timeout: 8000 });
  expect(await page.evaluate(() => window.finishedStory)).toContain("estrelas-chegada.mp3");

  await button(page, "Voltar ao mapa").tap();
  await button(page, "Rever chegada ao Planeta das Estrelas").tap();
  await expect(screen(page, "arrival")).toBeVisible();
  await expect.poll(() => player(page).evaluate((audio) => audio.currentTime)).toBeGreaterThan(0);
  await button(page, "Voltar ao mapa").tap();

  await choosePlanet(page, "discoveries");
  await expect(player(page)).toHaveAttribute("src", /descobertas-procurar-1\.mp3$/);
  await expect.poll(() => player(page).evaluate((audio) => audio.ended)).toBe(true);
  await expect(screen(page, "mission")).toHaveAttribute("data-planet", "discoveries");
  await button(page, "Voltar ao mapa").tap();
  await button(page, planets.stars.name).tap();
  await expect(screen(page, "mission")).toHaveAttribute("data-planet", "stars");
});

test("Próxima missão abre direto um planeta visitado que ainda está pendente", async ({ page }) => {
  await openMap(page, 4);
  await choosePlanet(page, "crystals");
  await button(page, "Voltar ao mapa").tap();

  await choosePlanet(page, "stars");
  await playMission(page, "stars");
  await expect(player(page)).toHaveAttribute("src", /conclusao\.mp3$/);
  await button(page, "Próxima missão").tap();
  await expect(screen(page, "arrival")).toHaveCount(0);
  await expect(screen(page, "mission")).toHaveAttribute("data-planet", "crystals");
  await expect(player(page)).toHaveAttribute("src", /cristais-pedido-2\.mp3$/);
  await button(page, "Voltar ao mapa").tap();
  await expect(clues(page)).toHaveCount(1);
  await expect(button(page, planets.crystals.name)).toHaveAttribute("data-completed", "false");
});

for (const [orderIndex, order] of orders.entries()) {
  test(`registra as três pistas e conclui em ordem ${orderIndex + 1} (${order.join(" → ")})`, async ({ page, baseURL }) => {
    test.slow();
    if (orderIndex === 0) await page.setViewportSize({ width: 568, height: 320 });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    page.on("response", (response) => {
      if (response.status() >= 400 || !response.url().startsWith(baseURL)) errors.push(response.url());
    });
    await openMap(page, 4);
    await expect(clues(page)).toHaveCount(0);
    await choosePlanet(page, order[0]);
    for (const [index, planet] of order.entries()) {
      await playMission(page, planet);
      await expectLandscapeFit(page);
      const nextButton = button(page, "Próxima missão");
      if (index === order.length - 1) {
        await expect(nextButton).toHaveCount(0);
        break;
      }

      const completed = order.slice(0, index + 1);
      const recommended = Object.keys(planets).find((id) => !completed.includes(id));
      await expect(nextButton).toHaveAttribute("data-planet", recommended);
      await expect(nextButton).toHaveAccessibleDescription(planets[recommended].name);
      if (orderIndex === 0 && index === 0) {
        await page.evaluate(() => document.fullscreenElement && document.exitFullscreen());
        for (const [width, height] of [[667, 375], [780, 360], [568, 320]]) {
          await page.setViewportSize({ width, height });
          await expectLandscapeFit(page);
          for (const name of ["Próxima missão", "Jogar de novo", "Voltar ao mapa"]) {
            const control = button(page, name);
            const size = await control.evaluate((element) => Math.min(element.offsetWidth, element.offsetHeight));
            expect(size).toBeGreaterThanOrEqual(48);
            const rect = await control.boundingBox();
            expect(rect.x).toBeGreaterThanOrEqual(0);
            expect(rect.y).toBeGreaterThanOrEqual(0);
            expect(rect.x + rect.width).toBeLessThanOrEqual(width);
            expect(rect.y + rect.height).toBeLessThanOrEqual(height);
          }
        }
      }

      const destination = order[index + 1];
      if (destination === recommended) {
        await nextButton.tap();
        await skipArrival(page, destination);
        continue;
      }
      await button(page, "Voltar ao mapa").tap();
      await expect(clues(page)).toHaveCount(index + 1);
      await expect(button(page, planets[planet].name).locator(`[data-clue="${planets[planet].clue}"]`)).toBeVisible();
      await expect(button(page, "Responder ao sinal")).toHaveCount(0);
      await choosePlanet(page, destination);
    }

    await expect(screen(page, "finale")).toBeVisible({ timeout: 10000 });
    await expectLandscapeFit(page);
    expect(await page.evaluate(() => window.finishedStory)).toContain(planets[order.at(-1)].audio);
    await expect(player(page)).toHaveAttribute("src", /aventura-conclusao\.mp3$/);
    await expect(screen(page, "finale").locator(".story-ship")).toBeVisible();
    await expect(screen(page, "finale").locator(".story-lights img")).toHaveCount(3);
    await screen(page, "finale").locator(".story-lights img").first().evaluate((image) => image.decode());
    await button(page, "Voltar ao mapa").tap();
    await expect(clues(page)).toHaveCount(3);
    await expectLandscapeFit(page);
    for (const [id, { name, clue }] of Object.entries(planets)) {
      await expect(button(page, name)).toHaveAttribute("data-completed", "true");
      await expect(clues(page).and(page.locator(`[data-clue="${clue}"]`))).toHaveCount(1);
      await expect(page.locator(`.arrival-replay[data-planet="${id}"]`)).toBeEnabled();
    }

    if (orderIndex === 0) {
      await button(page, planets.discoveries.name).tap();
      await playMission(page, "discoveries");
      await expect.poll(() => player(page).evaluate((audio) => audio.ended)).toBe(true);
      await page.waitForTimeout(800);
      await expect(screen(page, "complete")).toBeVisible();
      await button(page, "Voltar ao mapa").tap();
      await expect(clues(page)).toHaveCount(3);
      await button(page, "Responder ao sinal").tap();
      await expect(screen(page, "finale")).toBeVisible();

      await button(page, "Voltar ao mapa").tap();
      await button(page, "Oficina de Energia").tap();
      await button(page, "Pular apresentação").tap();
      const energy = screen(page, "energy");
      for (const value of [5, 1, 1]) await energy.locator(`[data-action="add"][data-value="${value}"]`).tap();
      await expect(energy).toHaveAttribute("data-mode", "complete");
      await energy.locator('[data-action="add"][data-value="3"]').tap();
      await expect(energy).toHaveAttribute("data-mode", "compare");
      await button(page, "Carga da direita").tap();
      await expect(screen(page, "energy-complete")).toBeVisible();
      await button(page, "Voltar ao mapa").tap();
      await expect(clues(page)).toHaveCount(3);
      await button(page, "Responder ao sinal").tap();
      await expect(screen(page, "finale")).toBeVisible();
    }
    expect(errors).toEqual([]);
  });
}
