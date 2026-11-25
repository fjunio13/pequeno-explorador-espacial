import { bindActions, control, icon } from "../../ui/controls.js";
import { createRoundAdvance } from "../round-advance.js";
import {
  demonstrateStar, hasTarget, nextRound, requestHelp, startCounting, suggestedStar, supportFor,
  targetFor, toggleStar,
} from "./logic.js";

const hintMessages = {
  retry: "tentar-novamente",
  hint: "pista",
  guided: "contar-juntos",
};

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

function instructionFor(state) {
  return hintMessages[supportFor(state)] ?? `pedido-${targetFor(state)}`;
}

function feedbackFor(state) {
  if (hasTarget(state)) return "Você encontrou a quantidade certa!";
  switch (supportFor(state)) {
    case "retry":
      return state.selected.length > targetFor(state)
        ? "Toque de novo para desmarcar uma estrela."
        : "Vamos contar de novo?";
    case "hint":
      return "Veja a estrela que está brilhando.";
    case "guided":
      return "Vamos contar juntos.";
    default:
      return "";
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
    const countTogether = supportFor(state) === "guided";

    target.textContent = amount;
    unit.textContent = amount === 1 ? "estrela" : "estrelas";
    count.textContent = `${state.selected.length} de ${amount}`;
    feedback.textContent = feedbackFor(state);
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
      button.querySelector(".star-number").textContent = position < 0 ? "" : String(position + 1);
    }

    if (matched && document.activeElement === help) {
      buttons[state.selected.at(-1)].focus({ preventScroll: true });
    }
    help.disabled = matched;
    help.querySelector("span").textContent = countTogether ? "Contar juntos" : "Ajuda";
  }

  function startRound() {
    render();
    audio.instruct(instructionFor(state));
  }

  function applySelection(next) {
    if (state === next) return;

    const matched = hasTarget(state);
    const supportChanged = supportFor(next) !== supportFor(state);
    state = next;
    transition.cancel();
    render();

    const success = `acerto-${targetFor(state)}`;
    if (hasTarget(state)) {
      transition.schedule(audio.instruct(success, { afterCurrent: true }));
      return;
    }

    if (matched) audio.interrupt(success);
    if (supportChanged && supportFor(state) !== "none") {
      audio.instruct(instructionFor(state), { afterCurrent: true });
      return;
    }

    if (matched) audio.instruct(instructionFor(state), { playNow: false });
    const selection = state.selected.length;
    audio.playIfIdle(selection ? `contagem-${selection}` : "desmarcar");
  }

  function askForHelp() {
    if (supportFor(state) === "guided") {
      applySelection(demonstrateStar(state));
      return;
    }

    state = requestHelp(state);
    render();
    audio.instruct(instructionFor(state), { afterCurrent: true });
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
