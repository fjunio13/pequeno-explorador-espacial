import { audioUrl } from "./audio-catalog.js";

const playbackTimeout = 6000;

export function createAudioService(player, showUnavailable) {
  let instruction;
  let current;

  function play(id) {
    const source = audioUrl(id);
    current?.finish(false);
    showUnavailable(false);
    player.pause();
    player.src = source;

    const listeners = new AbortController();
    const options = { signal: listeners.signal };
    let resolve;
    let timer;
    const finished = new Promise((done) => { resolve = done; });

    function finish(played, unavailable = false) {
      if (current?.finish !== finish) return;
      current = undefined;
      listeners.abort();
      clearTimeout(timer);
      if (unavailable) {
        player.pause();
        showUnavailable(true);
      }
      resolve(played);
    }

    function unavailable() {
      finish(false, true);
    }

    function waitForProgress() {
      clearTimeout(timer);
      timer = setTimeout(unavailable, playbackTimeout);
    }

    current = { id, finished, finish };
    player.addEventListener("ended", () => {
      if (player.ended) finish(true);
    }, options);
    player.addEventListener("error", () => {
      if (player.error) unavailable();
    }, options);
    player.addEventListener("timeupdate", waitForProgress, options);
    waitForProgress();

    try {
      player.play().catch(unavailable);
    } catch {
      unavailable();
    }
    return finished;
  }

  function playIfIdle(id) {
    if (!current) return play(id);
  }

  function interrupt(id) {
    if (current?.id !== id) return;
    current.finish(false);
    player.pause();
  }

  async function playAfterCurrent(cue) {
    while (current && instruction === cue) await current.finished;
    return instruction === cue && play(cue.id);
  }

  function instruct(id, { playNow = true, afterCurrent = false } = {}) {
    const cue = { id };
    instruction = cue;
    if (!playNow) return;
    if (!afterCurrent || !current) return play(id);

    if (current.id === id) return current.finished;
    return playAfterCurrent(cue);
  }

  function repeat() {
    if (instruction) return instruct(instruction.id);
  }

  function stop() {
    current?.finish(false);
    instruction = undefined;
    showUnavailable(false);
    player.pause();
    if (player.hasAttribute("src")) {
      player.removeAttribute("src");
      player.load();
    }
  }

  return { play, playIfIdle, interrupt, instruct, repeat, stop };
}
