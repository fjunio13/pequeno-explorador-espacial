import { audioUrl } from "./audio-catalog.js";

export function createAudioService(player, showUnavailable) {
  let instruction;
  let playback = 0;

  async function play(id) {
    const source = audioUrl(id);
    const request = ++playback;
    showUnavailable(false);
    player.pause();
    player.src = source;

    try {
      await player.play();
      return request === playback;
    } catch {
      if (request === playback) showUnavailable(true);
      return false;
    }
  }

  function instruct(id, { playNow = true } = {}) {
    instruction = id;
    if (playNow) return play(id);
  }

  function repeat() {
    if (instruction) return play(instruction);
  }

  function stop() {
    playback++;
    instruction = undefined;
    showUnavailable(false);
    player.pause();
    if (player.hasAttribute("src")) {
      player.removeAttribute("src");
      player.load();
    }
  }

  return { play, instruct, repeat, stop };
}
