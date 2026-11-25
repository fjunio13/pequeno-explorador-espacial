import assert from "node:assert/strict";
import { stat } from "node:fs/promises";
import test from "node:test";
import { audioUrl, effects, messages } from "../src/services/audio-catalog.js";
import { createAudioService } from "../src/services/audio.js";

test("cada mensagem e efeito do catálogo tem um MP3 local", async () => {
  const files = [...Object.keys(messages), ...effects];
  for (const id of files) {
    const path = new URL(audioUrl(id));
    assert.equal(path.protocol, "file:");
    assert.ok((await stat(path)).size > 0, id);
  }
});

test("o áudio mais recente prevalece e Ouvir repete a instrução da tela", async () => {
  const calls = [];
  const unavailable = [];
  const player = {
    src: "",
    pause() {},
    play() {
      const request = Promise.withResolvers();
      calls.push({ ...request, src: this.src });
      return request.promise;
    },
    hasAttribute() { return Boolean(this.src); },
    removeAttribute() { this.src = ""; },
    load() {},
  };

  const service = createAudioService(player, (value) => unavailable.push(value));
  const instruction = service.instruct("pedido-2");
  const count = service.play("contagem-1");
  calls[0].reject(new Error("Reprodução substituída"));
  calls[1].resolve();
  assert.equal(await instruction, false);
  assert.equal(await count, true);
  assert.deepEqual(unavailable, [false, false]);

  const replay = service.repeat();
  assert.equal(calls[2].src, audioUrl("pedido-2"));
  calls[2].resolve();
  assert.equal(await replay, true);

  const failure = service.play("pista");
  calls[3].reject(new Error("Falha de áudio"));
  assert.equal(await failure, false);
  assert.equal(unavailable.at(-1), true);

  service.stop();
  assert.equal(unavailable.at(-1), false);
  assert.equal(player.src, "");
  assert.equal(service.repeat(), undefined);
});
