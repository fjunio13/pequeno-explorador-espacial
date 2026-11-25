import assert from "node:assert/strict";
import test from "node:test";
import {
  demonstrateStar, hasTarget, nextRound, requestHelp, startCounting, suggestedStar, supportFor,
  targetFor, toggleStar,
} from "../src/activities/stars/logic.js";

const configuration = { targets: [1, 2, 3, 4, 5], starCount: 5 };

test("mantém a ordem de toque e permite desmarcar sem duplicar estrelas", () => {
  const start = startCounting(configuration);
  const selected = [4, 1, 3].reduce(toggleStar, start);

  assert.deepEqual(start.selected, []);
  assert.deepEqual(selected.selected, [4, 1, 3]);
  assert.deepEqual(toggleStar(selected, 1).selected, [4, 3]);
  assert.equal(toggleStar(selected, 5), selected);
  assert.equal(toggleStar(selected, -1), selected);
});

test("pode corrigir a seleção mesmo depois de atingir a quantidade", () => {
  const start = startCounting(configuration);
  const matched = toggleStar(start, 3);
  assert.equal(hasTarget(matched), true);

  const extra = toggleStar(matched, 0);
  assert.deepEqual(extra.selected, [3, 0]);
  assert.equal(supportFor(extra), "retry");
  assert.equal(nextRound(extra), extra);

  const hint = requestHelp(extra);
  assert.equal(supportFor(hint), "hint");
  assert.equal(suggestedStar(hint), 0);
  assert.equal(hasTarget(toggleStar(hint, 0)), true);
  assert.equal(hasTarget(toggleStar(matched, 3)), false);
});

test("orienta a seleção de uma estrela por ação até a quantidade solicitada", () => {
  let state = startCounting({ targets: [3], starCount: 5 });
  state = requestHelp(state);
  assert.equal(supportFor(state), "hint");
  assert.equal(demonstrateStar(state), state);

  state = requestHelp(state);
  assert.equal(supportFor(state), "guided");
  assert.equal(suggestedStar(state), 0);
  for (let count = 1; count <= 3; count++) {
    state = demonstrateStar(state);
    assert.equal(state.selected.length, count);
    assert.equal(hasTarget(state), count === 3);
  }
  assert.equal(suggestedStar(state), null);
  assert.equal(demonstrateStar(state), state);
});

test("aceita as quantidades de 1 a 5 e encerra depois da última rodada", () => {
  let state = startCounting(configuration);

  for (const target of configuration.targets) {
    assert.equal(targetFor(state), target);
    assert.deepEqual(state.selected, []);
    assert.equal(supportFor(state), "none");
    assert.equal(nextRound(state), state);

    for (let index = 0; index < target; index++) state = toggleStar(state, index);
    assert.equal(hasTarget(state), true);
    state = nextRound(state);
  }

  assert.equal(state, null);
});

test("valida os limites das quantidades configuradas", () => {
  for (const targets of [[], [0], [6], [1.5]]) {
    assert.throws(() => startCounting({ targets, starCount: 5 }), RangeError);
  }
  assert.throws(() => startCounting({ targets: [5], starCount: 4 }), RangeError);
});
