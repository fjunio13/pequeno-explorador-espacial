import { basename, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

const projectDirectory = dirname(fileURLToPath(import.meta.url));
const projectPath = encodeURIComponent(basename(projectDirectory));
const baseURL = `http://127.0.0.1:4173/${projectPath}/`;
const python = process.platform === "win32" ? "py -3" : "python3";

export default defineConfig({
  testDir: "./tests/interface",
  use: {
    ...devices["Pixel 7 landscape"],
    baseURL,
  },
  webServer: {
    command: `${python} -m http.server 4173 --bind 127.0.0.1 --directory ..`,
    url: baseURL,
  },
});
