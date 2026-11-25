import { bindActions, control } from "../../ui/controls.js";
import { createRoundAdvance } from "../round-advance.js";
import { bindCrystalDrag } from "./drag.js";
import {
  chooseNumber, crystalCount, demonstrateTransfer, energize, moveCrystal, nextCharge, requestHelp,
  startCrystals, suggestedTransfer, targetFor,
} from "./logic.js";

const gem = new URL("../../../assets/images/cristal.webp", import.meta.url).href;
const station = new URL("../../../assets/images/estacao-cristais.webp", import.meta.url).href;

function slots() {
  return '<div class="crystal-socket"></div>'.repeat(crystalCount);
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
            <div class="crystal-sockets">${slots()}</div>
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

function instructionFor(state) {
  switch (state.phase) {
    case "number":
      if (state.attempts >= 3) return "cristais-pista-numero";
      if (state.attempts > 0) return "cristais-revisar-numero";
      return "cristais-escolher";
    case "activate":
      return "cristais-ativar";
    case "powered":
      return "cristais-ligado";
    default:
      if (state.attempts >= 3) return "cristais-ajuda";
      if (state.attempts === 2) {
        return state.loaded.length < targetFor(state) ? "cristais-faltam" : "cristais-sobram";
      }
      if (state.attempts === 1) return "cristais-recontar";
      return `cristais-pedido-${targetFor(state)}`;
  }
}

function feedbackFor(state, suggestion) {
  if (!state.attempts) return "";
  if (state.phase === "number") {
    if (state.attempts === 1) return "Vamos contar de novo?";
    if (state.attempts === 2) return "Conte os cristais que estão no gerador.";
    return "Conte um por um e procure o número que brilha.";
  }
  if (state.attempts === 1) return "Vamos ajustar a carga?";
  if (!suggestion) return "";
  if (state.attempts >= 3) return "Toque no cristal brilhando ou em Ajudar.";
  return suggestion.destination === "generator"
    ? "Coloque o cristal que está brilhando."
    : "Devolva o cristal que está brilhando.";
}

export function mountCrystals({ container, configuration, audio, onComplete, onReturn }) {
  let state = startCrystals(configuration);
  container.innerHTML = activityMarkup(state.targets.length);

  const screen = container.querySelector(".crystal-screen");
  const reserve = [...screen.querySelectorAll('[data-zone="reserve"] .crystal-socket')];
  const generator = [...screen.querySelectorAll('[data-zone="generator"] .crystal-socket')];
  const brief = screen.querySelector("[data-instruction]");
  const generatorStatus = screen.querySelector("[data-generator-status]");
  const progress = screen.querySelector("[data-crystal-progress]");
  const feedback = screen.querySelector("[data-crystal-feedback]");
  const numberGrid = screen.querySelector(".crystal-numbers");
  const numberButtons = [...numberGrid.children];
  const help = screen.querySelector('[data-action="help"]');
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
    feedback.textContent = feedbackFor(state, suggestion);
    progress.setAttribute("aria-label", `Carga ${round + 1} de ${state.targets.length}`);
    for (const [index, dot] of [...progress.children].entries()) {
      dot.dataset.status = index < round || (index === round && powered)
        ? "done"
        : index === round ? "active" : "waiting";
    }

    for (const [index, socket] of generator.entries()) {
      socket.toggleAttribute("data-requested", phase === "collect" && index < target);
      socket.toggleAttribute("data-filled", index < loaded.length);
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
    actions.hidden = phase === "number" || powered;
    power.hidden = phase !== "activate";
    help.hidden = phase !== "collect";
    help.querySelector("span").textContent = attempts >= 3 ? "Ajudar" : "Ajuda";
    for (const [index, button] of numberButtons.entries()) {
      button.toggleAttribute("data-guide", phase === "number" && attempts >= 3 && index + 1 === loaded.length);
    }

    if (focused === power && power.hidden) listen.focus({ preventScroll: true });
    else if (numberButtons.includes(focused) && phase === "activate") power.focus({ preventScroll: true });
    else if (focused === help && phase === "number") numberButtons[0].focus({ preventScroll: true });
    else if (pieces.includes(focused) && !powered) focused.focus({ preventScroll: true });
  }

  function transfer(next, destination) {
    if (state === next) return;
    const changedCue = instructionFor(state) !== instructionFor(next);
    state = next;
    render();
    audio.playIfIdle(destination === "generator" ? "cristais-encaixe" : "cristais-retirar");
    if (changedCue) audio.instruct(instructionFor(state), { afterCurrent: true });
  }

  function move(id, destination) {
    transfer(moveCrystal(state, id, destination), destination);
  }

  function verifyNumber(button) {
    const previous = state;
    state = chooseNumber(state, Number(button.dataset.number));
    if (state === previous) return;

    render();
    audio.instruct(instructionFor(state), { afterCurrent: true });
  }

  function powerStation() {
    if (state.phase !== "activate") return;
    state = energize(state);

    render();
    transition.schedule(audio.instruct(instructionFor(state), { afterCurrent: true }));
  }

  function askForHelp() {
    const suggestion = suggestedTransfer(state);
    if (state.attempts >= 3 && suggestion) {
      transfer(demonstrateTransfer(state), suggestion.destination);
      return;
    }

    state = requestHelp(state);
    render();
    audio.instruct(instructionFor(state), { afterCurrent: true });
  }

  function startCharge() {
    for (const piece of pieces) piece.remove();
    pieces = reserve.map((_, index) => crystalButton(index));
    render();
    audio.instruct(instructionFor(state));
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
