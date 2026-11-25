const guidedAfter = 3;

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
  if (state.attempts === 1) return "retry";
  if (state.attempts < guidedAfter) return "hint";
  return "guided";
}

export function suggestedStar(state) {
  const support = supportFor(state);
  if (support !== "hint" && support !== "guided") return null;

  const target = targetFor(state);
  if (state.selected.length === target) return null;
  if (state.selected.length > target) return state.selected.at(-1);

  return Array.from({ length: state.starCount }, (_, index) => index)
    .find((index) => !state.selected.includes(index));
}

export function requestHelp(state) {
  if (hasTarget(state)) return state;
  const attempts = Math.min(Math.max(state.attempts + 1, 2), guidedAfter);
  return { ...state, attempts };
}

export function demonstrateStar(state) {
  return supportFor(state) === "guided" ? toggleStar(state, suggestedStar(state)) : state;
}

export function nextRound(state) {
  if (!hasTarget(state)) return state;
  if (state.round + 1 === state.targets.length) return null;

  return { ...state, round: state.round + 1, selected: [], attempts: 0 };
}
