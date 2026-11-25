import { control, icon, lightPattern } from "./controls.js";

const launchArt = new URL("../../assets/images/astronauta-e-nave.webp", import.meta.url).href;
const station = new URL("../../assets/images/estacao-cristais.webp", import.meta.url).href;
const lightling = new URL("../../assets/images/luzinha.webp", import.meta.url).href;
const creature = `<img src="${lightling}" alt="" width="280" height="252">`;

export function homeScreen() {
  return `
    <section class="screen intro-screen" data-screen="home">
      <img class="intro-art" src="${launchArt}" alt="" width="1600" height="900">
      <div class="intro-audio">${control("listen", "Ouvir", "sound")}</div>
      <div class="intro-copy">
        <h1 tabindex="-1">Pequeno Explorador <strong>Espacial</strong></h1>
        ${control("start", "Começar", "play", "primary")}
      </div>
    </section>`;
}

export function mapScreen(planets, visits, completed) {
  const destinations = planets.map(({ id, image, name, discovery }) => `
    <div class="orbit">
      <button class="planet-button" type="button" data-action="mission" data-planet="${id}" aria-label="${name}"
        data-completed="${completed.has(id)}"${completed.has(id) ? ` aria-description="${discovery.text}"` : ""}>
        <img class="planet-art" src="${image}" alt="">
        <span class="planet-label">${name}</span>
        ${completed.has(id) ? `<span class="planet-clue" data-clue="${discovery.symbol}" aria-hidden="true">${icon(discovery.symbol)}</span>` : ""}
      </button>
      ${visits.has(id) ? `<button class="button button--quiet arrival-replay" type="button" data-action="arrival" data-planet="${id}"
        aria-label="Rever chegada ao ${name}" title="Rever chegada">
        ${icon("story")}
      </button>` : ""}
    </div>`).join("");
  const canReply = completed.size === planets.length;

  return `
    <section class="screen sky-screen map-screen" data-screen="map">
      <div class="screen-toolbar">
        ${control("home", "Início", "back")}
        <h1 tabindex="-1">Mapa espacial</h1>
        ${control("listen", "Ouvir", "sound")}
      </div>
      <div class="map-layout">
        <div class="planet-grid" role="group" aria-label="Planetas">${destinations}</div>
        <div class="map-actions">
          ${control("workshop", "Oficina de Energia", "ship")}
          ${canReply ? control("finale", "Responder ao sinal", "antenna", "primary") : ""}
        </div>
      </div>
    </section>`;
}

function storyPicture(planet, discovered) {
  if (planet.id === "discoveries") {
    return `
      <div class="story-picture story-valley" data-discovered="${discovered}" aria-hidden="true">
        ${discovered ? lightPattern : ""}
        <div class="story-lights">${creature.repeat(discovered ? 3 : 2)}</div>
      </div>`;
  }
  if (planet.id === "crystals") {
    return `
      <div class="story-picture story-station" data-discovered="${discovered}" aria-hidden="true">
        ${discovered ? lightPattern : ""}
        <img src="${station}" alt="">
        <svg class="station-robot" viewBox="0 0 66 66">
          <g stroke="#242345" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M31 19v-8m-5 0h10" fill="none"/>
            <rect x="17" y="20" width="28" height="22" rx="7" fill="#f7d9b3"/>
            <path d="M22 42h18v14H22Zm3 14v6m12-6v6M22 46l-8 6" fill="#b1d9c9"/>
            <path class="robot-arm" d="M40 46l11-4 5-10" fill="none" stroke="#f3c699" stroke-width="5"/>
            <circle cx="26" cy="29" r="1" fill="#242345"/>
            <circle cx="36" cy="29" r="1" fill="#242345"/>
            <path d="M27 34q4 4 8 0" fill="none"/>
          </g>
        </svg>
      </div>`;
  }
  return `
    <div class="story-picture story-stars" data-discovered="${discovered}" aria-hidden="true">
      <img class="planet-art" src="${planet.image}" alt="">
      ${discovered ? `<svg class="story-route" viewBox="0 0 180 94">
        <path d="M10 76 54 49 91 64 157 17m-32 0h32v29" fill="none" stroke="currentColor"
          stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
        <circle cx="10" cy="76" r="4"/><circle cx="54" cy="49" r="5"/><circle cx="91" cy="64" r="5"/>
      </svg>` : `<span class="story-star">${icon("star")}</span>`}
    </div>`;
}

export function arrivalScreen(planet) {
  return `
    <section class="screen sky-screen story-screen" data-screen="arrival" data-planet="${planet.id}">
      <div class="screen-toolbar">
        ${control("map", "Voltar ao mapa", "back")}
        ${control("listen", "Ouvir", "sound")}
      </div>
      <div class="destination-layout">
        <div class="destination-copy">
          <h1 tabindex="-1">${planet.name}</h1>
          <p>${planet.arrival.text}</p>
          <div class="mission-links">${control("skip", "Pular apresentação", "next", "primary")}</div>
        </div>
        ${storyPicture(planet, false)}
      </div>
    </section>`;
}

export function completeScreen(planet, nextPlanet) {
  const next = nextPlanet ? `
    <button class="button button--primary next-mission" type="button" data-action="next-mission"
      data-planet="${nextPlanet.id}" aria-description="${nextPlanet.name}">
      <img src="${nextPlanet.image}" alt="">
      <span>Próxima missão</span>${icon("next")}
    </button>` : "";
  return `
    <section class="screen sky-screen story-screen complete-screen" data-screen="complete" data-planet="${planet.id}">
      <div class="screen-toolbar screen-toolbar--end">${control("listen", "Ouvir", "sound")}</div>
      <div class="destination-layout">
        <div class="destination-copy">
          <h1 tabindex="-1">Missão <strong>concluída!</strong></h1>
          <p class="mission-clue" data-clue="${planet.discovery.symbol}">
            ${icon(planet.discovery.symbol)} ${planet.discovery.text}
          </p>
          <div class="mission-links">
            ${next}
            ${control("mission", "Jogar de novo", "repeat")}
            ${control("map", "Voltar ao mapa", "back")}
          </div>
        </div>
        ${storyPicture(planet, true)}
      </div>
    </section>`;
}

export function finaleScreen() {
  return `
    <section class="screen sky-screen story-screen finale-screen" data-screen="finale">
      <div class="screen-toolbar">
        ${control("map", "Voltar ao mapa", "back")}
        ${control("listen", "Ouvir", "sound")}
      </div>
      <div class="destination-layout">
        <div class="destination-copy">
          <h1 tabindex="-1">Um sinal <strong>de volta!</strong></h1>
          <p>A nave piscou, e as luzinhas responderam.</p>
        </div>
        <div class="story-picture story-valley finale-picture" aria-hidden="true">
          <svg class="story-ship" viewBox="0 0 144 94" fill="none">
            <path d="M35 47C24 35 13 42 5 53c9 8 20 14 31 5" fill="#ffc979"/>
            <path d="m57 27-12-14-20 3 7 27m23 20-8 16-24-2 9-28" fill="#df826b" stroke="#ffb088" stroke-width="2"/>
            <path d="M29 36c21-23 71-24 108 3l4 8-4 8c-37 30-86 29-108 6Z" fill="#ffe7cb" stroke="#fec091" stroke-width="3"/>
            <path d="M119 29q13 7 22 18-8 12-22 19-11-21 0-37Z" fill="#ef9a82"/>
            <circle cx="78" cy="45" r="17" fill="#294161" stroke="#d4ae93" stroke-width="4"/>
            <path d="M69 41q4-8 13-7" stroke="#9ee8d0" stroke-width="4" stroke-linecap="round"/>
            <circle class="ship-lamp" cx="129" cy="47" r="5" fill="#fff0a6"/>
          </svg>
          ${lightPattern}
          <div class="story-lights">${creature.repeat(3)}</div>
        </div>
      </div>
    </section>`;
}
