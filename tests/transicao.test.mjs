import assert from "node:assert/strict";
import test from "node:test";
import { createRoundAdvance } from "../src/activities/round-advance.js";

test("aguarda o feedback e reinicia a pausa quando o áudio é repetido", async (context) => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  let advances = 0;
  const transition = createRoundAdvance(() => { advances++; });
  const original = Promise.withResolvers();
  const scheduled = transition.schedule(original.promise);
  context.mock.timers.tick(5000);
  assert.equal(advances, 0);

  original.resolve(true);
  await scheduled;
  context.mock.timers.tick(500);
  assert.equal(advances, 0);
  const replay = Promise.withResolvers();
  const repeated = transition.schedule(replay.promise);
  context.mock.timers.tick(5000);
  assert.equal(advances, 0);

  replay.resolve(true);
  await repeated;
  context.mock.timers.tick(650);
  assert.equal(advances, 1);
});

test("cancela antes e depois do áudio e mantém o resultado legível se a mídia falhar", async (context) => {
  context.mock.timers.enable({ apis: ["setTimeout"] });
  let advances = 0;
  const transition = createRoundAdvance(() => { advances++; });
  const feedback = Promise.withResolvers();
  const scheduled = transition.schedule(feedback.promise);
  transition.cancel();
  feedback.resolve(false);
  await scheduled;
  context.mock.timers.tick(1000);
  assert.equal(advances, 0);

  await transition.schedule(false);
  transition.cancel();
  context.mock.timers.tick(1000);
  assert.equal(advances, 0);

  await transition.schedule(false);
  context.mock.timers.tick(1399);
  assert.equal(advances, 0);
  context.mock.timers.tick(1);
  assert.equal(advances, 1);
});
