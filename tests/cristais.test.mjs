import assert from "node:assert/strict";
import test from "node:test";
import {
  challengeFor, chooseGenerator, chooseNumber, crystalConfiguration, energize, moveCrystal, nextCharge,
  requestHelp, startCrystals, suggestedTransfer, targetFor,
} from "../src/activities/crystals/logic.js";

function fill(state, amount) {
  for (let id = 0; id < amount; id++) state = moveCrystal(state, id, "generator");
  return state;
}

const charge = (target, initial = 0) => ({ type: "charge", target, initial });
const compare = (loads, relation = "more") => ({ type: "compare", loads, relation });

test("as visitas têm cinco situações válidas e equilibram relação e lado", () => {
  const layouts = [];
  const targets = new Set();
  const positions = new Set();
  for (let visit = 0; visit < 4; visit++) {
    const { challenges } = crystalConfiguration(visit);
    const [build, complete, excess, comparison, final] = challenges;
    assert.equal(challenges.length, 5);
    assert.equal(build.initial, 0);
    assert.ok(complete.initial > 0 && complete.initial < complete.target);
    assert.ok(excess.initial > excess.target);
    assert.equal(comparison.type, "compare");
    assert.equal(final.type, "charge");
    assert.notEqual(final.target, excess.target);
    startCrystals({ challenges });
    for (const challenge of [build, complete, excess, final]) targets.add(challenge.target);
    const [left, right] = comparison.loads;
    positions.add(`${comparison.relation}:${left > right ? "left" : "right"}`);
    layouts.push(JSON.stringify(challenges));
  }
  assert.equal(new Set(layouts).size, 4);
  assert.equal(positions.size, 4);
  assert.deepEqual([...targets].sort(), [1, 2, 3, 4, 5]);
  assert.deepEqual(crystalConfiguration(4), crystalConfiguration(0));
});

test("rejeita configurações sem ação, quantidades impossíveis e comparações inválidas", () => {
  for (const challenges of [
    [], [charge(0)], [charge(6)], [charge(2.5)], [charge(3, 3)], [charge(4, 6)],
    [compare([2, 2])], [compare([0, 3])], [compare([2, 6])], [compare([2, 3], "equal")],
  ]) assert.throws(() => startCrystals({ challenges }), RangeError);
});

test("abre os numerais ao atingir a carga certa e cancela a escolha ao reorganizar", () => {
  const start = startCrystals({ challenges: [charge(2)] });
  const loaded = fill(start, 2);
  assert.deepEqual(start.loaded, []);
  assert.deepEqual(loaded.loaded, [0, 1]);
  assert.equal(loaded.phase, "number");
  assert.equal(moveCrystal(loaded, 1, "generator"), loaded);
  assert.equal(moveCrystal(loaded, 5, "generator"), loaded);

  const numbered = chooseNumber(loaded, 2);
  const changed = moveCrystal(numbered, 0, "reserve");
  assert.equal(changed.phase, "collect");
  assert.deepEqual(changed.loaded, [1]);
  assert.equal(energize(changed), changed);
  assert.equal(moveCrystal(changed, 0, "generator").phase, "number");
});

test("a ajuda distingue falta e excesso sem transferir cristais", () => {
  let guided = startCrystals({ challenges: [charge(3)] });
  for (const level of [1, 2, 3, 3]) {
    guided = requestHelp(guided);
    assert.equal(guided.attempts, level);
    assert.deepEqual(guided.loaded, []);
    assert.deepEqual(suggestedTransfer(guided), level === 3 ? { id: 0, destination: "generator" } : null);
  }
  for (let count = 1; count <= 3; count++) {
    const { id, destination } = suggestedTransfer(guided);
    guided = moveCrystal(guided, id, destination);
    assert.equal(guided.loaded.length, count);
    assert.equal(guided.phase, count === 3 ? "number" : "collect");
  }
  assert.equal(suggestedTransfer(guided), null);

  const excess = requestHelp(fill(startCrystals({ challenges: [charge(3)] }), 5));
  assert.equal(excess.phase, "collect");
  assert.deepEqual(suggestedTransfer(excess), { id: 4, destination: "reserve" });
  assert.equal(requestHelp(excess), excess);
  const corrected = moveCrystal(excess, 4, "reserve");
  assert.equal(corrected.loaded.length, 4);
  assert.equal(moveCrystal(corrected, 3, "reserve").phase, "number");
});

test("pedir ajuda no numeral e na ativação mantém a ação explícita da criança", () => {
  let state = fill(startCrystals({ challenges: [charge(2)] }), 2);
  for (const level of [1, 2, 3]) {
    state = requestHelp(state);
    assert.equal(state.phase, "number");
    assert.equal(state.attempts, level);
    assert.equal(energize(state), state);
  }
  const ready = chooseNumber(state, 2);
  assert.equal(ready.attempts, 0);
  const assisted = requestHelp(ready);
  assert.equal(assisted.phase, "activate");
  assert.equal(assisted.attempts, 1);
  assert.deepEqual(assisted.loaded, [0, 1]);
  const powered = energize(assisted);
  assert.equal(powered.phase, "powered");
  assert.equal(requestHelp(powered), powered);
});

test("só libera a energização com a quantidade e o número corretos", () => {
  for (let count = 1; count <= 5; count++) {
    const initial = startCrystals({ challenges: [charge(count)] });
    const numbers = fill(initial, count);
    assert.equal(numbers.phase, "number");
    assert.equal(energize(numbers), numbers);

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

test("completa e reduz usando apenas os cinco cristais, com correção em ambas as direções", () => {
  let state = startCrystals({ challenges: [charge(4, 2), charge(3, 5)] });
  assert.deepEqual(state.loaded, [0, 1]);
  state = moveCrystal(state, 1, "reserve");
  assert.deepEqual(state.loaded, [0]);
  state = fill(state, 4);
  assert.equal(state.phase, "number");

  state = nextCharge(energize(chooseNumber(state, 4)));
  assert.deepEqual(state.loaded, [0, 1, 2, 3, 4]);
  assert.equal(moveCrystal(state, 5, "generator"), state);
  assert.equal(nextCharge(state), state);
  for (let level = 0; level < 3; level++) state = requestHelp(state);
  assert.deepEqual(suggestedTransfer(state), { id: 4, destination: "reserve" });
  state = moveCrystal(moveCrystal(state, 4, "reserve"), 1, "reserve");
  assert.equal(state.phase, "number");
  state = moveCrystal(state, 2, "reserve");
  assert.equal(state.phase, "collect");
  state = moveCrystal(state, 4, "generator");
  assert.deepEqual(state.loaded, [0, 3, 4]);
  assert.equal(nextCharge(energize(chooseNumber(state, 3))), null);
});

test("compara mais e menos nos dois lados e permite corrigir sem confirmar", () => {
  for (const relation of ["more", "less"]) {
    for (const loads of [[2, 4], [4, 2]]) {
      const state = startCrystals({ challenges: [compare(loads, relation)] });
      const correct = (loads[0] > loads[1]) === (relation === "more") ? 0 : 1;
      const firstHint = requestHelp(state);
      assert.equal(firstHint.attempts, 1);
      const wrong = chooseGenerator(firstHint, 1 - correct);
      assert.equal(wrong.phase, "compare");
      assert.equal(wrong.attempts, 2);
      assert.equal(nextCharge(wrong), wrong);
      assert.equal(moveCrystal(wrong, 0, "generator"), wrong);
      assert.equal(chooseNumber(wrong, 2), wrong);
      const guided = requestHelp(wrong);
      assert.equal(guided.phase, "compare");
      assert.equal(guided.chosen, undefined);
      const solved = chooseGenerator(guided, correct);
      assert.equal(solved.chosen, correct);
      assert.equal(solved.phase, "compared");
      assert.equal(nextCharge(solved), null);
    }
  }
});

test("avança os cinco desafios e encerra somente após resolver a rodada final", () => {
  const configuration = crystalConfiguration(0);
  let state = startCrystals(configuration);
  for (const challenge of configuration.challenges) {
    assert.deepEqual(challengeFor(state), challenge);
    assert.equal(nextCharge(state), state);
    if (challenge.type === "compare") {
      state = nextCharge(chooseGenerator(state, 0));
      continue;
    }

    const { initial, target } = challenge;
    assert.equal(targetFor(state), target);
    assert.equal(state.loaded.length, initial);
    if (initial < target) state = fill(state, target);
    else for (let id = target; id < initial; id++) state = moveCrystal(state, id, "reserve");
    state = nextCharge(energize(chooseNumber(state, target)));
  }
  assert.equal(state, null);
});
