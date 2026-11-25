import assert from "node:assert/strict";
import test from "node:test";
import {
  hasTarget, nextRound, requestHelp, startCounting, suggestedStar, supportFor,
  starConfiguration, targetFor, toggleStar,
} from "../src/activities/stars/logic.js";

const configuration = { targets: [1, 2, 3, 4, 5], starCount: 5 };

test("configura seis rodadas com abertura de uma estrela e repetição espaçada", () => {
  for (const random of [() => 0, () => 0.5, () => 0.999]) {
    for (let visit = 0; visit < 8; visit++) {
      const { targets, starCount } = starConfiguration(visit, random);
      assert.equal(starCount, 5);
      assert.equal(targets.length, 6);
      assert.equal(targets[0], 1);
      assert.deepEqual([...new Set(targets.slice(1))].sort(), [2, 3, 4, 5]);
      assert.ok(targets.every((target, index) => target !== targets[index - 1]));
    }
  }
});

test("varia a ordem e percorre os quatro números repetidos em visitas sucessivas", () => {
  const orders = [0, 0.2, 0.5, 0.8, 0.999].map((value) => starConfiguration(0, () => value).targets.join());
  assert.ok(new Set(orders).size > 1);

  const repetitions = Array.from({ length: 5 }, (_, visit) => {
    const { targets } = starConfiguration(visit, () => 0);
    return targets.find((target, index) => targets.indexOf(target) !== index);
  });
  assert.deepEqual(repetitions, [2, 3, 4, 5, 2]);
});

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
  assert.equal(supportFor(extra), "orient");
  assert.equal(nextRound(extra), extra);

  const hint = requestHelp(extra);
  assert.equal(supportFor(hint), "hint");
  assert.equal(suggestedStar(hint), null);
  const guided = requestHelp(hint);
  assert.equal(suggestedStar(guided), 0);
  assert.equal(hasTarget(toggleStar(guided, 0)), true);
  assert.equal(hasTarget(toggleStar(matched, 3)), false);
});

test("orienta desde a primeira escolha e a ajuda guiada mantém a seleção com a criança", () => {
  let state = startCounting({ targets: [3], starCount: 5 });
  for (const level of ["orient", "hint", "guided", "guided"]) {
    state = requestHelp(state);
    assert.equal(supportFor(state), level);
    assert.deepEqual(state.selected, []);
    assert.equal(suggestedStar(state), level === "guided" ? 0 : null);
  }
  for (let count = 1; count <= 3; count++) {
    state = toggleStar(state, suggestedStar(state));
    assert.equal(state.selected.length, count);
    assert.equal(hasTarget(state), count === 3);
  }
  assert.equal(suggestedStar(state), null);
  assert.equal(requestHelp(state), state);
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
