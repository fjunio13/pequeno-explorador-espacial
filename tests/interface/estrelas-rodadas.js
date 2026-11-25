import { expect } from "@playwright/test";

export function starRound(page, round) {
  return page.getByRole("img", { name: `Rodada ${round} de 6`, exact: true });
}

export async function readStarAmount(page, round) {
  await expect(starRound(page, round)).toBeVisible();
  return Number(await page.locator("[data-target]").textContent());
}

export async function tapStars(page, amount) {
  for (let index = 1; index <= amount; index++) {
    await page.getByRole("button", { name: `Estrela ${index}`, exact: true }).tap();
  }
}
