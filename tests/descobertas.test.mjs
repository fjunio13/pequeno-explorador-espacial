import assert from "node:assert/strict";
import test from "node:test";
import {
  chooseNumber, discoveryConfiguration, explore, hidingPlaces, nextDiscovery, requestHelp,
  sceneFor, startDiscovery, visibleCount,
} from "../src/activities/discoveries/logic.js";

test("uma criatura se junta ao grupo em cada descoberta, até cinco", () => {
  let state = startDiscovery(discoveryConfiguration(0));
  for (const initial of [1, 3, 4]) {
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
  assert.equal(state, null);
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

test("cada visita muda os esconderijos mantendo a progressão das quantidades", () => {
  for (let visit = 0; visit < hidingPlaces.length; visit++) {
    const scenes = discoveryConfiguration(visit);
    assert.deepEqual(scenes.map((scene) => scene.initial), [1, 3, 4]);
    assert.equal(scenes[0].hidingPlace, hidingPlaces[visit]);
    assert.equal(new Set(scenes.map((scene) => scene.hidingPlace)).size, hidingPlaces.length);
  }
});
