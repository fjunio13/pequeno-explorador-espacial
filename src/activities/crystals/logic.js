export const crystalCount = 5;

const routes = [
  [[0, 1], [1, 3], [5, 2], [4, 2, "more"], [3, 5]],
  [[0, 2], [2, 4], [5, 3], [5, 3, "less"], [0, 5]],
  [[0, 3], [2, 5], [4, 2], [1, 3, "more"], [5, 4]],
  [[0, 4], [2, 3], [3, 1], [2, 5, "less"], [4, 5]],
];
const helpLimit = 3;

export function crystalConfiguration(visit) {
  const route = routes[visit % routes.length];
  const challenges = route.map(([first, second, relation]) => relation
    ? { type: "compare", loads: [first, second], relation }
    : { type: "charge", initial: first, target: second });
  return { challenges };
}

function isAmount(amount) {
  return Number.isInteger(amount) && amount >= 1 && amount <= crystalCount;
}

function isChallenge(challenge) {
  if (challenge?.type === "charge") {
    const { initial, target } = challenge;
    return (initial === 0 || isAmount(initial)) && isAmount(target) && initial !== target;
  }
  if (challenge?.type === "compare") {
    const { loads, relation } = challenge;
    return Array.isArray(loads) && loads.length === 2 &&
      isAmount(loads[0]) && isAmount(loads[1]) && loads[0] !== loads[1] &&
      (relation === "more" || relation === "less");
  }
  return false;
}

function beginChallenge(challenges, round) {
  const challenge = challenges[round];
  const loaded = Array.from({ length: challenge.initial ?? 0 }, (_, id) => id);
  return { challenges, round, loaded, attempts: 0, phase: challenge.type === "compare" ? "compare" : "collect" };
}

export function startCrystals({ challenges }) {
  if (!Array.isArray(challenges) || !challenges.length || !Array.from(challenges).every(isChallenge)) {
    throw new RangeError("Use desafios resolvíveis com até cinco cristais por gerador.");
  }
  return beginChallenge(challenges, 0);
}

export function challengeFor(state) {
  return state.challenges[state.round];
}

export function targetFor(state) {
  return challengeFor(state).target;
}

export function moveCrystal(state, id, destination) {
  if (challengeFor(state).type !== "charge" || state.phase === "powered" ||
      !Number.isInteger(id) || id < 0 || id >= crystalCount) return state;

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

export function requestHelp(state) {
  if (isChallengeDone(state) || state.attempts === helpLimit) return state;
  return { ...state, attempts: state.attempts + 1 };
}

export function chooseNumber(state, number) {
  if (state.phase !== "number" || !isAmount(number)) return state;

  if (number !== state.loaded.length) return requestHelp(state);
  return { ...state, attempts: 0, phase: "activate" };
}

export function chooseGenerator(state, side) {
  if (state.phase !== "compare" || (side !== 0 && side !== 1)) return state;

  const { loads, relation } = challengeFor(state);
  const more = loads[side] > loads[1 - side];
  if (more !== (relation === "more")) return requestHelp(state);
  return { ...state, phase: "compared", chosen: side };
}

export function suggestedTransfer(state) {
  if (state.phase !== "collect" || state.attempts < helpLimit) return null;

  if (state.loaded.length > targetFor(state)) return { id: state.loaded.at(-1), destination: "reserve" };

  const id = Array.from({ length: crystalCount }, (_, index) => index)
    .find((index) => !state.loaded.includes(index));
  return { id, destination: "generator" };
}

export function energize(state) {
  return state.phase === "activate" ? { ...state, phase: "powered" } : state;
}

export function isChallengeDone(state) {
  return state.phase === "powered" || state.phase === "compared";
}

export function nextCharge(state) {
  if (!isChallengeDone(state)) return state;
  if (state.round + 1 === state.challenges.length) return null;
  return beginChallenge(state.challenges, state.round + 1);
}
