import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

const planets = {
  stars: { name: "Planeta das Estrelas", clue: "direction", audio: "conclusao.mp3" },
  crystals: { name: "Planeta dos Cristais", clue: "antenna", audio: "cristais-conclusao.mp3" },
  discoveries: { name: "Planeta das Descobertas", clue: "lights", audio: "descobertas-conclusao.mp3" },
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

async function choosePlanet(page, planet) {
  await button(page, planets[planet].name).tap();
  await expect(screen(page, "arrival")).toHaveAttribute("data-planet", planet);
  await button(page, "Pular apresentação").tap();
}

async function playMission(page, planet) {
  if (planet === "stars") {
    for (const amount of [1, 2, 3, 4, 5]) {
      await expect(page.locator("[data-target]")).toHaveText(String(amount));
      for (let index = 1; index <= amount; index++) await button(page, `Estrela ${index}`).tap();
    }
  } else if (planet === "crystals") {
    for (const amount of [1, 3, 5]) {
      await expect(page.locator("[data-instruction]")).toContainText(`Coloque ${amount}`);
      for (let index = 0; index < amount; index++) await page.locator(`[data-crystal="${index}"]`).tap();
      await button(page, String(amount)).tap();
      await button(page, "Ligar estação").tap();
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
    for (const [index, planet] of order.entries()) {
      await choosePlanet(page, planet);
      await playMission(page, planet);
      await expectLandscapeFit(page);
      if (index === order.length - 1) break;
      await button(page, "Voltar ao mapa").tap();
      await expect(clues(page)).toHaveCount(index + 1);
      await expect(button(page, planets[planet].name).locator(`[data-clue="${planets[planet].clue}"]`)).toBeVisible();
      await expect(button(page, "Responder ao sinal")).toHaveCount(0);
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
    }
    expect(errors).toEqual([]);
  });
}
