export const hidingPlaces = ["rock", "flower", "arch"];
const numerals = { 1: [1, 2, 3], 3: [3, 4, 5], 4: [2, 4, 5] };

const count = (initial, hidingPlace, layout) => ({
  kind: "count", initial, hidingPlace, layout, numbers: [...numerals[initial]],
});

const compare = (relation, left, right, firstLayout = "row") => ({
  kind: "compare",
  relation,
  groups: [
    { amount: left, layout: firstLayout },
    { amount: right, layout: firstLayout === "row" ? "clusters" : "row" },
  ],
});

const visits = [
  () => [
    count(1, "rock", "row"), count(3, "flower", "clusters"),
    compare("more", 2, 4), compare("less", 3, 5, "clusters"), compare("equal", 4, 4),
  ],
  () => [
    count(1, "flower", "clusters"), count(4, "arch", "row"),
    compare("less", 5, 2), compare("equal", 3, 3, "clusters"), compare("more", 4, 1),
  ],
  () => [
    count(3, "arch", "row"), count(1, "rock", "clusters"),
    compare("equal", 5, 5), compare("more", 5, 3, "clusters"), compare("less", 2, 4),
  ],
  () => [
    count(4, "rock", "clusters"), count(3, "arch", "row"),
    compare("more", 3, 5), compare("equal", 2, 2, "clusters"), compare("less", 4, 1),
  ],
];

export function discoveryConfiguration(visit) {
  return visits[visit % visits.length]();
}

function beginRound(rounds, round) {
  const phase = rounds[round].kind === "compare" ? "compare" : "search";
  return { rounds, round, phase, attempts: 0 };
}

export function startDiscovery(rounds) {
  return beginRound(rounds, 0);
}

export function sceneFor(state) {
  return state.rounds[state.round];
}

export function visibleCount(state) {
  return sceneFor(state).initial + Number(state.phase !== "search");
}

export function requestHelp(state) {
  if (state.phase === "lit") return state;
  return { ...state, attempts: Math.min(3, state.attempts + 1) };
}

export function explore(state, place) {
  if (state.phase !== "search" || !hidingPlaces.includes(place)) return state;
  if (place !== sceneFor(state).hidingPlace) return requestHelp(state);
  return { ...state, phase: "count", attempts: 0 };
}

export function chooseNumber(state, number) {
  if (state.phase !== "count" || !sceneFor(state).numbers.includes(number)) return state;
  if (number !== visibleCount(state)) return requestHelp(state);
  return { ...state, phase: "lit", attempts: 0 };
}

export function chooseGroup(state, choice) {
  if (state.phase !== "compare" || !["left", "right", "equal"].includes(choice)) return state;

  const { groups: [left, right], relation } = sceneFor(state);
  let correct = "equal";
  if (left.amount !== right.amount) {
    correct = (left.amount > right.amount) === (relation === "more") ? "left" : "right";
  }
  if (choice !== correct) return requestHelp(state);
  return { ...state, phase: "lit", attempts: 0, choice };
}

export function nextDiscovery(state) {
  if (state.phase !== "lit") return state;
  const round = state.round + 1;
  return round < state.rounds.length ? beginRound(state.rounds, round) : null;
}
