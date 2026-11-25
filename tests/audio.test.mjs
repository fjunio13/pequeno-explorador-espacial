import assert from "node:assert/strict";
import { stat } from "node:fs/promises";
import test from "node:test";
import { audioUrl, effects, messages } from "../src/services/audio-catalog.js";
import { createAudioService } from "../src/services/audio.js";

class TestPlayer extends EventTarget {
  #source = "";
  ended = false;
  error = null;
  calls = [];

  get src() { return this.#source; }
  set src(value) {
    this.#source = value;
    this.ended = false;
    this.error = null;
  }

  pause() {}
  play() {
    const request = Promise.withResolvers();
    this.calls.push({ ...request, src: this.src });
    return request.promise;
  }
  hasAttribute() { return Boolean(this.src); }
  removeAttribute() { this.src = ""; }
  load() {}
  complete() {
    this.ended = true;
    this.dispatchEvent(new Event("ended"));
  }
}

test("cada mensagem e efeito do catálogo tem um MP3 local", async () => {
  const files = [...Object.keys(messages), ...effects];
  for (const id of files) {
    const path = new URL(audioUrl(id));
    assert.equal(path.protocol, "file:");
    assert.ok((await stat(path)).size > 0, id);
  }
});

test("a instrução prioritária aguarda o fim real da fala em curso", async () => {
  const player = new TestPlayer();
  const unavailable = [];
  const service = createAudioService(player, (value) => unavailable.push(value));
  const first = service.instruct("pedido-2");
  const queued = service.instruct("acerto-2", { afterCurrent: true });
  player.calls[0].resolve();

  await Promise.resolve();
  assert.equal(player.src, audioUrl("pedido-2"));
  assert.equal(service.playIfIdle("contagem-1"), undefined);
  assert.equal(player.calls.length, 1);

  player.complete();
  assert.equal(await first, true);
  assert.equal(player.src, audioUrl("acerto-2"));
  player.complete();
  assert.equal(await queued, true);

  const replay = service.repeat();
  assert.equal(player.calls[2].src, audioUrl("acerto-2"));
  player.complete();
  assert.equal(await replay, true);
  assert.deepEqual(unavailable, [false, false, false]);
});

test("trocar ou sair da instrução descarta a fala que aguardava", async () => {
  const player = new TestPlayer();
  const service = createAudioService(player, () => {});
  const first = service.instruct("pedido-2");
  const old = service.instruct("acerto-2", { afterCurrent: true });
  const recent = service.instruct("pista", { afterCurrent: true });

  player.complete();
  await first;
  assert.equal(await old, false);
  assert.equal(player.calls.length, 2);
  assert.equal(player.src, audioUrl("pista"));

  const next = service.instruct("pedido-3", { afterCurrent: true });
  service.stop();
  assert.equal(await recent, false);
  assert.equal(await next, false);
  assert.equal(player.src, "");
  assert.equal(service.repeat(), undefined);
});

test("distingue interrupção voluntária, erro de mídia e início sem progresso", async (context) => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  const player = new TestPlayer();
  const unavailable = [];
  const service = createAudioService(player, (value) => unavailable.push(value));

  const old = service.instruct("pedido-2");
  const active = service.instruct("acerto-2");
  player.calls[0].reject(new Error("Fonte substituída"));
  assert.equal(await old, false);
  assert.deepEqual(unavailable, [false, false]);

  service.interrupt("acerto-2");
  assert.equal(await active, false);
  assert.equal(unavailable.at(-1), false);

  const failed = service.instruct("pista");
  player.error = { code: 4 };
  player.dispatchEvent(new Event("error"));
  assert.equal(await failed, false);
  assert.equal(unavailable.at(-1), true);

  const stalled = service.instruct("pedido-1");
  context.mock.timers.tick(5900);
  player.dispatchEvent(new Event("timeupdate"));
  context.mock.timers.tick(5900);
  assert.equal(unavailable.at(-1), false);
  context.mock.timers.tick(200);
  assert.equal(await stalled, false);
  assert.equal(unavailable.at(-1), true);

  const blocked = service.repeat();
  player.calls.at(-1).reject(new Error("Reprodução bloqueada"));
  assert.equal(await blocked, false);
  assert.equal(unavailable.at(-1), true);
});
