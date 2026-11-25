import { bindActions, control, icon } from "../../ui/controls.js";
import { createRoundAdvance } from "../round-advance.js";
import { feedbackFor, roundPrompt } from "./feedback.js";
import {
  addModule, chooseCharge, energyTotal, isSolved, removeModule, requestHelp, startChallenge, suggestion, tenFrames,
} from "./logic.js";

function frames(amount, capacity, fixed = 0) {
  let index = 0;
  return tenFrames(amount, capacity).map((counts) => {
    const rows = counts.map((count) => {
      const cells = Array.from({ length: 5 }, (_, column) => {
        const prelit = index++ < fixed ? " data-fixed" : "";
        return '<span class="energy-cell"' + (column < count ? " data-lit" : "") + prelit + "></span>";
      }).join("");
      return '<span class="energy-row">' + cells + "</span>";
    }).join("");
    return '<span class="energy-frame"' + (counts.every((count) => count === 5) ? " data-full" : "") + ">" + rows + "</span>";
  }).join("");
}

function board(challenge) {
  const { mode, target, capacity, start, loads } = challenge;
  if (mode === "compare") {
    return loads.map((load, side) => `
      <button class="energy-panel energy-side" type="button" data-action="choose" data-value="${side}"
        aria-pressed="false" aria-label="Carga da ${side === 0 ? "esquerda" : "direita"}">
        <span class="energy-panel-heading"><span>Carga ${side === 0 ? "A" : "B"}</span>
          <strong data-comparison-number hidden>${load}</strong></span>
        <span class="energy-frames" aria-hidden="true">${frames(load, capacity)}</span>
      </button>`).join("");
  }

  const goal = mode === "build" ? `
    <div class="energy-panel energy-goal" aria-label="Carga pedida de ${target} energias">
      <div class="energy-panel-heading"><span>${icon("bolt")} Pedido da nave</span><strong data-target>${target}</strong></div>
      <div class="energy-frames" aria-hidden="true">${frames(target, capacity)}</div>
    </div>` : "";
  return `${goal}
    <div class="energy-panel energy-loaded" data-live>
      <div class="energy-panel-heading">
        <span>${icon("bolt")} ${mode === "build" ? "Sua carga" : "Painel da nave"}</span>
        <strong data-total>${start ?? 0}</strong>
      </div>
      <div class="energy-frames" aria-hidden="true">${frames(start ?? 0, capacity, start)}</div>
    </div>`;
}

function tray(challenge) {
  const { modules } = challenge;
  if (!modules) return "";
  return modules.map((value) => {
    const label = value === 1 ? "uma unidade" : `grupo de ${value}`;
    const lights = '<i></i>'.repeat(value);
    return `
      <div class="energy-module">
        <button class="energy-add" type="button" data-action="add" data-value="${value}" aria-label="Encaixar ${label}">
          <strong>${value}</strong>
          <span class="energy-piece" style="--columns:${Math.min(5, value)}" aria-hidden="true">${lights}</span>
        </button>
        <button class="energy-remove" type="button" data-action="remove" data-value="${value}" aria-label="Retirar ${label}">
          <span aria-hidden="true">−</span>
        </button>
      </div>`;
  }).join("");
}

function workshopMarkup(rounds) {
  return `
    <section class="screen energy-screen" data-screen="energy">
      <header class="screen-toolbar mission-toolbar">
        ${control("map", "Voltar ao mapa", "back")}
        <h1 tabindex="-1">Oficina de Energia</h1>
        ${control("listen", "Ouvir", "sound")}
      </header>
      <div class="energy-console">
        <div class="energy-brief">
          <h2 data-prompt></h2>
          <div class="mission-progress" role="img" data-progress>${'<span aria-hidden="true"></span>'.repeat(rounds)}</div>
        </div>
        <div class="energy-panels" role="group" aria-label="Painéis de energia" data-panels></div>
        <div class="energy-dock">
          <div class="energy-tray" role="group" aria-label="Módulos de energia" data-tray></div>
          ${control("help", "Ajuda", "help")}
        </div>
        <p class="energy-note" role="status" data-note></p>
      </div>
    </section>`;
}

function refreshLoad(panel, state) {
  const amount = energyTotal(state);
  const { target } = state.challenge;
  panel.querySelector("[data-total]").textContent = amount;
  for (const [index, cell] of [...panel.querySelectorAll(".energy-cell")].entries()) {
    cell.toggleAttribute("data-lit", index < amount);
    cell.toggleAttribute("data-needed", state.attempts >= 2 && index >= amount && index < target);
    cell.toggleAttribute("data-extra", state.attempts >= 2 && index >= target && index < amount);
  }
  for (const [index, frame] of [...panel.querySelectorAll(".energy-frame")].entries()) {
    frame.toggleAttribute("data-full", amount >= 10 * (index + 1));
  }
}

function refreshComparison(sides, { challenge, choice, attempts }, solved) {
  const [low, high] = [...challenge.loads].sort((a, b) => a - b);
  for (const [side, panel] of sides.entries()) {
    panel.setAttribute("aria-pressed", String(choice === side));
    panel.querySelector("[data-comparison-number]").hidden = !solved && attempts < 2;
    for (const [index, cell] of [...panel.querySelectorAll(".energy-cell")].entries()) {
      cell.toggleAttribute("data-difference", (solved || attempts >= 2) && index >= low && index < high);
    }
  }
}

export function mountEnergy({ container, configuration, audio, onComplete, onReturn }) {
  container.innerHTML = workshopMarkup(configuration.length);

  const screen = container.querySelector(".energy-screen");
  const panels = screen.querySelector("[data-panels]");
  const modules = screen.querySelector("[data-tray]");
  const progress = screen.querySelector("[data-progress]");
  const prompt = screen.querySelector("[data-prompt]");
  const note = screen.querySelector("[data-note]");
  const help = screen.querySelector('[data-action="help"]');
  const gestures = new AbortController();
  let round = 0;
  let pressedRound;
  let state;

  screen.addEventListener("pointerdown", (event) => {
    if (event.isPrimary && event.button === 0) pressedRound = round;
  }, { signal: gestures.signal });

  const advance = createRoundAdvance(() => {
    round++;
    if (round < configuration.length) openRound();
    else onComplete();
  });

  function render() {
    const { challenge, pieces, attempts } = state;
    const solved = isSolved(state);
    const hint = suggestion(state);
    const status = solved ? "done" : "active";
    screen.dataset.mode = challenge.mode;
    screen.dataset.solved = String(solved);
    screen.dataset.assistance = String(attempts);
    note.textContent = feedbackFor(state).note;
    help.disabled = solved;
    for (const [index, dot] of [...progress.children].entries()) {
      dot.dataset.status = index < round ? "done" : index === round ? status : "waiting";
    }

    const live = panels.querySelector("[data-live]");
    if (live) refreshLoad(live, state);
    else refreshComparison([...panels.children], state, solved);

    for (const button of screen.querySelectorAll("button[data-value]")) {
      const value = Number(button.dataset.value);
      const action = button.dataset.action;
      button.toggleAttribute("data-guide", hint?.action === action && hint.value === value);
      if (action === "remove") button.disabled = !pieces.includes(value);
    }
  }

  function openRound() {
    state = startChallenge(configuration[round]);
    panels.innerHTML = board(state.challenge);
    modules.innerHTML = tray(state.challenge);
    modules.hidden = state.challenge.mode === "compare";
    prompt.textContent = roundPrompt(state.challenge);
    progress.setAttribute("aria-label", `Desafio ${round + 1} de ${configuration.length}`);
    render();
    audio.instruct(feedbackFor(state).cue);
  }

  function apply(next, { explain = false, effect } = {}) {
    if (next === state) return;
    const previous = state;
    const previousCue = feedbackFor(previous).cue;
    state = next;
    advance.cancel();
    render();
    const { cue, note: message } = feedbackFor(state);
    if (isSolved(state)) {
      advance.schedule(audio.instruct(cue, { afterCurrent: true }));
      return;
    }
    if (isSolved(previous)) audio.interrupt(previousCue);
    if (cue !== previousCue || explain) audio.instruct(cue, { afterCurrent: true, playNow: Boolean(message) });
    if (effect && previous.pieces !== state.pieces) audio.playIfIdle(effect);
  }

  function operate(change, effect) {
    return (button, event) => {
      if (event.detail !== 0 && pressedRound !== round) return;
      apply(change(state, Number(button.dataset.value)), { effect });
    };
  }

  const unbind = bindActions(container, {
    map: onReturn,
    listen: () => {
      const replay = audio.repeat();
      if (isSolved(state)) advance.schedule(replay);
    },
    help: () => apply(requestHelp(state), { explain: true }),
    add: operate(addModule, "cristais-encaixe"),
    remove: operate(removeModule, "cristais-retirar"),
    choose: operate(chooseCharge),
  });

  openRound();
  return () => {
    advance.cancel();
    gestures.abort();
    unbind();
  };
}
