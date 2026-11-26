import assert from "node:assert/strict";
import test from "node:test";
import {
  chooseGroup, chooseNumber, discoveryConfiguration, explore, hidingPlaces, nextDiscovery, requestHelp,
  sceneFor, startDiscovery, visibleCount,
} from "../src/activities/discoveries/logic.js";

test("uma criatura se junta ao grupo em cada descoberta, até cinco", () => {
  let state = startDiscovery(discoveryConfiguration(0));
  for (const initial of [1, 3]) {
    assert.equal(visibleCount(state), initial);
    assert.equal(chooseNumber(state, initial + 1), state);

    const { hidingPlace, numbers } = sceneFor(state);
    state = explore(state, hidingPlace);
    assert.equal(state.phase, "count");
    assert.equal(visibleCount(state), initial + 1);
    assert.ok(numbers.includes(visibleCount(state)));
    assert.ok(numbers.every((number) => number >= 1 && number <= 5));
    assert.equal(explore(state, hidingPlace), state, "o mesmo lugar só revela uma criatura");
    assert.equal(nextDiscovery(state), state, "observar a chegada não decide o numeral");

    state = chooseNumber(state, initial + 1);
    assert.equal(state.phase, "lit");
    assert.equal(visibleCount(state), initial + 1);
    state = nextDiscovery(state);
  }
  assert.equal(state.phase, "compare");
});

test("explorar lugares diferentes oferece pistas sem liberar a criatura por conta própria", () => {
  let state = startDiscovery(discoveryConfiguration(0));
  const { hidingPlace } = sceneFor(state);
  const other = hidingPlaces.find((place) => place !== hidingPlace);
  assert.equal(explore(state, "sky"), state);
  state = requestHelp(state);
  assert.equal(state.attempts, 1);
  assert.equal(state.phase, "search");
  assert.equal(visibleCount(state), 1);
  for (const attempt of [2, 3, 3]) {
    state = explore(state, other);
    assert.equal(state.attempts, attempt);
    assert.equal(state.phase, "search");
    assert.equal(visibleCount(state), 1);
  }
  state = explore(state, hidingPlace);
  assert.equal(state.attempts, 0);
  assert.equal(visibleCount(state), 2);
});

test("a resposta pode ser corrigida com apoio progressivo sem perder as criaturas", () => {
  const state = startDiscovery(discoveryConfiguration(0));
  const found = explore(state, sceneFor(state).hidingPlace);
  assert.equal(chooseNumber(found, 5), found);
  const retry = chooseNumber(found, 1);
  const hint = requestHelp(retry);
  const guided = requestHelp(hint);
  assert.deepEqual([retry.attempts, hint.attempts, guided.attempts], [1, 2, 3]);
  assert.equal(guided.phase, "count");
  assert.equal(visibleCount(guided), 2);
  assert.equal(chooseNumber(guided, 2).phase, "lit");
});

test("os quatro roteiros variam esconderijos, quantidades, formações, relações e lados", () => {
  const sequences = new Set();
  const orders = new Set();
  const sides = { more: new Set(), less: new Set() };
  const shapes = new Map();
  for (let visit = 0; visit < 4; visit++) {
    const rounds = discoveryConfiguration(visit);
    assert.equal(rounds.length, 5);
    const [first, second, ...comparisons] = rounds;
    for (const encounter of [first, second]) {
      assert.equal(encounter.kind, "count");
      assert.ok(hidingPlaces.includes(encounter.hidingPlace));
      assert.ok(encounter.numbers.includes(encounter.initial + 1));
      assert.ok(encounter.numbers.every((value) => Number.isInteger(value) && value >= 1 && value <= 5));
    }
    assert.notEqual(first.hidingPlace, second.hidingPlace);
    assert.notEqual(first.layout, second.layout);
    sequences.add([first.hidingPlace, second.hidingPlace].join());
    assert.deepEqual(comparisons.map(({ relation }) => relation).sort(), ["equal", "less", "more"]);
    orders.add(comparisons.map(({ relation }) => relation).join());

    for (const { kind, groups: [left, right], relation } of comparisons) {
      assert.equal(kind, "compare");
      assert.notEqual(left.layout, right.layout);
      for (const { amount, layout } of [left, right]) {
        assert.ok(Number.isInteger(amount) && amount >= 1 && amount <= 5);
        assert.ok(["row", "clusters"].includes(layout));
        if (!shapes.has(amount)) shapes.set(amount, new Set());
        shapes.get(amount).add(layout);
      }
      if (relation === "equal") assert.equal(left.amount, right.amount);
      else {
        assert.notEqual(left.amount, right.amount);
        sides[relation].add(left.amount > right.amount ? "left" : "right");
      }
    }
  }
  assert.equal(sequences.size, 4);
  assert.equal(orders.size, 4);
  assert.equal(sides.more.size, 2);
  assert.equal(sides.less.size, 2);
  assert.equal(shapes.get(4).size, 2);
  assert.deepEqual(discoveryConfiguration(4), discoveryConfiguration(0));
});

test("a comparação valida mais, menos e iguais com ajuda que preserva a escolha", () => {
  const answers = [
    ["right", "left", "equal"], ["right", "equal", "left"],
    ["equal", "left", "left"], ["right", "equal", "right"],
  ];
  for (const [visit, correctChoices] of answers.entries()) {
    let state = startDiscovery(discoveryConfiguration(visit).slice(2));
    for (const correct of correctChoices) {
      assert.equal(state.phase, "compare");
      assert.equal(chooseGroup(state, "middle"), state);
      assert.equal(nextDiscovery(state), state);
      for (const wrong of ["left", "right", "equal"].filter((choice) => choice !== correct)) {
        assert.equal(chooseGroup(state, wrong).phase, "compare");
        assert.equal(chooseGroup(state, wrong).attempts, 1);
      }
      let guided = state;
      for (const expected of [1, 2, 3, 3]) {
        guided = requestHelp(guided);
        assert.equal(guided.attempts, expected);
        assert.equal(guided.phase, "compare");
      }
      const solved = chooseGroup(guided, correct);
      assert.equal(solved.phase, "lit");
      assert.equal(solved.choice, correct);
      assert.equal(requestHelp(solved), solved);
      state = nextDiscovery(solved);
    }
    assert.equal(state, null);
  }
});
