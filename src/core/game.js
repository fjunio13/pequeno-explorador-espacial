import { mountCrystals } from "../activities/crystals/index.js";
import { crystalConfiguration } from "../activities/crystals/logic.js";
import { mountDiscoveries } from "../activities/discoveries/index.js";
import { discoveryConfiguration } from "../activities/discoveries/logic.js";
import { mountEnergy } from "../activities/energy/index.js";
import { energyConfiguration, lastEnergyBand } from "../activities/energy/configuration.js";
import { energyArrivalScreen, energyCompleteScreen } from "../activities/energy/screens.js";
import { createRoundAdvance } from "../activities/round-advance.js";
import { mountStars } from "../activities/stars/index.js";
import { starConfiguration } from "../activities/stars/logic.js";
import { bindActions } from "../ui/controls.js";
import { arrivalScreen, completeScreen, finaleScreen, homeScreen, mapScreen } from "../ui/screens.js";

const planets = [
  {
    id: "stars",
    name: "Planeta das Estrelas",
    image: new URL("../../assets/images/planeta-das-estrelas.webp", import.meta.url).href,
    mount: mountStars,
    configuration: starConfiguration,
    arrival: { text: "As estrelas ajudam a encontrar a direção do sinal.", audio: "estrelas-chegada" },
    discovery: { symbol: "direction", text: "Direção do sinal", audio: "conclusao" },
  },
  {
    id: "crystals",
    name: "Planeta dos Cristais",
    image: new URL("../../assets/images/planeta-dos-cristais.webp", import.meta.url).href,
    mount: mountCrystals,
    configuration: crystalConfiguration,
    arrival: { text: "A estação está apagada. Vamos ligar o gerador?", audio: "cristais-chegada" },
    discovery: { symbol: "antenna", text: "Estação acesa e padrão de luz", audio: "cristais-conclusao" },
  },
  {
    id: "discoveries",
    name: "Planeta das Descobertas",
    image: new URL("../../assets/images/planeta-das-descobertas.webp", import.meta.url).href,
    mount: mountDiscoveries,
    configuration: discoveryConfiguration,
    arrival: { text: "Tem luzinhas piscando no vale. Vamos chegar perto?", audio: "descobertas-chegada" },
    discovery: { symbol: "lights", text: "As luzinhas enviaram o sinal", audio: "descobertas-conclusao" },
  },
];

export function startGame(container, audio) {
  let closeScreen = () => {};
  let finaleShown = false;
  let energyBand = 0;
  const completed = new Set();
  const visits = new Map();
  const energyVisits = Array(lastEnergyBand + 1).fill(0);

  function open(mount, { focus = true } = {}) {
    closeScreen();
    audio.stop();
    closeScreen = mount();
    if (focus) {
      container.querySelector("h1").focus({ preventScroll: true });
      window.scrollTo(0, 0);
    }
  }

  function show(markup, actions, instruction, { onEnd, focus, playNow } = {}) {
    open(() => {
      container.innerHTML = markup;
      const advance = onEnd && createRoundAdvance(onEnd);
      const firstPlay = audio.instruct(instruction, { playNow });
      advance?.schedule(firstPlay);
      const unbind = bindActions(container, {
        ...actions,
        listen: () => {
          const replay = audio.repeat();
          advance?.schedule(replay);
        },
      });
      return () => {
        advance?.cancel();
        unbind();
      };
    }, { focus });
  }

  function home(options) {
    show(homeScreen(), { start }, "inicio", { ...options, playNow: false });
  }

  async function start() {
    // Inicie a narração antes que o pedido de tela cheia consuma o gesto.
    map();
    if (!document.fullscreenEnabled || document.fullscreenElement) return;

    try {
      await document.documentElement.requestFullscreen({ navigationUI: "hide" });
    } catch {
      // O navegador pode restringir o modo de tela cheia.
    }
  }

  function map() {
    show(mapScreen(planets, visits, completed), {
      home: () => home(),
      mission: (button) => enterPlanet(planets.find((item) => item.id === button.dataset.planet)),
      arrival: (button) => arrive(planets.find((item) => item.id === button.dataset.planet)),
      workshop: enterWorkshop,
      finale,
    }, "mapa");
  }

  function enterPlanet(planet) {
    if (visits.has(planet.id)) mission(planet);
    else arrive(planet);
  }

  function arrive(planet) {
    const land = () => mission(planet);
    show(arrivalScreen(planet), { skip: land, map }, planet.arrival.audio, { onEnd: land });
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
    const nextPlanet = planets.find(({ id }) => !completed.has(id));
    const actions = { map, mission: () => mission(planet) };
    if (nextPlanet) actions["next-mission"] = () => enterPlanet(nextPlanet);
    const onEnd = !nextPlanet && !finaleShown ? finale : undefined;
    show(completeScreen(planet, nextPlanet), actions, planet.discovery.audio, { onEnd });
  }

  function finale() {
    finaleShown = true;
    show(finaleScreen(), { map }, "aventura-conclusao");
  }

  function enterWorkshop() {
    const begin = () => runWorkshop(energyBand);
    if (energyVisits.some(Boolean)) begin();
    else show(energyArrivalScreen(), { map, skip: begin }, "oficina-chegada", { onEnd: begin });
  }

  function runWorkshop(band, configuration = energyConfiguration(band, energyVisits[band]++)) {
    open(() => mountEnergy({
      container, configuration, audio, onReturn: map,
      onComplete: () => finishWorkshop(band, configuration),
    }));
  }

  function finishWorkshop(band, configuration) {
    const nextBand = Math.min(band + 1, lastEnergyBand);
    energyBand = Math.max(energyBand, nextBand);
    show(energyCompleteScreen(), {
      map,
      replay: () => runWorkshop(band, configuration),
      next: () => runWorkshop(nextBand),
    }, "oficina-pronta");
  }

  home({ focus: false });
}
