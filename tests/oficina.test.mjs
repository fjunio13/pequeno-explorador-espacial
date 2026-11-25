import assert from "node:assert/strict";
import test from "node:test";
import { energyConfiguration, lastEnergyBand } from "../src/activities/energy/configuration.js";
import { feedbackFor } from "../src/activities/energy/feedback.js";
import {
  addModule, chooseCharge, correctSide, energyTotal, isSolved, removeModule, requestHelp, startChallenge, suggestion, tenFrames,
} from "../src/activities/energy/logic.js";
import { messages } from "../src/services/audio-catalog.js";

const first = (band, visit = 0) => startChallenge(energyConfiguration(band, visit)[0]);
const load = (state, pieces) => pieces.reduce(addModule, state);

test("as visitas curtas cobrem os numerais de 6 a 20 nas três faixas", () => {
  const covered = [];
  for (let band = 0; band <= lastEnergyBand; band++) {
    for (let visit = 0; visit < 5; visit++) {
      const [build, complete, compare] = energyConfiguration(band, visit);
      assert.deepEqual([build.mode, complete.mode, compare.mode], ["build", "complete", "compare"]);
      assert.ok(compare.loads.every((value) => value >= 6 + band * 5 && value <= 10 + band * 5));
      assert.notEqual(...compare.loads);
      for (const challenge of [build, complete, compare]) {
        assert.ok(Object.hasOwn(messages, feedbackFor(startChallenge(challenge)).cue));
      }
      covered.push(build.target);

      let state = startChallenge(build);
      for (let step = 0; step < 6 && energyTotal(state) < build.target; step++) {
        const difference = build.target - energyTotal(state);
        state = addModule(state, Math.max(...build.modules.filter((value) => value <= difference)));
      }
      assert.equal(isSolved(state), true);
      assert.ok(state.pieces.length <= 6);
    }
  }
  assert.deepEqual(covered.sort((a, b) => a - b), Array.from({ length: 15 }, (_, i) => i + 6));
});

test("as fileiras de cinco e os painéis de dez representam exatamente a quantidade", () => {
  assert.deepEqual(tenFrames(7, 10), [[5, 2]]);
  assert.deepEqual(tenFrames(18, 20), [[5, 5], [5, 3]]);
  assert.deepEqual(tenFrames(20, 20), [[5, 5], [5, 5]]);
  for (const capacity of [10, 20]) {
    for (let value = 0; value <= capacity; value++) {
      const rows = tenFrames(value, capacity).flat();
      assert.equal(rows.length, capacity / 5);
      assert.ok(rows.every((count) => count >= 0 && count <= 5));
      assert.equal(rows.reduce((sum, count) => sum + count, 0), value);
    }
  }
  for (const args of [[-1, 10], [21, 20], [7.5, 10], [6, 15]]) {
    assert.throws(() => tenFrames(...args), RangeError);
  }
});

test("a mesma carga admite composições distintas e a retirada corrige uma resposta", () => {
  const initial = first(2);
  const pieces = load(initial, [10, 5, 1, 1, 1]);
  const other = load(initial, [5, 5, 5, 1, 1, 1]);
  assert.equal(isSolved(pieces), true);
  assert.equal(isSolved(other), true);
  assert.notDeepEqual(other.pieces, pieces.pieces);
  const corrected = removeModule(pieces, 5);
  assert.equal(energyTotal(corrected), 13);
  assert.equal(isSolved(corrected), false);
  assert.equal(isSolved(addModule(corrected, 5)), true);
  assert.equal(removeModule(corrected, 5), corrected);
  assert.deepEqual(initial.pieces, []);
});

test("o excesso permite correção e o limite do painel preserva os módulos", () => {
  const initial = first(2);
  assert.equal(addModule(initial, 3), initial);
  const excess = load(initial, [10, 10]);
  assert.equal(energyTotal(excess), 20);
  assert.equal(isSolved(excess), false);
  assert.equal(excess.issue, "excess");
  const blocked = addModule(excess, 1);
  assert.equal(blocked.issue, "space");
  assert.deepEqual(blocked.pieces, [10, 10]);
  const guided = requestHelp(blocked);
  assert.deepEqual(suggestion(guided), { action: "remove", value: 10 });
  const corrected = removeModule(guided, 10);
  assert.deepEqual(suggestion(corrected), { action: "add", value: 5 });
  assert.equal(isSolved(load(corrected, [5, 1, 1, 1])), true);
});

test("completa um ou dois painéis com um grupo ou com unidades adicionais", () => {
  for (const band of [0, 1, 2]) {
    for (let visit = 0; visit < 5; visit++) {
      const challenge = energyConfiguration(band, visit)[1];
      const initial = startChallenge(challenge);
      const missing = challenge.target - challenge.start;
      assert.equal(removeModule(initial, 1), initial);
      assert.equal(addModule(initial, 5).issue, "space");
      assert.equal(isSolved(addModule(initial, missing)), true);
      const filled = load(initial, Array(missing).fill(1));
      assert.equal(isSolved(filled), true);
      assert.equal(isSolved(removeModule(filled, 1)), false);
      assert.equal(addModule(filled, 1), filled);
    }
  }
});

test("compara mais e menos, orienta escolhas e conserva a decisão da criança", () => {
  for (const relation of ["more", "less"]) {
    const challenge = { mode: "compare", loads: [12, 17], capacity: 20, relation };
    const correct = relation === "more" ? 1 : 0;
    assert.equal(correctSide(challenge), correct);
    let state = chooseCharge(startChallenge(challenge), 1 - correct);
    assert.equal(isSolved(state), false);
    assert.equal(suggestion(state), null);
    for (let press = 0; press < 4; press++) state = requestHelp(state);
    assert.equal(state.attempts, 3);
    assert.equal(state.choice, 1 - correct);
    assert.deepEqual(suggestion(state), { action: "choose", value: correct });
    const solved = chooseCharge(state, correct);
    assert.equal(isSolved(solved), true);
    assert.equal(isSolved(chooseCharge(solved, 1 - correct)), false);
  }
});
