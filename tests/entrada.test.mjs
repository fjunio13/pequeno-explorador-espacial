import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const entryFile = new URL("../index.html", import.meta.url);
const pagesEntry = new URL("https://example.github.io/pequeno-explorador-espacial/");

test("a página de entrada declara o idioma e a adaptação ao tamanho da tela", async () => {
  const html = await readFile(entryFile, "utf8");

  assert.match(html, /<html\s+lang="pt-BR">/i);
  assert.match(html, /<meta\s+name="viewport"\s+content="width=device-width,/i);
  assert.match(html, /<h1>Pequeno Explorador Espacial<\/h1>/i);
});

test("o CSS e o JavaScript carregam por caminhos relativos ao projeto", async () => {
  const html = await readFile(entryFile, "utf8");
  const tags = [...html.matchAll(/<(link|script)\b([^>]+)>/gi)];
  const styles = tags.find(([, tag, attrs]) => tag === "link" && /\brel="stylesheet"/i.test(attrs));
  const script = tags.find(([, tag, attrs]) => tag === "script" && /\btype="module"/i.test(attrs));
  const stylesheetPath = styles?.[2].match(/\bhref="([^"]+)"/i)?.[1];
  const scriptPath = script?.[2].match(/\bsrc="([^"]+)"/i)?.[1];

  assert.ok(stylesheetPath, "A página precisa referenciar a folha de estilos.");
  assert.ok(scriptPath, "A página precisa referenciar o módulo JavaScript.");

  for (const path of [stylesheetPath, scriptPath]) {
    assert.doesNotMatch(path, /^(?:[a-z][a-z0-9+.-]*:|[/\\])/i);
    const deployedUrl = new URL(path, pagesEntry);

    assert.ok(deployedUrl.href.startsWith(pagesEntry.href), path);
    await access(new URL(path, entryFile));
  }
});
