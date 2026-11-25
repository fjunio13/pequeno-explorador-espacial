import { control, icon } from "./controls.js";

const launchArt = new URL("../../assets/images/astronauta-e-nave.webp", import.meta.url).href;

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

export function mapScreen(planets, completed) {
  const destinations = planets.map(({ id, image, name }) => `
    <div class="orbit">
      <button class="planet-button" type="button" data-action="mission" data-planet="${id}"
        data-completed="${completed.has(id)}"${completed.has(id) ? ' aria-description="Missão concluída"' : ""}>
        <img class="planet-art" src="${image}" alt="">
        <span class="planet-label">${icon(completed.has(id) ? "check" : "play")} ${name}</span>
      </button>
    </div>`).join("");

  return `
    <section class="screen sky-screen map-screen" data-screen="map">
      <div class="screen-toolbar">
        ${control("home", "Início", "back")}
        ${control("listen", "Ouvir", "sound")}
      </div>
      <div class="destination-layout map-layout">
        <div class="destination-copy">
          <h1 tabindex="-1">Mapa espacial</h1>
          <p>Toque em um planeta.</p>
        </div>
        <div class="planet-grid" role="group" aria-label="Planetas">${destinations}</div>
      </div>
    </section>`;
}

export function completeScreen(planet) {
  const sparkle = icon(planet.symbol);
  return `
    <section class="screen sky-screen complete-screen" data-screen="complete" data-planet="${planet.id}">
      <div class="screen-toolbar screen-toolbar--end">${control("listen", "Ouvir", "sound")}</div>
      <div class="destination-layout">
        <div class="destination-copy">
          <h1 tabindex="-1">Missão <strong>concluída!</strong></h1>
          <p>${planet.completion.text}</p>
          <div class="mission-links">
            ${control("mission", "Jogar de novo", "repeat", "primary")}
            ${control("map", "Voltar ao mapa", "back")}
          </div>
        </div>
        <div class="orbit celebration" aria-hidden="true">
          <img class="planet-art" src="${planet.image}" alt="">
          <span>${sparkle}</span>
          <span>${sparkle}</span>
          <span>${sparkle}</span>
        </div>
      </div>
    </section>`;
}
