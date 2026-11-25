import { expect, test } from "@playwright/test";
import { readStarAmount, starRound, tapStars } from "./estrelas-rodadas.js";

const button = (page, name) => page.getByRole("button", { name, exact: true });
const star = (page, index) => button(page, `Estrela ${index}`);
const target = (page) => page.locator("[data-target]");
const player = (page) => page.locator("#game-audio");

async function openMission(page, playbackRate = 1) {
  await page.goto("./");
  await player(page).evaluate((audio, rate) => { audio.defaultPlaybackRate = rate; }, playbackRate);
  await button(page, "Começar").tap();
  await button(page, "Planeta das Estrelas").tap();
  await button(page, "Pular apresentação").tap();
  await expect(page.getByRole("heading", { name: "Planeta das Estrelas" })).toBeVisible();
}

function observeAudio(page) {
  return page.evaluate(() => {
    const node = document.querySelector("#game-audio");
    window.completedAudio = [];
    node.addEventListener("ended", () => window.completedAudio.push(node.currentSrc.split("/").at(-1)));
  });
}

function clickAfterFeedback(page, cue, action) {
  return player(page).evaluate((audio, { cue, action }) => {
    audio.addEventListener("ended", function onEnded() {
      if (!audio.currentSrc.endsWith(`/${cue}.mp3`)) return;
      audio.removeEventListener("ended", onEnded);

      // Execute após os ouvintes da mídia e antes da pausa de troca de rodada.
      setTimeout(() => {
        const round = document.querySelector("[data-target]")?.textContent;
        const button = document.querySelector(`button[data-action="${action}"]`);
        button?.click();
        window.feedbackClick = { cue, round, clicked: Boolean(button) };
      }, 0);
    });
  }, { cue, action });
}

test("joga seis rodadas, avança após ouvir a contagem e varia ao repetir", async ({ page, baseURL }) => {
  test.slow();
  const errors = [];
  const external = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  page.on("request", (request) => {
    if (!request.url().startsWith(baseURL)) external.push(request.url());
  });

  await openMission(page, 2);
  await observeAudio(page);
  await expect(player(page)).toHaveAttribute("src", /pedido-1\.mp3$/);
  await expect.poll(() => player(page).evaluate((node) => node.currentTime)).toBeGreaterThan(0);
  await expect(button(page, "Conferir")).toHaveCount(0);
  await expect(button(page, "Continuar")).toHaveCount(0);

  const targets = [];
  await expect(page.getByRole("group", { name: "Estrelas para contar" }).getByRole("button")).toHaveCount(5);
  for (let round = 1; round <= 6; round++) {
    const amount = await readStarAmount(page, round);
    targets.push(amount);
    await expect(page.locator("[data-count]")).toHaveText(`0 de ${amount}`);
    for (let index = 1; index <= amount; index++) {
      await star(page, index).tap();
      await expect(star(page, index)).toHaveAttribute("aria-pressed", "true");
      await expect(star(page, index).locator(".star-number")).toHaveText(String(index));
    }
    await expect(page.getByText("Você encontrou a quantidade certa!")).toBeVisible();
    await expect(player(page)).toHaveAttribute("src", new RegExp(`/acerto-${amount}\\.mp3$`));
    await expect.poll(() => player(page).evaluate((node) => !node.ended && node.currentTime > 0)).toBe(true);
    await expect(target(page)).toHaveText(String(amount));
  }

  await expect(page.getByRole("heading", { name: "Missão concluída!" })).toBeVisible();
  await expect(player(page)).toHaveAttribute("src", /conclusao\.mp3$/);
  expect(targets[0]).toBe(1);
  expect([...new Set(targets.slice(1))].sort()).toEqual([2, 3, 4, 5]);
  expect(targets.every((amount, index) => amount !== targets[index - 1])).toBe(true);
  const expected = targets.flatMap((amount) => [`pedido-${amount}.mp3`, `acerto-${amount}.mp3`]);
  const spokenRounds = await page.evaluate(() => window.completedAudio.filter((name) => /^(pedido|acerto)-/.test(name)));
  expect(spokenRounds).toEqual(expected);

  await player(page).evaluate((audio) => { audio.defaultPlaybackRate = 4; });
  await button(page, "Jogar de novo").tap();
  await expect(page.locator("[data-count]")).toHaveText("0 de 1");
  const replay = [];
  for (let round = 1; round <= 6; round++) {
    const amount = await readStarAmount(page, round);
    replay.push(amount);
    await tapStars(page, amount);
  }
  expect(replay).not.toEqual(targets);
  await expect(page.getByRole("heading", { name: "Missão concluída!" })).toBeVisible();
  await button(page, "Voltar ao mapa").tap();
  await expect(page.getByRole("heading", { name: "Mapa espacial" })).toBeVisible();
  await expect(player(page)).toHaveAttribute("src", /mapa\.mp3$/);
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test("corrige um toque após o acerto e pede ajuda sem conferir a rodada", async ({ page }) => {
  await openMission(page);
  await star(page, 1).tap();
  await expect(player(page)).toHaveAttribute("src", /acerto-1\.mp3$/);
  await expect.poll(() => player(page).evaluate((node) => node.currentTime)).toBeGreaterThan(0);

  await star(page, 2).tap();
  await expect(page.getByText("Toque de novo para desmarcar uma estrela.")).toBeVisible();
  await expect(player(page)).toHaveAttribute("src", /tentar-novamente\.mp3$/);
  await expect.poll(() => player(page).evaluate((node) => node.ended), { intervals: [50, 100, 150] }).toBe(true);
  await expect(target(page)).toHaveText("1");
  await expect(page.locator("[data-count]")).toHaveText("2 de 1");
  await expect(page.locator(".count-stage")).toHaveAttribute("data-matched", "false");

  await button(page, "Ajuda").tap();
  await expect(star(page, 2)).toHaveAttribute("data-suggested", "true");
  await button(page, "Ajuda").tap();
  await expect(button(page, "Contar juntos")).toBeVisible();
  await expect(page.locator("[data-count]")).toHaveText("2 de 1");
  await button(page, "Contar juntos").tap();
  await expect(star(page, 2)).toHaveAttribute("aria-pressed", "false");
  await expect(page.locator("[data-count]")).toHaveText("1 de 1");

  await button(page, "Ouvir").tap();
  await expect(player(page)).toHaveAttribute("src", /acerto-1\.mp3$/);
  await expect(target(page)).toHaveText("1");
  await expect(starRound(page, 2)).toBeVisible({ timeout: 8500 });
});

test("renova a pausa com Ouvir e cancela a passagem ao sair", async ({ page }) => {
  await openMission(page);
  await observeAudio(page);
  await clickAfterFeedback(page, "acerto-1", "listen");
  await star(page, 1).tap();

  await expect.poll(() => page.evaluate(() => window.feedbackClick)).toEqual({
    cue: "acerto-1", round: "1", clicked: true,
  });
  const amount = await readStarAmount(page, 2);
  expect(await page.evaluate(() => window.completedAudio.filter((file) => file === "acerto-1.mp3"))).toHaveLength(2);

  const cue = `acerto-${amount}`;
  await clickAfterFeedback(page, cue, "map");
  await tapStars(page, amount);
  await expect.poll(() => page.evaluate(() => window.feedbackClick)).toEqual({
    cue, round: String(amount), clicked: true,
  });
  await expect(page.getByRole("heading", { name: "Mapa espacial" })).toBeVisible();
  await button(page, "Planeta dos Cristais").tap();
  await button(page, "Pular apresentação").tap();
  await expect(player(page)).toHaveAttribute("src", /cristais-pedido-1\.mp3$/);
  await expect.poll(() => player(page).evaluate((node) => node.ended)).toBe(true);
  await expect(page.getByRole("heading", { name: "Planeta dos Cristais" })).toBeVisible();

  await button(page, "Voltar ao mapa").tap();
  await button(page, "Planeta das Estrelas").tap();
  await expect(target(page)).toHaveText("1");
  await expect(page.locator("[data-count]")).toHaveText("0 de 1");
});

test("o tutorial continua jogável sem áudio em paisagem", async ({ page }) => {
  await page.route("**/assets/audio/*.mp3", (route) => route.abort());
  await page.setViewportSize({ width: 568, height: 320 });
  await openMission(page);
  await expect(page.getByText("Áudio indisponível.", { exact: false })).toBeVisible();
  await star(page, 1).tap();
  await expect(page.getByText("Você encontrou a quantidade certa!")).toBeVisible();
  await expect(starRound(page, 2)).toBeVisible();
  const layout = await page.evaluate(() => ({
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
    sizes: [...document.querySelectorAll("main button")].map((item) => Math.min(item.offsetWidth, item.offsetHeight)),
  }));
  expect(layout.width).toBeLessThanOrEqual(568);
  expect(layout.height).toBeLessThanOrEqual(320);
  expect(Math.min(...layout.sizes)).toBeGreaterThanOrEqual(48);
});

test("um toque iniciado na celebração não seleciona estrela na rodada seguinte", async ({ page }) => {
  await openMission(page);
  await star(page, 1).tap();
  await expect(page.locator(".count-stage")).toHaveAttribute("data-matched", "true");

  const session = await page.context().newCDPSession(page);
  const { x, y, width, height } = await star(page, 2).boundingBox();
  await session.send("Input.dispatchTouchEvent", {
    type: "touchStart",
    touchPoints: [{ x: x + width / 2, y: y + height / 2 }],
  });
  const amount = await readStarAmount(page, 2);
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(page.locator("[data-count]")).toHaveText(`0 de ${amount}`);
  await session.detach();
});
