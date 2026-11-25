import assert from "node:assert/strict";
import test from "node:test";
import { checkCount, nextRound, startCounting, suggestedStar, supportFor, targetFor, toggleStar } from "../src/activities/stars/logic.js";

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

test("mantém as escolhas após a primeira tentativa e sugere como corrigir excesso", () => {
  const start = startCounting(configuration);
  const extra = [3, 0].reduce(toggleStar, start);
  const retry = checkCount(extra);
  const hint = checkCount(retry);

  assert.deepEqual(retry.selected, [3, 0]);
  assert.equal(supportFor(retry), "retry");
  assert.equal(supportFor(hint), "hint");
  assert.equal(suggestedStar(hint), 0);
  const confirmed = checkCount(toggleStar(hint, 0));
  assert.equal(confirmed.confirmed, true);
});

test("orienta um passo por vez até a quantidade solicitada", () => {
  let state = startCounting({ targets: [3], starCount: 5 });
  state = checkCount(checkCount(checkCount(state)));
  assert.equal(supportFor(state), "guided");
  assert.equal(suggestedStar(state), 0);

  for (let count = 1; count <= 3; count++) {
    state = checkCount(state);
    assert.equal(state.selected.length, count);
    assert.equal(state.confirmed, false);
  }
  assert.equal(suggestedStar(state), null);
  assert.equal(checkCount(state).confirmed, true);
});

test("avança de 1 a 5 somente após conferir e encerra depois da última rodada", () => {
  let state = startCounting(configuration);

  for (const target of configuration.targets) {
    assert.equal(targetFor(state), target);
    assert.deepEqual(state.selected, []);
    assert.equal(supportFor(state), "none");
    assert.equal(nextRound(state), state);

    for (let index = 0; index < target; index++) state = toggleStar(state, index);
    const confirmed = checkCount(state);
    assert.equal(confirmed.confirmed, true);
    assert.equal(toggleStar(confirmed, 0), confirmed);
    state = nextRound(confirmed);
  }

  assert.equal(state, null);
});

test("valida os limites das quantidades configuradas", () => {
  for (const targets of [[], [0], [6], [1.5]]) {
    assert.throws(() => startCounting({ targets, starCount: 5 }), RangeError);
  }
  assert.throws(() => startCounting({ targets: [5], starCount: 4 }), RangeError);
});
