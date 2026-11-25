import { expect, test } from "@playwright/test";

const mission = (page) => page.locator('.crystal-screen');
const reserve = (page) => mission(page).locator('[data-zone="reserve"]');
const generator = (page) => mission(page).locator('[data-zone="generator"]');
const crystal = (page, id) => mission(page).locator('[data-crystal="' + id + '"]');
const audio = (page) => page.locator("#game-audio");

async function openCrystals(page) {
  await page.goto("./");
  await page.getByRole("button", { name: "Começar" }).tap();
  await page.getByRole("button", { name: "Planeta dos Cristais" }).tap();
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

async function tapTouch(session, locator) {
  await session.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [await center(locator)] });
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

async function completeCharge(page, amount, last = false) {
  for (let id = 0; id < amount; id++) await crystal(page, id).tap();
  await page.getByRole("button", { name: "Conferir a carga" }).tap();
  await expect(mission(page)).toHaveAttribute("data-phase", "number");
  await page.getByRole("button", { name: String(amount), exact: true }).tap();
  await expect(mission(page)).toHaveAttribute("data-phase", "activate");
  await expect(generator(page).locator("[data-generator-status]")).toHaveText("Carga pronta");
  await page.getByRole("button", { name: "Ligar estação" }).tap();
  await expect(generator(page).locator("[data-generator-status]")).toHaveText("Ligado");
  await expect(audio(page)).toHaveAttribute("src", /cristais-ligado\.mp3$/);
  await page.getByRole("button", { name: last ? "Concluir" : "Continuar", exact: true }).tap();
}

test("transfere por arraste de toque e retira cristais excedentes pelo mesmo gesto", async ({ page }) => {
  await openCrystals(page);
  const session = await page.context().newCDPSession(page);
  await dragTouch(session, crystal(page, 0), generator(page));
  await expect(mission(page)).toHaveAttribute("data-loaded", "1");
  await expect(generator(page).locator('[data-crystal="0"]')).toBeVisible();
  await expect(audio(page)).toHaveAttribute("src", /cristais-encaixe\.mp3$/);

  await crystal(page, 1).tap();
  await expect(mission(page)).toHaveAttribute("data-loaded", "2");
  const verify = page.getByRole("button", { name: "Conferir a carga" });
  await verify.tap();
  await expect(page.getByText("Vamos ajustar a carga?")).toBeVisible();
  await verify.tap();
  await expect(crystal(page, 1)).toHaveAttribute("data-guide", "");
  await expect(audio(page)).toHaveAttribute("src", /cristais-sobram\.mp3$/);

  await dragTouch(session, crystal(page, 1), reserve(page));
  await expect(mission(page)).toHaveAttribute("data-loaded", "1");
  await expect(reserve(page).locator('[data-crystal="1"]')).toBeVisible();
  await expect(audio(page)).toHaveAttribute("src", /cristais-retirar\.mp3$/);
  await tapTouch(session, verify);
  await expect(mission(page)).toHaveAttribute("data-phase", "number");
  await crystal(page, 0).tap();
  await expect(mission(page)).toHaveAttribute("data-phase", "collect");
  await expect(mission(page)).toHaveAttribute("data-loaded", "0");
  await session.detach();
});

test("guia a coleta e a escolha do número, com ações explícitas da criança", async ({ page }) => {
  await openCrystals(page);
  const verify = page.getByRole("button", { name: "Conferir a carga" });
  await verify.tap();
  await verify.tap();
  await expect(audio(page)).toHaveAttribute("src", /cristais-faltam\.mp3$/);
  await verify.tap();
  await expect(mission(page)).toHaveAttribute("data-loaded", "0");
  await page.getByRole("button", { name: "Ajudar" }).tap();
  await expect(mission(page)).toHaveAttribute("data-loaded", "1");
  await expect(mission(page)).toHaveAttribute("data-phase", "collect");

  await verify.tap();
  const wrong = page.getByRole("button", { name: "2", exact: true });
  await wrong.tap();
  await wrong.tap();
  await expect(generator(page).locator("[data-count-hint]")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "1", exact: true })).not.toHaveAttribute("data-guide");
  await wrong.tap();
  const one = page.getByRole("button", { name: "1", exact: true });
  await expect(one).toHaveAttribute("data-guide", "");
  await page.getByRole("button", { name: "Ouvir" }).tap();
  await expect(audio(page)).toHaveAttribute("src", /cristais-pista-numero\.mp3$/);
  await one.tap();
  await expect(mission(page)).toHaveAttribute("data-phase", "activate");
  await page.getByRole("button", { name: "Ligar estação" }).tap();
  await expect(mission(page)).toHaveAttribute("data-phase", "powered");
});

test("termina a missão, repete com outra rota e mantém conclusões por planeta", async ({ page, baseURL }) => {
  const failures = [];
  page.on("pageerror", (error) => failures.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400 || !response.url().startsWith(baseURL)) failures.push(response.url());
  });
  await openCrystals(page);

  await expect(generator(page).locator(".station-art img")).toHaveJSProperty("complete", true);
  await expect.poll(() => audio(page).evaluate((node) => node.currentTime)).toBeGreaterThan(0);
  await completeCharge(page, 1);
  await completeCharge(page, 3);
  await completeCharge(page, 5, true);

  await expect(page.locator('[data-screen="complete"]')).toHaveAttribute("data-planet", "crystals");
  await expect(page.getByText("Você ligou a estação!")).toBeVisible();
  await expect(audio(page)).toHaveAttribute("src", /cristais-conclusao\.mp3$/);
  await expect.poll(() => audio(page).evaluate((node) => node.currentTime)).toBeGreaterThan(0);
  await page.locator('[data-screen="complete"] img').evaluate((image) => image.decode());

  await page.getByRole("button", { name: "Jogar de novo" }).tap();
  await expect(mission(page).locator("[data-instruction]")).toContainText("2 cristais");
  await expect(mission(page)).toHaveAttribute("data-loaded", "0");
  await page.getByRole("button", { name: "Voltar ao mapa" }).tap();

  await expect(page.getByRole("button", { name: "Planeta dos Cristais" })).toHaveAttribute("data-completed", "true");
  await expect(page.getByRole("button", { name: "Planeta das Estrelas" })).toHaveAttribute("data-completed", "false");
  await page.getByRole("button", { name: "Planeta das Estrelas" }).tap();
  await expect(page.getByRole("heading", { name: "Planeta das Estrelas" })).toBeVisible();
  for (let amount = 1; amount <= 5; amount++) {
    for (let index = 1; index <= amount; index++) await page.getByRole("button", { name: "Estrela " + index, exact: true }).tap();
    await page.getByRole("button", { name: "Conferir", exact: true }).tap();
    await page.getByRole("button", { name: amount === 5 ? "Concluir" : "Continuar", exact: true }).tap();
  }
  await expect(page.locator('[data-screen="complete"]')).toHaveAttribute("data-planet", "stars");
  await page.getByRole("button", { name: "Voltar ao mapa" }).tap();
  await expect(page.getByRole("button", { name: "Planeta dos Cristais" })).toHaveAttribute("data-completed", "true");
  await expect(page.getByRole("button", { name: "Planeta das Estrelas" })).toHaveAttribute("data-completed", "true");
  expect(failures).toEqual([]);
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
  await page.getByRole("button", { name: "Voltar ao mapa" }).press("Enter");
  await session.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
  await expect(page.getByRole("heading", { name: "Mapa espacial" })).toBeVisible();
  await expect(audio(page)).toHaveAttribute("src", /mapa\.mp3$/);
  await page.getByRole("button", { name: "Planeta dos Cristais" }).press("Enter");
  await expect(mission(page)).toHaveAttribute("data-phase", "collect");
  await oldPiece.evaluate((button) => button.click());
  await expect(mission(page)).toHaveAttribute("data-loaded", "0");
  await expect(mission(page).locator("[data-crystal-ghost]")).toBeHidden();
  await crystal(page, 0).tap();
  await expect(mission(page)).toHaveAttribute("data-loaded", "1");
  await session.detach();
});

test("encaixa as fases e os controles em celulares horizontais estreitos", async ({ page }) => {
  for (const [width, height] of [[568, 320], [667, 375], [780, 360]]) {
    await page.setViewportSize({ width, height });
    await openCrystals(page);
    const snapshot = () => page.evaluate(() => ({
      width: document.documentElement.scrollWidth,
      height: document.documentElement.scrollHeight,
      controls: [...document.querySelectorAll("button:not(:disabled)")].filter((button) => button.getClientRects().length)
        .map((button) => Math.min(button.offsetWidth, button.offsetHeight)),
    }));
    async function fit() {
      const layout = await snapshot();
      expect(layout.width).toBeLessThanOrEqual(width + 1);
      expect(layout.height).toBeLessThanOrEqual(height + 1);
      expect(Math.min(...layout.controls)).toBeGreaterThanOrEqual(48);
    }

    await fit();
    await crystal(page, 0).tap();
    await page.getByRole("button", { name: "Conferir a carga" }).tap();
    await fit();
    await page.getByRole("button", { name: "1", exact: true }).tap();
    await fit();
    await page.getByRole("button", { name: "Ligar estação" }).tap();
    await fit();
  }
});
