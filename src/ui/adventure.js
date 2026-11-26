import { messages } from "../services/audio-catalog.js";
import { bindActions, control, icon, lightPattern } from "./controls.js";
import { creature, shipArt } from "./screens.js";

const launchArt = new URL("../../assets/images/astronauta-e-nave.webp", import.meta.url).href;
const arch = `<svg class="farol-arch" viewBox="0 0 88 68" aria-hidden="true">
  <path class="farol-stone" fill="#6b578d" d="M9 60C12 33 21 12 42 12S73 33 79 60H62C58 43 52 30 42 30S27 44 25 60Z"/>
  <path fill="#a079a4" d="M9 60C12 33 21 12 42 12c15 0 23 9 30 27l-13-2C54 24 47 22 42 22 25 24 21 44 19 60Z"/>
  <path class="farol-edge" d="M9 60C12 33 21 12 42 12S73 33 79 60"/>
</svg>`;

function storyPlayer(container, audio, markup, actions) {
  container.innerHTML = markup;
  const scene = container.firstElementChild;
  const caption = scene.querySelector("[data-caption]");
  let timer;
  let sequence = 0;
  const unbind = bindActions(container, actions);

  function cancel() {
    sequence += 1;
    clearTimeout(timer);
  }

  async function present(phase, { voice, effect, next, dwell = 0, fallback = 0 } = {}) {
    cancel();
    const turn = sequence;
    scene.dataset.phase = phase;
    caption.textContent = voice ? messages[voice] : "";
    const played = await (voice ? audio.instruct(voice) : effect && audio.play(effect));
    if (turn === sequence && next) {
      timer = setTimeout(next, played ? dwell : Math.max(dwell, fallback));
    }
  }

  return { scene, present, close() { cancel(); unbind(); } };
}

export function mountPrologue(container, audio, planets, onMap) {
  const skip = () => onMap(true);
  const story = storyPlayer(container, audio, `
    <section class="screen intro-screen prologue-screen" data-screen="prologue">
      <img class="intro-art" src="${launchArt}" alt="" width="1600" height="900">
      <div class="prologue-toolbar">
        ${control("listen", "Ouvir", "sound")}
        ${control("skip", "Pular apresentação", "next")}
      </div>
      <div class="intro-copy">
        <h1 tabindex="-1">Quem piscou?</h1>
        <p class="story-caption" data-caption></p>
        <div class="prologue-planets" aria-hidden="true">
          ${planets.map(({ image }) => `<img src="${image}" alt="">`).join("")}
        </div>
      </div>
      <div class="prologue-signal" aria-hidden="true">${icon("spark")}${lightPattern}</div>
    </section>`, { skip, listen: begin });

  function begin() {
    story.present("question", { voice: "farol-quem-piscou", next: signal, fallback: 2700 });
  }

  function signal() {
    story.present("signal", { effect: "farol-sinal", next: choose, fallback: 1940 });
  }

  function choose() {
    story.present("choice", {
      voice: "farol-escolher-planeta", next: () => onMap(false), dwell: 500, fallback: 3400,
    });
  }

  begin();
  return story.close;
}

export function mountFinale(container, audio, onMap, onSignal) {
  const story = storyPlayer(container, audio, `
    <section class="screen sky-screen farol-screen" data-screen="finale">
      <div class="screen-toolbar">
        ${control("map", "Voltar ao mapa", "back")}
        ${control("listen", "Ouvir", "sound")}
      </div>
      <h1 tabindex="-1">Um oi do tamanho do vale</h1>
      <div class="farol-stage">
        <div class="farol-clues" role="group" aria-label="Direção, ritmo e luzinhas">
          ${["direction", "antenna", "lights"].map((clue) =>
            `<span data-clue="${clue}" aria-hidden="true">${icon(clue)}${clue === "antenna" ? lightPattern : ""}</span>`).join("")}
        </div>
        <div class="farol-ship">
          ${shipArt}
          <button class="farol-lamp" type="button" data-action="signal"
            aria-label="Mandar um oi" hidden>${icon("tap")}</button>
        </div>
        <div class="farol-message" aria-hidden="true">${lightPattern}</div>
        <div class="farol-valley" aria-hidden="true">
          ${arch}
          <div class="farol-lead">${creature}</div>
          <div class="farol-friends">${creature.repeat(2)}</div>
        </div>
      </div>
      <div class="farol-footer">
        <p class="story-caption" data-caption></p>
        ${control("skip", "Pular apresentação", "next")}
      </div>
    </section>`, { map: onMap, listen, skip: invite, signal: reply });

  const lamp = story.scene.querySelector("[data-action='signal']");
  const skip = story.scene.querySelector("[data-action='skip']");

  function gather() {
    story.present("gather", { next: reveal, dwell: 2800 });
  }

  function reveal() {
    story.present("reveal", { voice: "farol-convite", next: invite, fallback: 3000 });
  }

  function invite() {
    lamp.hidden = false;
    if (document.activeElement === skip) lamp.focus({ preventScroll: true });
    skip.hidden = true;
    story.present("invite", { voice: "farol-mandar-oi" });
  }

  function reply() {
    if (story.scene.dataset.phase !== "invite") return;
    onSignal();
    if (document.activeElement === lamp) story.scene.querySelector("h1").focus({ preventScroll: true });
    lamp.hidden = true;
    story.present("reply", { effect: "farol-sinal", next: celebrate, dwell: 400, fallback: 2300 });
  }

  function celebrate() {
    story.present("celebrate", { voice: "farol-celebracao" });
  }

  function listen() {
    const phase = story.scene.dataset.phase;
    if (phase === "gather") gather();
    if (phase === "reveal") reveal();
    if (phase === "invite" || phase === "celebrate") audio.repeat();
  }

  gather();
  return story.close;
}
