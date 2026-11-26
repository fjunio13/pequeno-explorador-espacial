import { bindActions, control, icon, lightPattern } from "../../ui/controls.js";
import { createRoundAdvance } from "../round-advance.js";
import {
  chooseGroup, chooseNumber, explore, hidingPlaces, nextDiscovery, requestHelp, sceneFor, startDiscovery, visibleCount,
} from "./logic.js";

const lightling = new URL("../../../assets/images/luzinha.webp", import.meta.url).href;

const scenery = {
  rock: {
    name: "Pedra",
    drawing: '<path fill="#675586" d="M8 58 19 33 34 18l25 3 20 24-4 15H8Z"/><path fill="#b289b8" d="m19 33 15-15 25 3 20 24-31-4-22 14Z"/><path fill="#84689c" d="m23 53 25-12 31 4-4 15H10Z"/>',
  },
  flower: {
    name: "Flor do vale",
    drawing: '<path fill="#80a795" d="M42 61c-4-18-8-22-22-23 2 12 10 19 22 23Zm0 0c4-13 8-17 20-21-1 11-9 18-20 21Z"/><path fill="none" stroke="#b2c790" stroke-width="4" d="M44 61V30"/><path fill="#ce87b8" d="M44 34C19 39 21 10 36 19c-3-17 22-17 19 0 16-9 22 19-1 16Z"/><circle cx="45" cy="24" r="8" fill="#f6ab8b"/>',
  },
  arch: {
    name: "Arco",
    drawing: '<path fill="#6b578d" d="M9 60C12 33 21 12 42 12S73 33 79 60H62C58 43 52 30 42 30S27 44 25 60Z"/><path fill="#a079a4" d="M9 60C12 33 21 12 42 12c15 0 23 9 30 27l-13-2C54 24 47 22 42 22 25 24 21 44 19 60Z"/><path fill="none" stroke="#d49aaf" stroke-linecap="round" stroke-width="2" d="M24 26c5-6 10-9 17-9"/>',
  },
};

const comparisons = {
  more: ["Qual grupo tem mais luzinhas?", "descobertas-mais"],
  less: ["Qual grupo tem menos luzinhas?", "descobertas-menos"],
  equal: ["Os grupos têm a mesma quantidade?", "descobertas-iguais"],
};

function comparisonMarkup(groups) {
  return groups.map(({ amount, layout }, index) => {
    const side = index === 0 ? "left" : "right";
    const name = index === 0 ? "esquerda" : "direita";
    const creatures = Array.from({ length: amount }, (_, index) => `
      <span class="glow-creature" aria-hidden="true">
        <img src="${lightling}" alt="" draggable="false">
        <span class="discovery-count-mark">${index + 1}</span>
      </span>`).join("");
    return `<button class="discovery-group-choice" data-action="compare" data-choice="${side}"
      type="button" aria-label="Grupo da ${name}, ${amount} ${amount === 1 ? "luzinha" : "luzinhas"}">
      <span class="discovery-formation" data-layout="${layout}">${creatures}</span>
    </button>`;
  }).join("");
}

function activityMarkup(rounds) {
  const spots = hidingPlaces.map((place) => `
    <button type="button" class="discovery-spot" data-action="explore" data-place="${place}"
      aria-label="${scenery[place].name}">
      <svg aria-hidden="true" viewBox="0 0 88 68">${scenery[place].drawing}</svg>
      <span class="discovery-glint">${icon("spark")}</span>
    </button>`).join("");
  const creatures = Array.from({ length: 5 }, (_, index) => `
    <button type="button" class="glow-creature" data-action="count" data-count="${index + 1}"
      aria-label="Luzinha ${index + 1}" hidden>
      <img src="${lightling}" alt="" draggable="false">
      <span class="discovery-count-mark" aria-hidden="true">${index + 1}</span>
    </button>`).join("");
  const numbers = [0, 1, 2].map(() =>
    '<button class="discovery-number" type="button" data-action="number"></button>').join("");

  return `
    <section class="screen discovery-screen" data-screen="mission" data-planet="discoveries">
      <header class="screen-toolbar mission-toolbar">
        ${control("map", "Voltar ao mapa", "back")}
        <h1 tabindex="-1">Planeta das Descobertas</h1>
        ${control("listen", "Ouvir", "sound")}
      </header>
      <div class="discovery-board">
        <div class="discovery-brief">
          <p data-prompt></p>
          <div class="mission-progress" data-progress role="img">${'<span aria-hidden="true"></span>'.repeat(rounds)}</div>
        </div>
        <div class="discovery-valley">
          <div class="discovery-group" role="group" aria-label="Grupo de luzinhas">${creatures}</div>
          <div class="discovery-hollows" role="group" aria-label="Lugares para explorar">${spots}</div>
          <div class="discovery-comparison" role="group" aria-label="Compare os grupos do vale" hidden></div>
          ${lightPattern}
        </div>
        <div class="discovery-dock">
          <p role="status" data-feedback></p>
          <div class="discovery-numbers" role="group" aria-label="Quantas luzinhas?">${numbers}</div>
          <button class="discovery-number discovery-equal" type="button"
            data-action="compare" data-choice="equal" aria-label="Iguais" hidden>=</button>
          ${control("help", "Ajuda", "help")}
        </div>
      </div>
    </section>`;
}

function cueFor(state) {
  const { phase, attempts } = state;
  if (phase === "search") {
    return [
      `descobertas-procurar-${sceneFor(state).initial}`,
      "descobertas-explorar", "descobertas-pista", "descobertas-guia",
    ][attempts];
  }
  if (phase === "lit") return "descobertas-sinal";
  if (phase === "compare") {
    if (attempts === 1) return "descobertas-comparar-grupos";
    if (attempts >= 2) return "descobertas-comparar-pares";
    return comparisons[sceneFor(state).relation][1];
  }
  return ["descobertas-chegou", "descobertas-contar", "descobertas-contar", "descobertas-numero"][attempts];
}

function feedbackFor({ phase, attempts }) {
  if (phase === "lit") return "";
  if (phase === "compare") {
    return ["", "Olhe os dois lados do vale.", "Conte uma luzinha de cada lado.", "Veja se sobra alguma luzinha."][attempts];
  }
  if (phase === "search") {
    return ["", "Olhe os esconderijos.", "Veja onde o brilho aparece.", "Toque no brilho dourado."][attempts];
  }
  return ["Mais uma chegou!", "Veja as luzinhas juntas.", "Toque em cada luzinha para contar.", "Veja o número que brilha."][attempts];
}

export function mountDiscoveries({ container, configuration, audio, onComplete, onReturn }) {
  let state = startDiscovery(configuration);
  container.innerHTML = activityMarkup(configuration.length);

  const screen = container.querySelector(".discovery-screen");
  const group = screen.querySelector(".discovery-group");
  const hollows = screen.querySelector(".discovery-hollows");
  const creatures = [...group.querySelectorAll(".glow-creature")];
  const comparison = screen.querySelector(".discovery-comparison");
  const equals = screen.querySelector(".discovery-equal");
  const spots = [...screen.querySelectorAll(".discovery-spot")];
  const numbers = [...screen.querySelectorAll('[data-action="number"]')];
  const progress = screen.querySelector("[data-progress]");
  const prompt = screen.querySelector("[data-prompt]");
  const feedback = screen.querySelector("[data-feedback]");
  const help = screen.querySelector('[data-action="help"]');
  const listen = screen.querySelector('[data-action="listen"]');
  const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const gestures = new AbortController();
  let flight;
  let pressedRound;
  let lastCounted = 0;

  screen.querySelector(".discovery-board").addEventListener("pointerdown", (event) => {
    if (event.isPrimary && event.button === 0) pressedRound = state.round;
  }, { signal: gestures.signal });

  const advance = createRoundAdvance(() => {
    state = nextDiscovery(state);
    if (state) startRound();
    else onComplete();
  });

  function markCount() {
    const guide = state.phase === "count" && state.attempts >= 2 && lastCounted < visibleCount(state);
    for (const [index, creature] of creatures.entries()) {
      creature.toggleAttribute("data-counted", index + 1 === lastCounted);
      creature.toggleAttribute("data-count-hint", guide && index === lastCounted);
    }
  }

  function render() {
    const scene = sceneFor(state);
    const { phase, attempts, round } = state;
    const comparing = scene.kind === "compare";
    const lit = phase === "lit";
    screen.dataset.phase = phase;
    screen.dataset.mode = scene.kind;
    group.hidden = comparing;
    hollows.hidden = comparing;
    comparison.hidden = !comparing;
    equals.hidden = !comparing;
    help.disabled = lit;
    feedback.textContent = feedbackFor(state);
    progress.setAttribute("aria-label", `Descoberta ${round + 1} de ${configuration.length}`);
    for (const [index, dot] of [...progress.children].entries()) {
      dot.dataset.status = index < round || (index === round && lit)
        ? "done"
        : index === round ? "active" : "waiting";
    }

    if (comparing) {
      for (const button of numbers) button.hidden = true;
      const pairs = Math.min(...scene.groups.map(({ amount }) => amount));
      prompt.textContent = lit ? "As luzinhas piscaram juntas!" : comparisons[scene.relation][0];
      equals.disabled = lit;
      equals.toggleAttribute("data-answered", state.choice === "equal");
      for (const choice of comparison.children) {
        choice.disabled = lit;
        choice.toggleAttribute("data-help-focus", !lit && attempts === 1);
        choice.toggleAttribute("data-chosen", lit && (state.choice === "equal" || choice.dataset.choice === state.choice));
        for (const [index, creature] of [...choice.firstElementChild.children].entries()) {
          creature.toggleAttribute("data-pair", !lit && attempts >= 2 && index < pairs);
          creature.toggleAttribute("data-unpaired", !lit && attempts === 3 && index >= pairs);
        }
      }
      return;
    }

    const searching = phase === "search";
    const total = visibleCount(state);
    group.dataset.layout = scene.layout;
    hollows.toggleAttribute("data-help-focus", searching && attempts === 1);
    group.toggleAttribute("data-help-focus", phase === "count" && attempts === 1);
    prompt.textContent = searching ? "Procure o brilho no vale" : lit ? "As luzinhas piscaram juntas!" : "Quantas luzinhas estão juntas?";

    for (const spot of spots) {
      const hiding = searching && spot.dataset.place === scene.hidingPlace;
      spot.disabled = !searching;
      spot.toggleAttribute("data-glint", hiding);
      spot.toggleAttribute("data-bright", hiding && attempts >= 2);
      spot.toggleAttribute("data-guide", hiding && attempts === 3);
    }
    for (const [index, creature] of creatures.entries()) {
      creature.hidden = index >= total;
      creature.disabled = lit;
      creature.toggleAttribute("data-new", !searching && index === total - 1);
    }
    for (const [index, button] of numbers.entries()) {
      const value = scene.numbers[index];
      button.textContent = value;
      button.hidden = searching;
      button.disabled = lit;
      button.toggleAttribute("data-guide", phase === "count" && attempts >= 3 && value === total);
      button.toggleAttribute("data-answered", lit && value === total);
    }
    markCount();
  }

  function startRound() {
    flight?.cancel();
    flight = undefined;
    const scene = sceneFor(state);
    comparison.innerHTML = scene.kind === "compare" ? comparisonMarkup(scene.groups) : "";
    for (const spot of spots) spot.removeAttribute("data-explored");
    lastCounted = 0;
    render();
    audio.instruct(cueFor(state));
  }

  function flyFrom(origin, creature) {
    if (motion.matches) return;
    const target = creature.getBoundingClientRect();
    const x = origin.left + origin.width / 2 - target.left - target.width / 2;
    const y = origin.top + origin.height / 2 - target.top - target.height / 2;
    flight = creature.animate([
      { transform: `translate(${x}px, ${y}px) scale(0.38)`, opacity: 0.3 },
      { transform: `translate(${x * 0.45}px, ${Math.min(y, 0) - 26}px) scale(0.85)`, opacity: 1 },
      { transform: "translate(0) scale(1)", opacity: 1 },
    ], { duration: 580, easing: "ease-in-out" });
  }

  function uncover(spot) {
    if (state.phase !== "search") return;
    const origin = spot.getBoundingClientRect();
    const focused = document.activeElement === spot;
    state = explore(state, spot.dataset.place);
    spot.setAttribute("data-explored", "");
    if (state.phase === "count") lastCounted = 0;
    render();
    if (state.phase === "count") {
      flyFrom(origin, creatures[visibleCount(state) - 1]);
      if (focused) numbers[0].focus({ preventScroll: true });
    }
    audio.instruct(cueFor(state), { afterCurrent: true });
  }

  function answer(button, event, next) {
    if (event.detail !== 0 && pressedRound !== state.round) return;
    const focused = document.activeElement === button;
    state = next;
    if (state.phase === "count") lastCounted = 0;
    render();
    const response = audio.instruct(cueFor(state), { afterCurrent: true });
    if (state.phase === "lit") {
      if (focused) listen.focus({ preventScroll: true });
      advance.schedule(response);
    }
  }

  const unbind = bindActions(container, {
    map: onReturn,
    listen: () => {
      const replay = audio.repeat();
      if (state.phase === "lit") advance.schedule(replay);
    },
    help: () => {
      state = requestHelp(state);
      if (state.phase === "count") lastCounted = 0;
      render();
      audio.instruct(cueFor(state), { afterCurrent: true });
    },
    explore: (spot, event) => {
      if (event.detail === 0 || pressedRound === state.round) uncover(spot);
    },
    count: (creature, event) => {
      if (event.detail !== 0 && pressedRound !== state.round) return;
      lastCounted = Number(creature.dataset.count);
      markCount();
      audio.playIfIdle(`contagem-${lastCounted}`);
    },
    number: (button, event) => answer(button, event, chooseNumber(state, Number(button.textContent))),
    compare: (button, event) => answer(button, event, chooseGroup(state, button.dataset.choice)),
  });

  startRound();
  return () => {
    advance.cancel();
    flight?.cancel();
    gestures.abort();
    unbind();
  };
}
