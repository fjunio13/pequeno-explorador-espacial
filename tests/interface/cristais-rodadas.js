import { expect } from "@playwright/test";

export const initialCrystalRoute = [
  { initial: 0, target: 1 },
  { initial: 1, target: 3 },
  { initial: 5, target: 2 },
  { side: 0 },
  { initial: 3, target: 5 },
];

export async function openCrystalChallenge(page, round) {
  await expect(page.locator("[data-crystal-progress]"))
    .toHaveAttribute("aria-label", `Desafio ${round} de 5`);
}

export async function solveCrystalChallenge(page, { initial, target, side }) {
  if (side !== undefined) {
    await page.locator(`[data-action="compare"][data-side="${side}"]`).tap();
    await expect(page.locator(".crystal-screen")).toHaveAttribute("data-phase", "compared");
    return;
  }

  await expect(page.locator(".crystal-screen")).toHaveAttribute("data-loaded", String(initial));
  for (let id = Math.min(initial, target); id < Math.max(initial, target); id++) {
    await page.locator(`[data-crystal="${id}"]`).tap();
  }
  await page.getByRole("button", { name: String(target), exact: true }).tap();
  await page.getByRole("button", { name: "Ligar estação", exact: true }).tap();
  await expect(page.locator('[data-generator-status]')).toHaveText("Ligado");
}
