export const hidingPlaces = ["rock", "flower", "arch"];

export function discoveryConfiguration(visit) {
  return [
    { initial: 1, numbers: [1, 2, 3] },
    { initial: 3, numbers: [3, 4, 5] },
    { initial: 4, numbers: [2, 4, 5] },
  ].map((round, index) => ({
    ...round,
    hidingPlace: hidingPlaces[(visit + index) % hidingPlaces.length],
  }));
}

function beginRound(rounds, round) {
  return { rounds, round, phase: "search", attempts: 0 };
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

export function nextDiscovery(state) {
  if (state.phase !== "lit") return state;
  const round = state.round + 1;
  return round < state.rounds.length ? beginRound(state.rounds, round) : null;
}
