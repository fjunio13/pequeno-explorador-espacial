const resultPause = 650;
const resultPauseWithoutAudio = 1400;

export function createRoundAdvance(advance) {
  let pending;
  let timer;

  function cancel() {
    pending = undefined;
    clearTimeout(timer);
  }

  async function schedule(feedback) {
    cancel();
    const turn = Symbol();
    pending = turn;

    const played = await feedback;
    if (pending !== turn) return;

    timer = setTimeout(() => {
      cancel();
      advance();
    }, played ? resultPause : resultPauseWithoutAudio);
  }

  return { schedule, cancel };
}
