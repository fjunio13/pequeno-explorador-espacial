import { bindActions, control, icon } from "../../ui/controls.js";
import { checkCount, nextRound, startCounting, suggestedStar, supportFor, targetFor, toggleStar } from "./logic.js";

const hintMessages = {
  hint: "pista",
  guided: "contar-juntos",
};

function starButton(index) {
  return `<button class="star-button" type="button" data-action="star" data-star="${index}"
    aria-label="Estrela ${index + 1}" aria-pressed="false">
    ${icon("star")}<span class="star-number" aria-hidden="true"></span>
  </button>`;
}

function activityMarkup({ starCount, targets }) {
  const stars = Array.from({ length: starCount }, (_, index) => starButton(index)).join("");
  const progress = targets.map(() => '<span aria-hidden="true"></span>').join("");

  return `
    <section class="screen mission-screen" data-screen="mission">
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
          ${control("verify", "Conferir", "check", "primary")}
        </div>
      </div>
    </section>`;
}

function instructionFor(state) {
  if (state.confirmed) return `acerto-${targetFor(state)}`;

  const hint = hintMessages[supportFor(state)];
  if (!hint) return `pedido-${targetFor(state)}`;
  return state.selected.length === targetFor(state) ? "conferir-agora" : hint;
}

function feedbackFor(state) {
  if (state.confirmed) return "Você encontrou a quantidade certa!";
  const support = supportFor(state);
  if (support === "retry") return "Vamos contar de novo?";
  if (support === "none") return "";
  if (state.selected.length === targetFor(state)) return "Agora, toque em Conferir.";
  if (support === "hint") return "Veja a estrela que está brilhando.";
  return "Vamos contar juntos.";
}

export function mountStars({ container, configuration, audio, onComplete, onReturn }) {
  let state = startCounting(configuration);
  container.innerHTML = activityMarkup(state);

  const buttons = [...container.querySelectorAll("[data-star]")];
  const stage = container.querySelector(".count-stage");
  const target = container.querySelector("[data-target]");
  const unit = container.querySelector("[data-unit]");
  const count = container.querySelector("[data-count]");
  const feedback = container.querySelector("[data-feedback]");
  const progress = container.querySelector("[data-progress]");
  const verify = container.querySelector('[data-action="verify"]');

  function render() {
    const amount = targetFor(state);
    const support = supportFor(state);
    const suggestion = suggestedStar(state);
    const ready = state.selected.length === amount;
    const lastRound = state.round + 1 === state.targets.length;

    target.textContent = amount;
    unit.textContent = amount === 1 ? "estrela" : "estrelas";
    count.textContent = `${state.selected.length} de ${amount}`;
    feedback.textContent = feedbackFor(state);
    stage.dataset.confirmed = String(state.confirmed);
    progress.setAttribute("aria-label", `Rodada ${state.round + 1} de ${state.targets.length}`);
    for (const [index, dot] of [...progress.children].entries()) {
      dot.dataset.status = index < state.round || (index === state.round && state.confirmed)
        ? "done"
        : index === state.round ? "active" : "waiting";
    }

    for (const [index, button] of buttons.entries()) {
      const position = state.selected.indexOf(index);
      button.setAttribute("aria-pressed", String(position >= 0));
      button.disabled = state.confirmed;
      button.dataset.suggested = String(index === suggestion);
      button.querySelector(".star-number").textContent = position < 0 ? "" : String(position + 1);
    }

    let label = "Conferir";
    if (state.confirmed) label = lastRound ? "Concluir" : "Continuar";
    else if (support === "guided" && !ready) label = "Contar juntos";
    verify.innerHTML = `${icon(state.confirmed ? "next" : "check")}<span>${label}</span>`;
    verify.dataset.suggested = String(!state.confirmed && ready && suggestion === null && Boolean(hintMessages[support]));
  }

  function speakCount() {
    const selection = state.selected.length;
    audio.instruct(instructionFor(state), { playNow: false });
    audio.play(selection ? `contagem-${selection}` : "desmarcar");
  }

  function pick(button) {
    state = toggleStar(state, Number(button.dataset.star));
    render();
    speakCount();
  }

  function verifyCount() {
    if (state.confirmed) {
      state = nextRound(state);
      if (!state) {
        onComplete();
        return;
      }
      render();
      audio.instruct(instructionFor(state));
      return;
    }

    const previousCount = state.selected.length;
    state = checkCount(state);
    render();

    if (state.selected.length !== previousCount) speakCount();
    else if (supportFor(state) === "retry") audio.play("tentar-novamente");
    else audio.instruct(instructionFor(state));
  }

  const unbind = bindActions(container, {
    star: pick,
    verify: verifyCount,
    listen: audio.repeat,
    map: onReturn,
  });
  render();
  audio.instruct(instructionFor(state));
  return unbind;
}
