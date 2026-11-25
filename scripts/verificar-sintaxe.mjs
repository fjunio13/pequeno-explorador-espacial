import { spawnSync } from "node:child_process";
import { globSync } from "node:fs";

const paths = globSync([
  "src/**/*.{js,mjs}",
  "tests/**/*.{js,mjs}",
  "scripts/**/*.{js,mjs}",
  "playwright.config.js",
]);

for (const path of paths) {
  const { status } = spawnSync(process.execPath, ["--check", path], { stdio: "inherit" });
  if (status !== 0) process.exit(status ?? 1);
}

console.log(`Sintaxe verificada em ${paths.length} arquivos JavaScript.`);
