import { bindActions, control, icon } from "../../ui/controls.js";
import { createRoundAdvance } from "../round-advance.js";
import {
  hasTarget, nextRound, requestHelp, startCounting, suggestedStar, supportFor,
  targetFor, toggleStar,
} from "./logic.js";

function starButton(index) {
  return `<button class="star-button" type="button" data-action="star" data-star="${index}"
    aria-label="Estrela ${index + 1}" aria-pressed="false">
    ${icon("star")}<span class="star-number" aria-hidden="true"></span>
  </button>`;
}

function activityMarkup({ targets, starCount }) {
  const progress = targets.map(() => '<span aria-hidden="true"></span>').join("");
  const stars = Array.from({ length: starCount }, (_, index) => starButton(index)).join("");

  return `
    <section class="screen mission-screen" data-screen="mission" data-planet="stars">
      <header class="screen-toolbar mission-toolbar">
        ${control("map", "Voltar ao mapa", "back")}
        <h1 tabindex="-1">Planeta das Estrelas</h1>
        ${control("listen", "Ouvir", "sound")}
      </header>
      <div class="count-stage">
        <div class="mission-heading">
          <p class="mission-request">Encontre <strong data-target></strong> <span data-unit></span></p>
          <div class="mission-progress" role="img" data-progress>${progress}</div>
        </div>
        <div class="star-line" role="group" aria-label="Estrelas para contar">${stars}</div>
        <div class="mission-footer">
          <div class="mission-feedback">
            <p class="count-total" data-count></p>
            <p class="count-note" role="status" data-feedback></p>
          </div>
          ${control("help", "Ajuda", "help")}
        </div>
      </div>
    </section>`;
}

function feedbackFor(state) {
  const amount = targetFor(state);
  const excess = state.selected.length > amount;
  const request = `pedido-${amount}`;
  if (hasTarget(state)) return { cue: `acerto-${amount}`, note: "Você encontrou a quantidade certa!" };
  switch (supportFor(state)) {
    case "orient":
      return excess ? { cue: "estrelas-sobram", note: "Toque numa estrela acesa para apagar." }
        : { cue: request, note: "Veja as estrelas para contar." };
    case "hint":
      return excess ? { cue: "estrelas-sobram", note: "Apague uma das estrelas acesas." }
        : { cue: "estrelas-faltam", note: "Ainda faltam estrelas. Veja as apagadas." };
    case "guided":
      return excess ? { cue: "estrelas-guia-retirar", note: "Toque na estrela marcada para apagar." }
        : { cue: "contar-juntos", note: "Toque na estrela que brilha." };
    default:
      return { cue: request, note: "" };
  }
}

export function mountStars({ container, configuration, audio, onComplete, onReturn }) {
  let state = startCounting(configuration);
  container.innerHTML = activityMarkup(state);

  const stage = container.querySelector(".count-stage");
  const sky = stage.querySelector(".star-line");
  const buttons = [...sky.children];
  const target = stage.querySelector("[data-target]");
  const unit = stage.querySelector("[data-unit]");
  const count = stage.querySelector("[data-count]");
  const feedback = stage.querySelector("[data-feedback]");
  const progress = stage.querySelector("[data-progress]");
  const help = stage.querySelector('[data-action="help"]');
  const gestures = new AbortController();
  let pressedRound;
  sky.addEventListener("pointerdown", (event) => {
    if (event.isPrimary && event.button === 0) pressedRound = state.round;
  }, { signal: gestures.signal });

  const transition = createRoundAdvance(() => {
    state = nextRound(state);
    if (!state) {
      onComplete();
      return;
    }

    startRound();
  });

  function render() {
    const amount = targetFor(state);
    const matched = hasTarget(state);
    const suggestion = suggestedStar(state);
    const support = supportFor(state);
    const excess = state.selected.length > amount;

    target.textContent = amount;
    unit.textContent = amount === 1 ? "estrela" : "estrelas";
    count.textContent = `${state.selected.length} de ${amount}`;
    feedback.textContent = feedbackFor(state).note;
    sky.toggleAttribute("data-help-focus", support === "orient");
    stage.dataset.matched = String(matched);
    progress.setAttribute("aria-label", `Rodada ${state.round + 1} de ${state.targets.length}`);
    for (const [index, dot] of [...progress.children].entries()) {
      dot.dataset.status = index < state.round || (index === state.round && matched)
        ? "done"
        : index === state.round ? "active" : "waiting";
    }

    for (const [index, button] of buttons.entries()) {
      const position = state.selected.indexOf(index);
      button.setAttribute("aria-pressed", String(position >= 0));
      button.dataset.suggested = String(index === suggestion);
      button.toggleAttribute("data-help-choice", support === "hint" && (position >= 0) === excess);
      button.querySelector(".star-number").textContent = position < 0 ? "" : String(position + 1);
    }

    if (matched && document.activeElement === help) {
      buttons[state.selected.at(-1)].focus({ preventScroll: true });
    }
    help.disabled = matched;
  }

  function startRound() {
    render();
    audio.instruct(feedbackFor(state).cue);
  }

  function applySelection(next) {
    if (state === next) return;

    const matched = hasTarget(state);
    const previousCue = feedbackFor(state).cue;
    state = next;
    transition.cancel();
    render();

    const cue = feedbackFor(state).cue;
    if (hasTarget(state)) {
      transition.schedule(audio.instruct(cue, { afterCurrent: true }));
      return;
    }

    if (matched) audio.interrupt(previousCue);
    if (cue !== previousCue && supportFor(state) !== "none") {
      audio.instruct(cue, { afterCurrent: true });
      return;
    }

    if (matched) audio.instruct(cue, { playNow: false });
    const selection = state.selected.length;
    audio.playIfIdle(selection ? `contagem-${selection}` : "desmarcar");
  }

  function askForHelp() {
    state = requestHelp(state);
    render();
    audio.instruct(feedbackFor(state).cue, { afterCurrent: true });
  }

  const unbind = bindActions(container, {
    star: (button, event) => {
      // Um toque iniciado durante a celebração não conta para a rodada seguinte.
      if (event.detail !== 0 && pressedRound !== state.round) return;
      applySelection(toggleStar(state, Number(button.dataset.star)));
    },
    help: askForHelp,
    listen: () => {
      const replay = audio.repeat();
      if (hasTarget(state)) transition.schedule(replay);
    },
    map: onReturn,
  });
  startRound();
  return () => {
    transition.cancel();
    gestures.abort();
    unbind();
  };
}
