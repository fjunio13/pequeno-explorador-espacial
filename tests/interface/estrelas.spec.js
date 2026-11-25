import { expect, test } from "@playwright/test";

const button = (page, name) => page.getByRole("button", { name, exact: true });
const star = (page, index) => button(page, `Estrela ${index}`);
const target = (page) => page.locator("[data-target]");
const player = (page) => page.locator("#game-audio");

async function openMission(page) {
  await page.goto("./");
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

test("joga as cinco rodadas por toque e avança depois de ouvir a contagem", async ({ page, baseURL }) => {
  const errors = [];
  const external = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });
  page.on("request", (request) => {
    if (!request.url().startsWith(baseURL)) external.push(request.url());
  });

  await openMission(page);
  await observeAudio(page);
  await expect(player(page)).toHaveAttribute("src", /pedido-1\.mp3$/);
  await expect.poll(() => player(page).evaluate((node) => node.currentTime)).toBeGreaterThan(0);
  await expect(button(page, "Conferir")).toHaveCount(0);
  await expect(button(page, "Continuar")).toHaveCount(0);

  for (let amount = 1; amount <= 5; amount++) {
    await expect(target(page)).toHaveText(String(amount), { timeout: 9000 });
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
  const expected = Array.from({ length: 5 }, (_, index) =>
    [`pedido-${index + 1}.mp3`, `acerto-${index + 1}.mp3`]).flat();
  const spokenRounds = await page.evaluate(() => window.completedAudio.filter((name) => /^(pedido|acerto)-/.test(name)));
  expect(spokenRounds).toEqual(expected);

  await button(page, "Jogar de novo").tap();
  await expect(page.locator("[data-count]")).toHaveText("0 de 1");
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
  await expect(target(page)).toHaveText("2", { timeout: 8500 });
});

test("renova a pausa com Ouvir e cancela a passagem ao sair", async ({ page }) => {
  await openMission(page);
  await observeAudio(page);
  await star(page, 1).tap();
  await expect(player(page)).toHaveAttribute("src", /acerto-1\.mp3$/);
  await expect.poll(() => player(page).evaluate((node) => node.ended)).toBe(true);
  await expect(target(page)).toHaveText("1");

  await button(page, "Ouvir").tap();
  await expect.poll(() => player(page).evaluate((node) => !node.ended && node.currentTime > 0)).toBe(true);
  await expect(target(page)).toHaveText("1");
  await expect(target(page)).toHaveText("2");
  expect(await page.evaluate(() => window.completedAudio.filter((file) => file === "acerto-1.mp3"))).toHaveLength(2);

  await star(page, 1).tap();
  await star(page, 2).tap();
  await expect(player(page)).toHaveAttribute("src", /acerto-2\.mp3$/);
  await expect.poll(() => player(page).evaluate((node) => node.ended), { intervals: [50, 100, 150] }).toBe(true);
  await button(page, "Voltar ao mapa").tap();
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
  await expect(target(page)).toHaveText("2");
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
  await expect(target(page)).toHaveText("2");
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(page.locator("[data-count]")).toHaveText("0 de 2");
  await session.detach();
});
