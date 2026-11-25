import { startGame } from "./core/game.js";
import { createAudioService } from "./services/audio.js";

const audioStatus = document.querySelector("#audio-status");
const audio = createAudioService(document.querySelector("#game-audio"), (unavailable) => {
  audioStatus.hidden = !unavailable;
});

startGame(document.querySelector("#game"), audio);
