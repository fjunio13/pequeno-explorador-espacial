import { bindActions, control, icon } from "../../ui/controls.js";
import { bindCrystalDrag } from "./drag.js";
import {
  chooseNumber, confirmLoad, crystalCount, demonstrateTransfer, energize, moveCrystal, nextCharge,
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
            ${control("help", "Ajudar", "gem")}
            ${control("advance", "Conferir a carga", "check", "primary")}
          </div>
        </div>
      </div>
      <img class="crystal-ghost" src="${gem}" alt="" data-crystal-ghost hidden draggable="false">
    </section>`;
}

function instructionFor(state) {
  const count = state.loaded.length;
  switch (state.phase) {
    case "number":
      if (state.attempts >= 3) return "cristais-pista-numero";
      if (state.attempts === 2) return "cristais-revisar-numero";
      return "cristais-escolher";
    case "activate":
      return "cristais-ativar";
    case "powered":
      return "cristais-ligado";
    default:
      if (state.attempts >= 2 && count === targetFor(state)) return "cristais-conferir";
      if (state.attempts >= 3) return "cristais-ajuda";
      if (state.attempts === 2) return count < targetFor(state) ? "cristais-faltam" : "cristais-sobram";
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
  if (!suggestion) return "Agora, confira a carga.";
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
  const pieces = reserve.map((_, index) => crystalButton(index));
  const brief = screen.querySelector("[data-instruction]");
  const generatorStatus = screen.querySelector("[data-generator-status]");
  const progress = screen.querySelector("[data-crystal-progress]");
  const feedback = screen.querySelector("[data-crystal-feedback]");
  const numberGrid = screen.querySelector(".crystal-numbers");
  const numberButtons = [...numberGrid.children];
  const help = screen.querySelector('[data-action="help"]');
  const advance = screen.querySelector('[data-action="advance"]');
  const actions = advance.parentElement;
  screen.querySelector('[data-action="map"]').setAttribute("data-native-click", "");

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
    actions.hidden = phase === "number";
    for (const [index, button] of numberButtons.entries()) {
      button.toggleAttribute("data-guide", phase === "number" && attempts >= 3 && index + 1 === loaded.length);
    }
    help.hidden = attempts < 3 || !suggestion;
    const [label, symbol] = phase === "activate" ? ["Ligar estação", "bolt"]
      : powered ? [round + 1 === state.targets.length ? "Concluir" : "Continuar", "next"]
        : ["Conferir a carga", "check"];
    advance.innerHTML = `${icon(symbol)}<span>${label}</span>`;
    advance.toggleAttribute("data-native-click", powered && round + 1 === state.targets.length);

    if (focused === advance && phase === "number") numberButtons[0].focus({ preventScroll: true });
    else if (numberButtons.includes(focused) && phase !== "number") advance.focus({ preventScroll: true });
    else if (pieces.includes(focused) && !powered) focused.focus({ preventScroll: true });
    else if (focused === help && help.hidden) advance.focus({ preventScroll: true });
  }

  function transfer(next, destination) {
    if (state === next) return;
    state = next;
    render();
    audio.instruct(instructionFor(state), { playNow: false });
    audio.play(destination === "generator" ? "cristais-encaixe" : "cristais-retirar");
  }

  function move(id, destination) {
    transfer(moveCrystal(state, id, destination), destination);
  }

  function verifyNumber(button) {
    const previous = state;
    state = chooseNumber(state, Number(button.dataset.number));
    if (state === previous) return;

    render();
    if (state.phase === "activate" || state.attempts >= 2) audio.instruct(instructionFor(state));
    else audio.play("cristais-revisar-numero");
  }

  function proceed() {
    if (state.phase === "powered") {
      state = nextCharge(state);
      if (!state) {
        onComplete();
        return;
      }
    } else if (state.phase === "activate") {
      state = energize(state);
    } else if (state.phase === "collect") {
      state = confirmLoad(state);
    }

    render();
    if (state.phase === "collect" && state.attempts === 1) audio.play("cristais-recontar");
    else audio.instruct(instructionFor(state));
  }

  const unbindActions = bindActions(container, {
    map: onReturn,
    listen: audio.repeat,
    advance: proceed,
    number: verifyNumber,
    crystal: (piece) => move(Number(piece.dataset.crystal),
      piece.closest("[data-zone]").dataset.zone === "reserve" ? "generator" : "reserve"),
    help: () => {
      const suggestion = suggestedTransfer(state);
      transfer(demonstrateTransfer(state), suggestion?.destination);
    },
  });
  const unbindDrag = bindCrystalDrag(screen, move);
  render();
  audio.instruct(instructionFor(state));
  return () => {
    unbindDrag();
    unbindActions();
  };
}
