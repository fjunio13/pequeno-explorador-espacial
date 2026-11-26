import { expect } from "@playwright/test";

export const initialDiscoveryRoute = [2, 4, "right", "left", "equal"];

export async function openDiscoveryRound(page, round) {
  await expect(page.getByRole("img", { name: `Descoberta ${round} de 5` })).toBeVisible();
}

export async function solveDiscoveryRound(page, answer) {
  const mission = page.locator(".discovery-screen");
  if (typeof answer === "number") {
    await expect(mission.locator(".discovery-group .glow-creature:not([hidden])")).toHaveCount(answer - 1);
    await mission.locator("[data-glint]").tap();
    await expect(mission.locator(".discovery-group .glow-creature:not([hidden])")).toHaveCount(answer);
    await page.getByRole("button", { name: String(answer), exact: true }).tap();
  } else {
    await mission.locator(`[data-choice="${answer}"]`).tap();
  }
  await expect(mission).toHaveAttribute("data-phase", "lit");
}
