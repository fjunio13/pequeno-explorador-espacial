import { mountCrystals } from "../activities/crystals/index.js";
import { crystalConfiguration } from "../activities/crystals/logic.js";
import { mountStars } from "../activities/stars/index.js";
import { bindActions } from "../ui/controls.js";
import { completeScreen, homeScreen, mapScreen } from "../ui/screens.js";

const planets = [
  {
    id: "stars",
    name: "Planeta das Estrelas",
    image: new URL("../../assets/images/planeta-das-estrelas.webp", import.meta.url).href,
    symbol: "star",
    mount: mountStars,
    configuration: () => ({ targets: [1, 2, 3, 4, 5], starCount: 5 }),
    completion: { text: "Você contou as estrelas.", audio: "conclusao" },
  },
  {
    id: "crystals",
    name: "Planeta dos Cristais",
    image: new URL("../../assets/images/planeta-dos-cristais.webp", import.meta.url).href,
    symbol: "gem",
    mount: mountCrystals,
    configuration: crystalConfiguration,
    completion: { text: "Você ligou a estação!", audio: "cristais-conclusao" },
  },
];

export function startGame(container, audio) {
  let closeScreen = () => {};
  const completed = new Set();
  const visits = new Map();

  function open(mount, { focus = true } = {}) {
    closeScreen();
    audio.stop();
    closeScreen = mount();
    if (focus) {
      container.querySelector("h1").focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }
  }

  function show(markup, actions, instruction, options) {
    open(() => {
      container.innerHTML = markup;
      audio.instruct(instruction, options);
      return bindActions(container, { ...actions, listen: audio.repeat });
    }, options);
  }

  function home(options) {
    show(homeScreen(), { start: map }, "inicio", { ...options, playNow: false });
  }

  function map() {
    show(mapScreen(planets, completed), {
      home: () => home(),
      mission: (button) => {
        const planet = planets.find((item) => item.id === button.dataset.planet);
        if (planet) mission(planet);
      },
    }, "mapa");
  }

  function mission(planet) {
    const visit = visits.get(planet.id) ?? 0;
    visits.set(planet.id, visit + 1);
    open(() => planet.mount({
      container,
      configuration: planet.configuration(visit),
      audio,
      onComplete: () => finish(planet),
      onReturn: map,
    }));
  }

  function finish(planet) {
    completed.add(planet.id);
    show(completeScreen(planet), { map, mission: () => mission(planet) }, planet.completion.audio);
  }

  home({ focus: false });
}
