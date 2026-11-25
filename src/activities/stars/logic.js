const guidedAfter = 3;

export function startCounting({ targets, starCount }) {
  if (!Number.isInteger(starCount) || starCount < 1 || starCount > 5 ||
      !Array.isArray(targets) || targets.length === 0 ||
      !targets.every((target) => Number.isInteger(target) && target >= 1 && target <= starCount)) {
    throw new RangeError("Use alvos de 1 a 5 dentro da quantidade de estrelas disponíveis.");
  }

  return { targets: [...targets], starCount, round: 0, selected: [], attempts: 0, confirmed: false };
}

export function targetFor(state) {
  return state.targets[state.round];
}

export function toggleStar(state, index) {
  if (state.confirmed || !Number.isInteger(index) || index < 0 || index >= state.starCount) {
    return state;
  }

  const selected = state.selected.includes(index)
    ? state.selected.filter((star) => star !== index)
    : [...state.selected, index];
  return { ...state, selected };
}

export function supportFor(state) {
  if (state.confirmed || state.attempts === 0) return "none";
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

export function checkCount(state) {
  if (state.confirmed) return state;
  if (state.selected.length === targetFor(state)) return { ...state, confirmed: true };

  if (supportFor(state) === "guided") return toggleStar(state, suggestedStar(state));
  return { ...state, attempts: state.attempts + 1 };
}

export function nextRound(state) {
  if (!state.confirmed) return state;
  if (state.round + 1 === state.targets.length) return null;

  return { ...state, round: state.round + 1, selected: [], attempts: 0, confirmed: false };
}
