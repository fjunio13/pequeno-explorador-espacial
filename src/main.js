import { startGame } from "./core/game.js";
import { createAudioService } from "./services/audio.js";

const audioStatus = document.querySelector("#audio-status");
const audio = createAudioService(document.querySelector("#game-audio"), (unavailable) => {
  audioStatus.textContent = unavailable ? "Áudio indisponível. Toque em Ouvir para tentar de novo." : "";
  document.body.toggleAttribute("data-audio-unavailable", unavailable);
});

startGame(document.querySelector("#game"), audio);
