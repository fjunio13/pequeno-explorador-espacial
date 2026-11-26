import { expect, test } from "@playwright/test";
import { initialCrystalRoute, openCrystalChallenge, solveCrystalChallenge } from "./cristais-rodadas.js";
import { readStarAmount, tapStars } from "./estrelas-rodadas.js";

const mission = (page) => page.locator(".crystal-screen");
const reserve = (page) => mission(page).locator('[data-zone="reserve"]');
const generator = (page) => mission(page).locator('[data-zone="generator"]');
const crystal = (page, id) => mission(page).locator(`[data-crystal="${id}"]`);
const audio = (page) => page.locator("#game-audio");
const button = (page, name) => page.getByRole("button", { name, exact: true });

async function openCrystals(page, playbackRate = 1) {
  await page.goto("./");
  await audio(page).evaluate((node, rate) => { node.defaultPlaybackRate = rate; }, playbackRate);
  await button(page, "Começar").tap();
  await button(page, "Pular apresentação").tap();
  await button(page, "Planeta dos Cristais").tap();
  await button(page, "Pular apresentação").tap();
  await expect(mission(page)).toHaveAttribute("data-phase", "collect");
}

async function center(locator) {
  const box = await locator.boundingBox();
  return { x: box.x + box.width / 2, y: box.y + box.height / 2, id: 1 };
}

async function touchMove(session, source, destination) {
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [source] });
  for (const fraction of [0.25, 0.5, 0.75, 1]) {
    await session.send("Input.dispatchTouchEvent", {
      type: "touchMove",
      touchPoints: [{
        x: source.x + (destination.x - source.x) * fraction,
        y: source.y + (destination.y - source.y) * fraction,
        id: source.id,
      }],
    });
  }
}

async function dragTouch(session, source, destination) {
  await touchMove(session, await center(source), await center(destination));
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

async function completeCharge(page, amount) {
  for (let id = 0; id < amount; id++) await crystal(page, id).tap();
  await expect(mission(page)).toHaveAttribute("data-phase", "number");
  await expect(button(page, "Ligar estação")).toHaveCount(0);
  await button(page, String(amount)).tap();
  await expect(mission(page)).toHaveAttribute("data-phase", "activate");
  await expect(generator(page).locator("[data-generator-status]")).toHaveText("Carga pronta");
  await button(page, "Ligar estação").tap();
  await expect(generator(page).locator("[data-generator-status]")).toHaveText("Ligado");
  await expect(button(page, "Continuar")).toHaveCount(0);
  await expect(audio(page)).toHaveAttribute("src", /cristais-ligado\.mp3$/, { timeout: 11000 });
  await expect.poll(() => audio(page).evaluate((node) => !node.ended && node.currentTime > 0)).toBe(true);
  await expect(mission(page)).toHaveAttribute("data-phase", "powered");
}

test("arrasta, corrige o excesso e reabre a escolha ao acertar a carga", async ({ page }) => {
  await openCrystals(page);
  const session = await page.context().newCDPSession(page);
  await dragTouch(session, crystal(page, 0), generator(page));
  await expect(mission(page)).toHaveAttribute("data-loaded", "1");
  await expect(mission(page)).toHaveAttribute("data-phase", "number");
  await expect(generator(page).locator('[data-crystal="0"]')).toBeVisible();
  await expect(button(page, "Conferir a carga")).toHaveCount(0);

  await crystal(page, 1).tap();
  await expect(mission(page)).toHaveAttribute("data-loaded", "2");
  await expect(mission(page)).toHaveAttribute("data-phase", "collect");
  await expect(page.getByText("Devolva um cristal à reserva.")).toBeVisible();
  await expect(audio(page)).toHaveAttribute("src", /cristais-excesso\.mp3$/);
  await button(page, "Ajuda").tap();
  await expect(generator(page).locator("[data-load-hint]").locator('[data-crystal="1"]')).toBeVisible();
  await expect(crystal(page, 1)).not.toHaveAttribute("data-guide");
  await button(page, "Ajuda").tap();
  await expect(crystal(page, 1)).toHaveAttribute("data-guide", "");
  await expect(audio(page)).toHaveAttribute("src", /cristais-sobram\.mp3$/);

  await dragTouch(session, crystal(page, 1), reserve(page));
  await expect(mission(page)).toHaveAttribute("data-loaded", "1");
  await expect(reserve(page).locator('[data-crystal="1"]')).toBeVisible();
  await expect(mission(page)).toHaveAttribute("data-phase", "number");
  await button(page, "1").tap();
  await expect(mission(page)).toHaveAttribute("data-phase", "activate");
  await crystal(page, 0).tap();
  await expect(mission(page)).toHaveAttribute("data-phase", "collect");
  await expect(mission(page)).toHaveAttribute("data-loaded", "0");
  await expect(button(page, "Ligar estação")).toHaveCount(0);
  await session.detach();
});

test("guia a coleta e a escolha do número, com ações explícitas da criança", async ({ page }) => {
  await openCrystals(page, 3);
  await button(page, "Ajuda").tap();
  await expect(generator(page)).toHaveAttribute("data-help-focus", "");
  await expect(mission(page).locator(".crystal-piece[data-guide]")).toHaveCount(0);
  await button(page, "Ajuda").tap();
  await expect(generator(page).locator("[data-load-hint]")).toHaveCount(1);
  await expect(audio(page)).toHaveAttribute("src", /cristais-espacos\.mp3$/);
  await button(page, "Ajuda").tap();
  await expect(crystal(page, 0)).toHaveAttribute("data-guide", "");
  await expect(audio(page)).toHaveAttribute("src", /cristais-faltam\.mp3$/);
  await button(page, "Ajuda").tap();
  await expect(mission(page)).toHaveAttribute("data-loaded", "0");
  await crystal(page, 0).tap();
  await expect(mission(page)).toHaveAttribute("data-loaded", "1");
  await expect(mission(page)).toHaveAttribute("data-phase", "number");

  await button(page, "Ajuda").tap();
  await expect(generator(page)).toHaveAttribute("data-help-focus", "");
  await expect(generator(page).locator("[data-count-hint]")).toHaveCount(0);
  await expect(button(page, "1")).not.toHaveAttribute("data-guide");
  await button(page, "2").tap();
  await expect(generator(page).locator("[data-count-hint]")).toHaveCount(1);
  await expect(generator(page).locator(".crystal-count:visible")).toHaveText("1");
  await expect(button(page, "1")).not.toHaveAttribute("data-guide");
  await button(page, "Ajuda").tap();
  await expect(button(page, "1")).toHaveAttribute("data-guide", "");
  await button(page, "Ouvir").tap();
  await expect(audio(page)).toHaveAttribute("src", /cristais-pista-numero\.mp3$/);
  await expect(mission(page)).toHaveAttribute("data-phase", "number");
  await button(page, "1").tap();
  await expect(mission(page)).toHaveAttribute("data-phase", "activate");
  await button(page, "Ajuda").tap();
  await expect(button(page, "Ligar estação")).toHaveAttribute("data-guide", "");
  await expect(mission(page)).toHaveAttribute("data-phase", "activate");
  await button(page, "Ligar estação").tap();
  await expect(mission(page)).toHaveAttribute("data-phase", "powered");
});

test("sair da escolha do numeral cancela a pista que aguardava", async ({ page }) => {
  await openCrystals(page);
  await crystal(page, 0).tap();
  await button(page, "Ajuda").tap();
  await button(page, "Ouvir").tap();
  await expect(audio(page)).toHaveAttribute("src", /cristais-recontar\.mp3$/);
  await expect.poll(() => audio(page).evaluate((node) => node.currentTime)).toBeGreaterThan(0);
  await button(page, "Ajuda").tap();
  await button(page, "Ajuda").tap();
  await expect(button(page, "1")).toHaveAttribute("data-guide", "");
  await expect(audio(page)).toHaveAttribute("src", /cristais-recontar\.mp3$/);

  await button(page, "Voltar ao mapa").tap();
  await expect(audio(page)).toHaveAttribute("src", /mapa\.mp3$/);
  await expect(mission(page)).toHaveCount(0);
  await button(page, "Planeta dos Cristais").tap();
  await expect(audio(page)).toHaveAttribute("src", /cristais-pedido-2\.mp3$/);
  await expect.poll(() => audio(page).evaluate((node) => node.ended)).toBe(true);
  await expect(audio(page)).toHaveAttribute("src", /cristais-pedido-2\.mp3$/);
  await expect(mission(page).locator("[data-help-focus], [data-guide]")).toHaveCount(0);
});

test("sinaliza a falta de áudio sem encobrir a ajuda e os numerais", async ({ page }) => {
  await page.setViewportSize({ width: 568, height: 320 });
  await page.route("**/assets/audio/*.mp3", (route) => route.abort());
  await openCrystals(page);
  await crystal(page, 0).tap();
  for (let level = 1; level <= 3; level++) await button(page, "Ajuda").tap();

  const listen = button(page, "Ouvir");
  await expect(listen).toHaveAccessibleDescription(/Áudio indisponível/);
  await expect(listen.locator(".sound-unavailable")).toBeVisible();
  await expect(page.locator("#audio-status")).toHaveCSS("clip-path", "inset(50%)");
  await expect(button(page, "1")).toHaveAttribute("data-guide", "");
  await button(page, "1").tap();
  await button(page, "Ligar estação").tap();
  await expect(mission(page).locator("[data-instruction]")).toHaveText("Complete o gerador com 3 cristais");

  await page.unroute("**/assets/audio/*.mp3");
  await listen.tap();
  await expect.poll(() => audio(page).evaluate((node) => node.currentTime)).toBeGreaterThan(0);
  await expect(listen.locator(".sound-unavailable")).toBeHidden();
});

test("resolve os cinco desafios e repete sem confirmação intermediária", async ({ page, baseURL }) => {
  test.slow();
  const failures = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400 || !response.url().startsWith(baseURL)) failures.push(response.url());
  });
  await openCrystals(page, 3);
  await page.evaluate(() => {
    const player = document.querySelector("#game-audio");
    window.finishedCues = [];
    player.addEventListener("ended", () => window.finishedCues.push(player.currentSrc.split("/").at(-1)));
  });

  await generator(page).locator(".station-art img").evaluate((image) => image.decode());
  await expect.poll(() => audio(page).evaluate((node) => node.currentTime)).toBeGreaterThan(0);
  for (const [index, challenge] of initialCrystalRoute.entries()) {
    await openCrystalChallenge(page, index + 1);
    await solveCrystalChallenge(page, challenge);
    await expect(button(page, "Continuar")).toHaveCount(0);
  }

  await expect(page.locator('[data-screen="complete"]')).toHaveAttribute("data-planet", "crystals");
  await expect(page.getByText("Estação acesa e padrão de luz")).toBeVisible();
  await expect(audio(page)).toHaveAttribute("src", /cristais-conclusao\.mp3$/);
  await expect.poll(() => audio(page).evaluate((node) => node.currentTime)).toBeGreaterThan(0);
  await page.locator('[data-screen="complete"] .story-picture img').evaluate((image) => image.decode());

  const finished = await page.evaluate(() => window.finishedCues);
  expect(finished.filter((name) => name === "cristais-ligado.mp3")).toHaveLength(4);
  for (const cue of ["pedido-1", "completar-3", "reduzir-2", "comparar-mais", "comparacao-certa", "completar-5"]) {
    expect(finished).toContain(`cristais-${cue}.mp3`);
  }

  await button(page, "Jogar de novo").tap();
  await expect(mission(page).locator("[data-instruction]")).toContainText("2 cristais");
  await expect(mission(page)).toHaveAttribute("data-loaded", "0");
  await button(page, "Voltar ao mapa").tap();

  await expect(button(page, "Planeta dos Cristais")).toHaveAttribute("data-completed", "true");
  await expect(button(page, "Planeta das Estrelas")).toHaveAttribute("data-completed", "false");
  await button(page, "Planeta das Estrelas").tap();
  await button(page, "Pular apresentação").tap();
  await expect(page.getByRole("heading", { name: "Planeta das Estrelas" })).toBeVisible();
  for (let round = 1; round <= 6; round++) {
    await tapStars(page, await readStarAmount(page, round));
  }
  await expect(page.locator('[data-screen="complete"]')).toHaveAttribute("data-planet", "stars");
  await button(page, "Voltar ao mapa").tap();
  await expect(button(page, "Planeta das Estrelas")).toHaveAttribute("data-completed", "true");
  await expect(button(page, "Planeta dos Cristais")).toHaveAttribute("data-completed", "true");
  expect(failures).toEqual([]);
});

test("completa uma carga e corrige a retirada de um cristal a mais", async ({ page }) => {
  await openCrystals(page, 4);
  await solveCrystalChallenge(page, initialCrystalRoute[0]);
  await openCrystalChallenge(page, 2);
  await expect(generator(page).locator("[data-crystal]")).toHaveCount(1);
  await expect(generator(page).locator("[data-requested]:not([data-filled])")).toHaveCount(2);
  await button(page, "Ajuda").tap();
  await button(page, "Ajuda").tap();
  await expect(generator(page).locator("[data-load-hint]:not([data-filled])")).toHaveCount(2);
  const session = await page.context().newCDPSession(page);
  await dragTouch(session, crystal(page, 1), generator(page));
  await expect(mission(page)).toHaveAttribute("data-loaded", "2");
  await crystal(page, 2).tap();
  await button(page, "3").tap();
  await button(page, "Ligar estação").tap();

  await openCrystalChallenge(page, 3);
  await expect(generator(page).locator("[data-crystal]")).toHaveCount(5);
  await expect(reserve(page).locator("[data-crystal]")).toHaveCount(0);
  for (let level = 0; level < 3; level++) await button(page, "Ajuda").tap();
  await expect(generator(page).locator("[data-crystal][data-guide]")).toHaveCount(1);
  await dragTouch(session, crystal(page, 4), reserve(page));
  for (const id of [3, 2, 1]) await crystal(page, id).tap();
  await expect(mission(page)).toHaveAttribute("data-loaded", "1");
  await expect(reserve(page).locator("[data-crystal]")).toHaveCount(4);
  for (let level = 0; level < 3; level++) await button(page, "Ajuda").tap();
  await expect(reserve(page).locator("[data-crystal][data-guide]")).toHaveCount(1);
  await crystal(page, 4).tap();
  await expect(mission(page)).toHaveAttribute("data-phase", "number");
  await expect(generator(page).locator("[data-crystal]")).toHaveCount(2);
  await session.detach();
});

test("compara geradores, corrige a escolha e cancela o avanço ao sair", async ({ page }) => {
  await openCrystals(page, 3);
  for (const [index, challenge] of initialCrystalRoute.slice(0, 3).entries()) {
    await openCrystalChallenge(page, index + 1);
    await solveCrystalChallenge(page, challenge);
  }
  await openCrystalChallenge(page, 4);
  const comparison = mission(page).locator(".crystal-comparison");
  const left = button(page, "Gerador da esquerda, 4 cristais");
  const right = button(page, "Gerador da direita, 2 cristais");
  await expect(mission(page).locator("[data-instruction]")).toHaveText("Qual gerador tem mais cristais?");
  await button(page, "Ajuda").tap();
  await expect(comparison.locator("[data-help-focus]")).toHaveCount(2);
  await right.tap();
  await expect(comparison.locator("[data-pair]")).toHaveCount(4);
  await button(page, "Ajuda").tap();
  await expect(comparison.locator("[data-difference]")).toHaveCount(4);
  await expect(comparison.locator("[data-chosen], [data-guide]")).toHaveCount(0);
  await button(page, "Ouvir").tap();
  await expect(audio(page)).toHaveAttribute("src", /cristais-comparar-mais\.mp3$/);
  await left.tap();
  await expect(left).toHaveAttribute("data-chosen", "");
  await expect(button(page, "1")).toHaveCount(0);
  await expect(button(page, "Ligar estação")).toHaveCount(0);
  await button(page, "Ouvir").tap();
  await expect(audio(page)).toHaveAttribute("src", /cristais-comparacao-certa\.mp3$/);
  await button(page, "Voltar ao mapa").tap();
  await expect(audio(page)).toHaveAttribute("src", /mapa\.mp3$/);
  await expect.poll(() => audio(page).evaluate((node) => node.ended)).toBe(true);
  await expect(mission(page)).toHaveCount(0);
  await expect(button(page, "Planeta dos Cristais")).toHaveAttribute("data-completed", "false");
});

test("sair durante a energização cancela a passagem pendente", async ({ page }) => {
  await openCrystals(page);
  await completeCharge(page, 1);
  await button(page, "Voltar ao mapa").tap();
  await expect(button(page, "Planeta dos Cristais")).toHaveAttribute("data-completed", "false");
  await button(page, "Planeta das Estrelas").tap();
  await button(page, "Pular apresentação").tap();
  await expect(audio(page)).toHaveAttribute("src", /\/pedido-1\.mp3$/);
  await expect.poll(() => audio(page).evaluate((node) => node.ended)).toBe(true);
  await expect(page.getByRole("heading", { name: "Planeta das Estrelas" })).toBeVisible();
  await expect(page.locator("[data-count]")).toHaveText("0 de 1");
});

test("cancela o arraste fora do alvo e limpa o ponteiro ao sair no meio do gesto", async ({ page }) => {
  await openCrystals(page);
  const session = await page.context().newCDPSession(page);
  const start = await center(crystal(page, 0));
  const elsewhere = await center(page.getByRole("heading", { name: "Planeta dos Cristais" }));
  await touchMove(session, start, elsewhere);
  await expect(mission(page).locator("[data-crystal-ghost]")).toBeVisible();
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(mission(page)).toHaveAttribute("data-loaded", "0");
  await expect(mission(page).locator("[data-crystal-ghost]")).toBeHidden();

  await touchMove(session, start, await center(generator(page)));
  await session.send("Input.dispatchTouchEvent", { type: "touchCancel", touchPoints: [] });
  await expect(mission(page)).toHaveAttribute("data-loaded", "0");
  await expect(mission(page).locator("[data-crystal-ghost]")).toBeHidden();

  await touchMove(session, start, await center(generator(page)));
  const oldPiece = await crystal(page, 0).elementHandle();
  await button(page, "Voltar ao mapa").press("Enter");
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(page.getByRole("heading", { name: "Mapa espacial" })).toBeVisible();
  await expect(audio(page)).toHaveAttribute("src", /mapa\.mp3$/);
  await button(page, "Planeta dos Cristais").press("Enter");
  await expect(mission(page)).toHaveAttribute("data-phase", "collect");
  await oldPiece.evaluate((piece) => piece.click());
  await expect(mission(page)).toHaveAttribute("data-loaded", "0");
  await expect(mission(page).locator("[data-crystal-ghost]")).toBeHidden();
  await crystal(page, 0).tap();
  await expect(mission(page)).toHaveAttribute("data-loaded", "1");
  await session.detach();
});

test("encaixa as fases e os controles em celulares horizontais estreitos", async ({ page }) => {
  test.slow();
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const [width, height] of [[568, 320], [667, 375], [780, 360]]) {
    await page.evaluate(() => document.fullscreenElement && document.exitFullscreen());
    await page.setViewportSize({ width, height });
    await openCrystals(page, 4);
    const snapshot = () => page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
      controls: [...document.querySelectorAll("button:not(:disabled)")].filter((node) => node.getClientRects().length)
        .map((node) => Math.min(node.offsetWidth, node.offsetHeight)),
    }));
    async function fit() {
      const layout = await snapshot();
      expect(layout.width).toBeLessThanOrEqual(width + 1);
      expect(layout.height).toBeLessThanOrEqual(height + 1);
      expect(Math.min(...layout.controls)).toBeGreaterThanOrEqual(48);
    }

    await button(page, "Ajuda").tap();
    await fit();
    await crystal(page, 0).tap();
    for (let level = 1; level <= 3; level++) {
      await button(page, "Ajuda").tap();
      await fit();
    }
    await expect(button(page, "1")).toHaveCSS("animation-name", "none");
    await fit();
    await button(page, "1").tap();
    await button(page, "Ajuda").tap();
    await fit();
    await button(page, "Ligar estação").tap();
    await fit();
    for (const round of [2, 3]) {
      await openCrystalChallenge(page, round);
      await fit();
      await solveCrystalChallenge(page, initialCrystalRoute[round - 1]);
    }
    await openCrystalChallenge(page, 4);
    for (let level = 0; level < 3; level++) await button(page, "Ajuda").tap();
    await fit();
    const gems = await mission(page).locator(".crystal-compare-generator .crystal-socket img").evaluateAll(
      (images) => images.map((image) => [image.offsetWidth, image.offsetHeight]),
    );
    expect(gems).toHaveLength(6);
    expect(gems.every(([width, height]) => width >= 32 && height >= 32)).toBe(true);
    expect(Math.max(...gems.map(([width]) => width)) - Math.min(...gems.map(([width]) => width))).toBeLessThanOrEqual(1);
  }
});
