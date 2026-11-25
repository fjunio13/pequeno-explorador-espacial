import assert from "node:assert/strict";
import test from "node:test";
import {
  chooseNumber, confirmLoad, crystalConfiguration, demonstrateTransfer, energize, moveCrystal,
  nextCharge, startCrystals, suggestedTransfer, targetFor,
} from "../src/activities/crystals/logic.js";

function fill(state, amount) {
  for (let id = 0; id < amount; id++) state = moveCrystal(state, id, "generator");
  return state;
}

test("as duas rotas curtas incluem todas as quantidades de 1 a 5", () => {
  const first = crystalConfiguration(0).targets;
  const second = crystalConfiguration(1).targets;
  assert.equal(first.length, 3);
  assert.equal(second.length, 3);
  assert.deepEqual([...new Set([...first, ...second])].sort(), [1, 2, 3, 4, 5]);
  for (const targets of [[], [0], [6], [2.5]]) {
    assert.throws(() => startCrystals({ targets }), RangeError);
  }
});

test("mantém cada cristal em uma zona e permite corrigir depois de conferir", () => {
  const start = startCrystals({ targets: [2] });
  const loaded = fill(start, 2);
  assert.deepEqual(start.loaded, []);
  assert.deepEqual(loaded.loaded, [0, 1]);
  assert.equal(moveCrystal(loaded, 1, "generator"), loaded);
  assert.equal(moveCrystal(loaded, 5, "generator"), loaded);

  const numbered = chooseNumber(confirmLoad(loaded), 2);
  const changed = moveCrystal(numbered, 0, "reserve");
  assert.equal(changed.phase, "collect");
  assert.deepEqual(changed.loaded, [1]);
  assert.equal(energize(changed), changed);
});

test("distingue falta e excesso, com ajuda de um cristal por toque", () => {
  const start = startCrystals({ targets: [3] });
  const retry = confirmLoad(start);
  assert.equal(retry.attempts, 1);
  assert.equal(suggestedTransfer(retry), null);

  const hint = confirmLoad(retry);
  assert.deepEqual(suggestedTransfer(hint), { id: 0, destination: "generator" });
  assert.equal(demonstrateTransfer(hint), hint);

  let guided = confirmLoad(hint);
  for (let count = 1; count <= 3; count++) {
    guided = demonstrateTransfer(guided);
    assert.equal(guided.loaded.length, count);
    assert.equal(guided.phase, "collect");
  }
  assert.equal(suggestedTransfer(guided), null);
  assert.equal(confirmLoad(guided).phase, "number");

  const excess = fill(start, 5);
  const excessHint = confirmLoad(confirmLoad(excess));
  assert.deepEqual(suggestedTransfer(excessHint), { id: 4, destination: "reserve" });
  assert.equal(demonstrateTransfer(confirmLoad(excessHint)).loaded.length, 4);
});

test("só libera a energização com a quantidade e o número corretos", () => {
  for (let count = 1; count <= 5; count++) {
    const initial = startCrystals({ targets: [count] });
    const numbers = confirmLoad(fill(initial, count));
    assert.equal(numbers.phase, "number");

    const wrong = count === 5 ? 4 : count + 1;
    const attempt = chooseNumber(numbers, wrong);
    assert.equal(attempt.attempts, 1);
    assert.equal(energize(attempt), attempt);
    assert.equal(chooseNumber(attempt, 0), attempt);
    assert.equal(chooseNumber(attempt, 6), attempt);

    const ready = chooseNumber(attempt, count);
    assert.equal(ready.phase, "activate");
    assert.equal(nextCharge(ready), ready);
    const powered = energize(ready);
    assert.equal(powered.phase, "powered");
    assert.equal(moveCrystal(powered, 0, "reserve"), powered);
    assert.equal(nextCharge(powered), null);
  }
});

test("pede uma nova carga a cada rodada e conclui somente após a última ação", () => {
  const configuration = crystalConfiguration(0);
  let state = startCrystals(configuration);
  for (const target of configuration.targets) {
    assert.equal(targetFor(state), target);
    assert.equal(state.phase, "collect");
    assert.deepEqual(state.loaded, []);
    state = nextCharge(energize(chooseNumber(confirmLoad(fill(state, target)), target)));
  }
  assert.equal(state, null);
});
