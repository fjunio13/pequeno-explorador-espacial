export const crystalCount = 5;
const rounds = [
  [1, 3, 5],
  [2, 4, 5],
];
const helpLimit = 3;

export function crystalConfiguration(visit) {
  return { targets: rounds[visit % rounds.length] };
}

export function startCrystals({ targets }) {
  if (!Array.isArray(targets) || targets.length === 0 ||
      !targets.every((target) => Number.isInteger(target) && target >= 1 && target <= crystalCount)) {
    throw new RangeError("Use quantidades de 1 a 5 cristais.");
  }

  return { targets: [...targets], round: 0, loaded: [], attempts: 0, phase: "collect" };
}

export function targetFor(state) {
  return state.targets[state.round];
}

export function moveCrystal(state, id, destination) {
  if (state.phase === "powered" || !Number.isInteger(id) || id < 0 || id >= crystalCount) {
    return state;
  }

  const wasLoaded = state.loaded.includes(id);
  const adding = destination === "generator" && !wasLoaded;
  const removing = destination === "reserve" && wasLoaded;
  if (!adding && !removing) return state;

  const loaded = adding
    ? [...state.loaded, id]
    : state.loaded.filter((crystal) => crystal !== id);
  const target = targetFor(state);
  if (loaded.length === target) return { ...state, loaded, attempts: 0, phase: "number" };

  const attempts = state.phase === "collect" ? state.attempts : 0;
  const excess = adding && loaded.length > target ? 1 : 0;
  return { ...state, loaded, attempts: Math.min(attempts + excess, helpLimit), phase: "collect" };
}

function tryAgain(state) {
  if (state.attempts === helpLimit) return state;
  return { ...state, attempts: state.attempts + 1 };
}

export function requestHelp(state) {
  if (state.phase !== "collect") return state;
  return { ...state, attempts: Math.min(Math.max(state.attempts + 1, 2), helpLimit) };
}

export function chooseNumber(state, number) {
  if (state.phase !== "number" || !Number.isInteger(number) || number < 1 || number > crystalCount) {
    return state;
  }

  if (number !== state.loaded.length) return tryAgain(state);
  return { ...state, attempts: 0, phase: "activate" };
}

export function suggestedTransfer(state) {
  if (state.phase !== "collect" || state.attempts < 2) return null;

  const target = targetFor(state);
  if (state.loaded.length > target) return { id: state.loaded.at(-1), destination: "reserve" };
  if (state.loaded.length === target) return null;

  const id = Array.from({ length: crystalCount }, (_, index) => index)
    .find((index) => !state.loaded.includes(index));
  return { id, destination: "generator" };
}

export function demonstrateTransfer(state) {
  const suggestion = suggestedTransfer(state);
  if (state.attempts < helpLimit || !suggestion) return state;
  return moveCrystal(state, suggestion.id, suggestion.destination);
}

export function energize(state) {
  return state.phase === "activate" ? { ...state, phase: "powered" } : state;
}

export function nextCharge(state) {
  if (state.phase !== "powered") return state;
  if (state.round + 1 === state.targets.length) return null;
  return { ...state, round: state.round + 1, loaded: [], attempts: 0, phase: "collect" };
}
