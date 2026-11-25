import { bindActions, control } from "../../ui/controls.js";
import { createRoundAdvance } from "../round-advance.js";
import { bindCrystalDrag } from "./drag.js";
import {
  chooseNumber, crystalCount, energize, moveCrystal, nextCharge, requestHelp,
  startCrystals, suggestedTransfer, targetFor,
} from "./logic.js";

const gem = new URL("../../../assets/images/cristal.webp", import.meta.url).href;
const station = new URL("../../../assets/images/estacao-cristais.webp", import.meta.url).href;

function slots(showCount = false) {
  return Array.from({ length: crystalCount }, (_, index) => `
    <div class="crystal-socket">${showCount ? `<span class="crystal-count" aria-hidden="true">${index + 1}</span>` : ""}</div>`).join("");
}

function crystalButton(id) {
  const button = document.createElement("button");
  button.className = "crystal-piece";
  button.type = "button";
  button.dataset.action = "crystal";
  button.dataset.crystal = id;
  button.innerHTML = `<img src="${gem}" alt="" draggable="false">`;
  return button;
}

function activityMarkup(rounds) {
  const numbers = Array.from({ length: crystalCount }, (_, index) =>
    `<button type="button" class="crystal-number" data-action="number" data-number="${index + 1}">${index + 1}</button>`).join("");

  return `
    <section class="screen crystal-screen" data-screen="mission" data-planet="crystals">
      <header class="screen-toolbar mission-toolbar">
        ${control("map", "Voltar ao mapa", "back")}
        <h1 tabindex="-1">Planeta dos Cristais</h1>
        ${control("listen", "Ouvir", "sound")}
      </header>
      <div class="crystal-console">
        <div class="crystal-brief">
          <p class="crystal-instruction" data-instruction></p>
          <div class="mission-progress" role="img" data-crystal-progress>
            ${'<span aria-hidden="true"></span>'.repeat(rounds)}
          </div>
        </div>
        <div class="crystal-workbench">
          <section class="crystal-zone" data-zone="reserve" aria-label="Reserva de cristais">
            <div class="crystal-zone-title"><h2>Reserva</h2><span>Arraste ou toque</span></div>
            <div class="crystal-sockets">${slots()}</div>
          </section>
          <section class="crystal-zone" data-zone="generator" aria-label="Gerador">
            <div class="crystal-zone-title"><h2>Gerador</h2><span data-generator-status>Desligado</span></div>
            <div class="station-art">
              <img src="${station}" alt="" draggable="false">
            </div>
            <div class="crystal-sockets">${slots(true)}</div>
          </section>
        </div>
        <div class="crystal-footer">
          <p class="crystal-feedback" role="status" data-crystal-feedback></p>
          <div class="crystal-numbers" role="group" aria-label="Escolha a quantidade" hidden>${numbers}</div>
          <div class="crystal-buttons">
            ${control("help", "Ajuda", "help")}
            ${control("power", "Ligar estação", "bolt", "primary")}
          </div>
        </div>
      </div>
      <img class="crystal-ghost" src="${gem}" alt="" data-crystal-ghost hidden draggable="false">
    </section>`;
}

function feedbackFor(state) {
  const { phase, attempts, loaded } = state;
  switch (phase) {
    case "number":
      if (attempts === 3) return { cue: "cristais-pista-numero", note: "Veja o número que brilha." };
      if (attempts === 2) return { cue: "cristais-revisar-numero", note: "Conte os cristais do gerador." };
      if (attempts === 1) return { cue: "cristais-recontar", note: "Veja os cristais no gerador." };
      return { cue: "cristais-escolher", note: "" };
    case "activate":
      return { cue: "cristais-ativar", note: attempts ? "Toque no raio para ligar." : "" };
    case "powered":
      return { cue: "cristais-ligado", note: "" };
  }

  const target = targetFor(state);
  const excess = loaded.length > target;
  if (attempts === 3) {
    return excess ? { cue: "cristais-sobram", note: "Devolva o cristal que brilha." }
      : { cue: "cristais-faltam", note: "Coloque o cristal que brilha." };
  }
  if (excess) return { cue: "cristais-excesso", note: "Devolva um cristal à reserva." };
  if (attempts === 2) return { cue: "cristais-espacos", note: "Veja os encaixes que faltam." };
  return { cue: `cristais-pedido-${target}`, note: attempts ? "Veja os encaixes do gerador." : "" };
}

export function mountCrystals({ container, configuration, audio, onComplete, onReturn }) {
  let state = startCrystals(configuration);
  container.innerHTML = activityMarkup(state.targets.length);

  const screen = container.querySelector(".crystal-screen");
  const generatorZone = screen.querySelector('[data-zone="generator"]');
  const reserve = [...screen.querySelectorAll('[data-zone="reserve"] .crystal-socket')];
  const generator = [...generatorZone.querySelectorAll(".crystal-socket")];
  const brief = screen.querySelector("[data-instruction]");
  const generatorStatus = screen.querySelector("[data-generator-status]");
  const progress = screen.querySelector("[data-crystal-progress]");
  const feedback = screen.querySelector("[data-crystal-feedback]");
  const numberGrid = screen.querySelector(".crystal-numbers");
  const numberButtons = [...numberGrid.children];
  const power = screen.querySelector('[data-action="power"]');
  const actions = power.parentElement;
  const listen = screen.querySelector('[data-action="listen"]');
  const map = screen.querySelector('[data-action="map"]');
  map.setAttribute("data-native-click", "");
  let pieces = [];

  const transition = createRoundAdvance(() => {
    state = nextCharge(state);
    if (!state) {
      onComplete();
      return;
    }

    startCharge();
  });

  function render() {
    const { phase, loaded, round, attempts } = state;
    const target = targetFor(state);
    const suggestion = suggestedTransfer(state);
    const powered = phase === "powered";
    const focused = document.activeElement;

    screen.dataset.phase = phase;
    screen.dataset.loaded = loaded.length;
    brief.textContent = {
      collect: `Coloque ${target} ${target === 1 ? "cristal" : "cristais"} no gerador`,
      number: "Quantos cristais estão no gerador?",
      activate: "A carga está pronta!",
      powered: "A estação acendeu!",
    }[phase];
    generatorStatus.textContent = powered ? "Ligado" : phase === "activate" ? "Carga pronta" : "Desligado";
    feedback.textContent = feedbackFor(state).note;
    generatorZone.toggleAttribute("data-help-focus", (phase === "collect" || phase === "number") && attempts === 1);
    progress.setAttribute("aria-label", `Carga ${round + 1} de ${state.targets.length}`);
    for (const [index, dot] of [...progress.children].entries()) {
      dot.dataset.status = index < round || (index === round && powered)
        ? "done"
        : index === round ? "active" : "waiting";
    }

    for (const [index, socket] of generator.entries()) {
      socket.toggleAttribute("data-requested", phase === "collect" && index < target);
      socket.toggleAttribute("data-filled", index < loaded.length);
      socket.toggleAttribute("data-load-hint", phase === "collect" && attempts === 2 && (
        loaded.length > target ? index >= target && index < loaded.length : index >= loaded.length && index < target
      ));
      socket.toggleAttribute("data-count-hint", phase === "number" && attempts >= 2 && index < loaded.length);
    }

    for (const [id, piece] of pieces.entries()) {
      const position = loaded.indexOf(id);
      const socket = position >= 0 ? generator[position] : reserve[id];
      if (piece.parentElement !== socket) socket.append(piece);
      piece.setAttribute("aria-label", position >= 0 ? `Retirar cristal ${id + 1}` : `Recolher cristal ${id + 1}`);
      piece.toggleAttribute("data-guide", suggestion?.id === id);
      piece.disabled = powered;
    }

    numberGrid.hidden = phase !== "number";
    actions.hidden = powered;
    power.hidden = phase !== "activate";
    power.toggleAttribute("data-guide", phase === "activate" && attempts > 0);
    for (const [index, button] of numberButtons.entries()) {
      button.toggleAttribute("data-guide", phase === "number" && attempts >= 3 && index + 1 === loaded.length);
    }

    if (focused === power && power.hidden) listen.focus({ preventScroll: true });
    else if (numberButtons.includes(focused) && phase === "activate") power.focus({ preventScroll: true });
    else if (pieces.includes(focused) && !powered) focused.focus({ preventScroll: true });
  }

  function move(id, destination) {
    const next = moveCrystal(state, id, destination);
    if (state === next) return;
    const previousCue = feedbackFor(state).cue;
    state = next;
    render();
    audio.playIfIdle(destination === "generator" ? "cristais-encaixe" : "cristais-retirar");
    const { cue } = feedbackFor(state);
    if (cue !== previousCue) audio.instruct(cue, { afterCurrent: true });
  }

  function verifyNumber(button) {
    const previous = state;
    state = chooseNumber(state, Number(button.dataset.number));
    if (state === previous) return;

    render();
    audio.instruct(feedbackFor(state).cue, { afterCurrent: true });
  }

  function powerStation() {
    if (state.phase !== "activate") return;
    state = energize(state);

    render();
    transition.schedule(audio.instruct(feedbackFor(state).cue, { afterCurrent: true }));
  }

  function askForHelp() {
    state = requestHelp(state);
    render();
    audio.instruct(feedbackFor(state).cue, { afterCurrent: true });
  }

  function startCharge() {
    for (const piece of pieces) piece.remove();
    pieces = reserve.map((_, index) => crystalButton(index));
    render();
    audio.instruct(feedbackFor(state).cue);
  }

  const unbindActions = bindActions(container, {
    map: onReturn,
    listen: () => {
      const replay = audio.repeat();
      if (state.phase === "powered") transition.schedule(replay);
    },
    power: powerStation,
    number: verifyNumber,
    crystal: (piece) => move(Number(piece.dataset.crystal),
      piece.closest("[data-zone]").dataset.zone === "reserve" ? "generator" : "reserve"),
    help: askForHelp,
  });
  const unbindDrag = bindCrystalDrag(screen, move);
  startCharge();
  return () => {
    transition.cancel();
    unbindDrag();
    unbindActions();
  };
}
