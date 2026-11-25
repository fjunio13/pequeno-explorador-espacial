const assistanceLimit = 3;
const rowSize = 5;
const frameSize = 2 * rowSize;

export function tenFrames(amount, capacity) {
  if (![10, 20].includes(capacity) || !Number.isInteger(amount) || amount < 0 || amount > capacity) {
    throw new RangeError("A quantidade precisa caber nos painéis.");
  }

  return Array.from({ length: capacity / frameSize }, (_, index) => {
    const left = amount - index * frameSize;
    return [0, rowSize].map((offset) => Math.max(0, Math.min(rowSize, left - offset)));
  });
}

export function startChallenge(challenge) {
  return { challenge, pieces: [], choice: null, attempts: 0, issue: null };
}

export function energyTotal({ challenge, pieces }) {
  return pieces.reduce((sum, value) => sum + value, challenge.start ?? 0);
}

export function correctSide({ loads, relation }) {
  const larger = loads[0] > loads[1] ? 0 : 1;
  return relation === "more" ? larger : 1 - larger;
}

export function isSolved(state) {
  const { challenge, choice } = state;
  return challenge.mode === "compare"
    ? choice === correctSide(challenge)
    : energyTotal(state) === challenge.target;
}

function nextAttempt(state) {
  return Math.min(assistanceLimit, state.attempts + 1);
}

function changePieces(state, pieces) {
  const next = { ...state, pieces, issue: null };
  if (energyTotal(next) > state.challenge.target) {
    next.issue = "excess";
    next.attempts = nextAttempt(state);
  }
  return next;
}

export function addModule(state, value) {
  if (!state.challenge.modules?.includes(value)) return state;
  if (energyTotal(state) + value > state.challenge.capacity) {
    if (isSolved(state)) return state;
    return { ...state, issue: "space", attempts: nextAttempt(state) };
  }
  return changePieces(state, [...state.pieces, value]);
}

export function removeModule(state, value) {
  const index = state.pieces.lastIndexOf(value);
  if (index === -1) return state;
  const pieces = state.pieces.slice();
  pieces.splice(index, 1);
  return changePieces(state, pieces);
}

export function chooseCharge(state, side) {
  if (state.challenge.mode !== "compare" || ![0, 1].includes(side)) return state;
  const choice = { ...state, choice: side, issue: null };
  if (!isSolved(choice)) {
    choice.issue = "choice";
    choice.attempts = nextAttempt(state);
  }
  return choice;
}

export function requestHelp(state) {
  return isSolved(state) ? state : { ...state, attempts: nextAttempt(state) };
}

export function suggestion(state) {
  if (isSolved(state) || state.attempts < 3) return null;
  const { challenge, pieces } = state;
  if (challenge.mode === "compare") return { action: "choose", value: correctSide(challenge) };
  const missing = challenge.target - energyTotal(state);
  if (missing > 0) {
    return { action: "add", value: Math.max(...challenge.modules.filter((value) => value <= missing)) };
  }
  const fitting = pieces.filter((value) => value <= -missing);
  const value = fitting.length ? Math.max(...fitting) : Math.min(...pieces);
  return { action: "remove", value };
}
