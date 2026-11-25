const guidedAfter = 3;

export function starConfiguration(visit = 0, random = Math.random) {
  const targets = [2, 3, 4, 5];
  // Alternar o número repetido garante uma sequência diferente da visita anterior.
  const repeated = targets[visit % targets.length];
  for (let end = targets.length - 1; end > 0; end--) {
    const index = Math.floor(random() * (end + 1));
    [targets[end], targets[index]] = [targets[index], targets[end]];
  }

  const repeatedIndex = targets.indexOf(repeated);
  const slots = Array.from({ length: targets.length + 1 }, (_, index) => index)
    .filter((index) => index !== repeatedIndex && index !== repeatedIndex + 1);
  targets.splice(slots[Math.floor(random() * slots.length)], 0, repeated);

  return { targets: [1, ...targets], starCount: 5 };
}

export function startCounting({ targets, starCount }) {
  if (!Number.isInteger(starCount) || starCount < 1 || starCount > 5 ||
      !Array.isArray(targets) || targets.length === 0 ||
      !targets.every((target) => Number.isInteger(target) && target >= 1 && target <= starCount)) {
    throw new RangeError("Use alvos de 1 a 5 dentro da quantidade de estrelas disponíveis.");
  }

  return { targets: [...targets], starCount, round: 0, selected: [], attempts: 0 };
}

export function targetFor(state) {
  return state.targets[state.round];
}

export function hasTarget(state) {
  return state.selected.length === targetFor(state);
}

export function toggleStar(state, index) {
  if (!Number.isInteger(index) || index < 0 || index >= state.starCount) {
    return state;
  }

  const selected = state.selected.includes(index)
    ? state.selected.filter((star) => star !== index)
    : [...state.selected, index];
  const addedTooMany = selected.length > state.selected.length && selected.length > targetFor(state);
  const attempts = addedTooMany ? Math.min(state.attempts + 1, guidedAfter) : state.attempts;
  return { ...state, selected, attempts };
}

export function supportFor(state) {
  if (hasTarget(state) || state.attempts === 0) return "none";
  if (state.attempts === 1) return "orient";
  if (state.attempts < guidedAfter) return "hint";
  return "guided";
}

export function suggestedStar(state) {
  if (supportFor(state) !== "guided") return null;

  if (state.selected.length > targetFor(state)) return state.selected.at(-1);

  return Array.from({ length: state.starCount }, (_, index) => index)
    .find((index) => !state.selected.includes(index));
}

export function requestHelp(state) {
  if (hasTarget(state)) return state;
  return { ...state, attempts: Math.min(state.attempts + 1, guidedAfter) };
}

export function nextRound(state) {
  if (!hasTarget(state)) return state;
  if (state.round + 1 === state.targets.length) return null;

  return { ...state, round: state.round + 1, selected: [], attempts: 0 };
}
