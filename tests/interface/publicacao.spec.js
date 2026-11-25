import { expect, test } from "@playwright/test";
import { mkdir, readFile, rename } from "node:fs/promises";
import { basename, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { preparePages } from "../../scripts/preparar-pages.mjs";

test("carrega HTML, módulos importados e mídia da mesma revisão ao trocar a publicação", async ({ page, baseURL }, info) => {
  const previous = "a".repeat(40);
  const next = "b".repeat(40);
  const published = info.outputPath("site");
  const replacement = info.outputPath("nova-revisao");
  await mkdir(info.outputDir, { recursive: true });
  await preparePages(published, previous);
  await preparePages(replacement, next);

  const project = fileURLToPath(new URL("../../", import.meta.url));
  const subdirectory = relative(project, published).split(sep).map(encodeURIComponent).join("/");
  const address = new URL(subdirectory + "/", baseURL);
  const requests = [];
  const errors = [];
  page.on("request", (request) => requests.push(new URL(request.url())));
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("response", (response) => {
    if (response.status() >= 400) errors.push(response.url());
  });

  async function load(revision, url) {
    requests.length = 0;
    await page.goto(url.href);
    const label = page.locator(".game-version");
    await expect(label).toHaveText("Revisão " + revision.slice(0, 7));
    await expect(label).toHaveAttribute("title", revision);
    await page.getByRole("button", { name: "Começar" }).tap();
    const path = new URL("revisoes/" + revision + "/", address);
    await expect(page.locator("#game-audio")).toHaveAttribute("src", new URL("assets/audio/mapa.mp3", path).href);
    await expect.poll(() => page.locator("#game-audio").evaluate((node) => node.currentTime)).toBeGreaterThan(0);

    const files = requests.filter((request) => /\.(js|css|mp3|webp)$/.test(request.pathname));
    expect(files.every((request) => request.href.startsWith(path.href))).toBe(true);
    const loaded = files.map((request) => request.href.slice(path.href.length));
    expect(loaded).toEqual(expect.arrayContaining([
      "src/main.js", "src/core/game.js", "src/activities/stars/index.js",
      "src/ui/styles.css", "assets/audio/mapa.mp3",
    ]));
    expect(files.some((request) => basename(request.pathname) === "astronauta-e-nave.webp")).toBe(true);
  }

  await load(previous, address);
  await rename(published, info.outputPath("revisao-retirada"));
  await rename(replacement, published);
  expect(await readFile(info.outputPath("site/versao.txt"), "utf8")).toBe(next + "\n");

  // Uma entrada antiga no cache pode conservar o endereço da revisão retirada.
  const refreshed = new URL(address);
  refreshed.searchParams.set("revisao", next);
  await load(next, refreshed);

  await page.goto(new URL("revisoes/" + next + "/", address).href);
  await expect(page.locator(".game-version")).toHaveText("Revisão " + next.slice(0, 7));
  expect(errors).toEqual([]);
});
