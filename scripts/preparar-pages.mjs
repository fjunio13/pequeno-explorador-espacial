import { cp, mkdir, readFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

export async function preparePages(destination, revision) {
  if (!/^[a-f0-9]{40}$/.test(revision)) {
    throw new Error("Informe o SHA completo de uma revisão do jogo.");
  }

  const entry = await readFile(new URL("../index.html", import.meta.url), "utf8");
  const stamped = entry.replace("<html ", `<html data-revisao="${revision}" `);
  const revisionPath = `revisoes/${revision}`;
  const rootEntry = stamped.replace(/\b(href|src)="\.\/(src|assets)\//g, `$1="./${revisionPath}/$2/`);
  const release = join(destination, revisionPath);

  // A saída nova impede que uma revisão anterior seja incluída no artefato.
  await mkdir(destination);
  await mkdir(release, { recursive: true });
  await Promise.all([
    cp(new URL("../src/", import.meta.url), join(release, "src"), { recursive: true }),
    cp(new URL("../assets/", import.meta.url), join(release, "assets"), { recursive: true }),
    writeFile(join(destination, "index.html"), rootEntry),
    writeFile(join(release, "index.html"), stamped),
    writeFile(join(destination, ".nojekyll"), ""),
    writeFile(join(destination, "versao.txt"), `${revision}\n`),
  ]);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  await preparePages(resolve(process.argv[3] ?? "_site"), process.argv[2]);
}
