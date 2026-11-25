import { expect, test } from "@playwright/test";

async function openMission(page) {
  await page.goto("./");
  await page.getByRole("button", { name: "Começar" }).tap();
  await expect(page.getByRole("heading", { name: "Mapa espacial" })).toBeVisible();
  await page.getByRole("button", { name: "Planeta das Estrelas" }).tap();
  await expect(page.getByRole("heading", { name: "Planeta das Estrelas" })).toBeVisible();
}

test("joga as cinco rodadas por toque, repete e retorna ao mapa", async ({ page, baseURL }) => {
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

  const player = page.locator("#game-audio");
  await expect(player).toHaveAttribute("src", /\/pedido-1\.mp3$/);
  await expect.poll(() => player.evaluate((node) => node.currentTime)).toBeGreaterThan(0);

  for (let target = 1; target <= 5; target++) {
    await expect(page.locator("[data-target]")).toHaveText(String(target));
    await expect(page.locator("[data-count]")).toHaveText(`0 de ${target}`);
    for (let index = 1; index <= target; index++) {
      const star = page.getByRole("button", { name: `Estrela ${index}`, exact: true });
      await star.tap();
      await expect(star).toHaveAttribute("aria-pressed", "true");
      await expect(star.locator(".star-number")).toHaveText(String(index));
    }
    await expect(player).toHaveAttribute("src", new RegExp(`/contagem-${target}\\.mp3$`));
    await page.getByRole("button", { name: "Conferir" }).tap();
    await expect(page.getByText("Você encontrou a quantidade certa!")).toBeVisible();
    await expect(player).toHaveAttribute("src", new RegExp(`/acerto-${target}\\.mp3$`));
    await page.getByRole("button", { name: target === 5 ? "Concluir" : "Continuar", exact: true }).tap();
  }

  await expect(page.getByRole("heading", { name: "Missão concluída!" })).toBeVisible();
  await expect(player).toHaveAttribute("src", /\/conclusao\.mp3$/);
  await expect.poll(() => player.evaluate((node) => node.currentTime)).toBeGreaterThan(0);

  await page.getByRole("button", { name: "Jogar de novo" }).tap();
  await expect(page.locator("[data-count]")).toHaveText("0 de 1");
  await page.getByRole("button", { name: "Voltar ao mapa" }).tap();
  await expect(page.getByRole("heading", { name: "Mapa espacial" })).toBeVisible();
  await expect(player).toHaveAttribute("src", /\/mapa\.mp3$/);
  expect(errors).toEqual([]);
  expect(external).toEqual([]);
});

test("dá ajuda progressiva, repete a instrução atual e reinicia ao reentrar", async ({ page }) => {
  await openMission(page);

  const player = page.locator("#game-audio");
  const confirm = page.getByRole("button", { name: "Conferir", exact: true });
  const firstStar = page.getByRole("button", { name: "Estrela 1", exact: true });
  await confirm.tap();
  await expect(page.getByText("Vamos contar de novo?")).toBeVisible();
  await expect(player).toHaveAttribute("src", /\/tentar-novamente\.mp3$/);

  await page.getByRole("button", { name: "Ouvir" }).tap();
  await expect(player).toHaveAttribute("src", /\/pedido-1\.mp3$/);

  await confirm.tap();
  await expect(firstStar).toHaveAttribute("data-suggested", "true");
  await expect(player).toHaveAttribute("src", /\/pista\.mp3$/);

  await confirm.tap();
  await expect(page.getByText("Vamos contar juntos.", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Contar juntos" }).tap();
  await expect(firstStar).toHaveAttribute("aria-pressed", "true");
  await expect(confirm).toHaveAttribute("data-suggested", "true");
  await page.getByRole("button", { name: "Ouvir" }).tap();
  await expect(player).toHaveAttribute("src", /\/conferir-agora\.mp3$/);

  await page.getByRole("button", { name: "Voltar ao mapa" }).tap();
  await page.getByRole("button", { name: "Planeta das Estrelas" }).tap();
  await expect(firstStar).toHaveAttribute("data-suggested", "false");
  await expect(firstStar).toHaveAttribute("aria-pressed", "false");
  await firstStar.tap();
  await expect(firstStar).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("[data-count]")).toHaveText("1 de 1");
});
