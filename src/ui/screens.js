import { control, icon } from "./controls.js";

const launchArt = new URL("../../assets/images/astronauta-e-nave.webp", import.meta.url).href;
const planetArt = new URL("../../assets/images/planeta-das-estrelas.webp", import.meta.url).href;

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

export function mapScreen(completed) {
  return `
    <section class="screen sky-screen" data-screen="map">
      <div class="screen-toolbar">
        ${control("home", "Início", "back")}
        ${control("listen", "Ouvir", "sound")}
      </div>
      <div class="destination-layout">
        <div class="destination-copy">
          <h1 tabindex="-1">Mapa espacial</h1>
          <p>Toque no planeta para começar.</p>
        </div>
        <div class="orbit">
          <button class="planet-button" type="button" data-action="mission">
            <img class="planet-art" src="${planetArt}" alt="">
            <span class="planet-label">
              ${icon(completed ? "check" : "play")} Planeta das Estrelas
            </span>
          </button>
        </div>
      </div>
    </section>`;
}

export function completeScreen() {
  return `
    <section class="screen sky-screen complete-screen" data-screen="complete">
      <div class="screen-toolbar screen-toolbar--end">${control("listen", "Ouvir", "sound")}</div>
      <div class="destination-layout">
        <div class="destination-copy">
          <h1 tabindex="-1">Missão <strong>concluída!</strong></h1>
          <p>Você contou as estrelas.</p>
          <div class="mission-links">
            ${control("mission", "Jogar de novo", "repeat", "primary")}
            ${control("map", "Voltar ao mapa", "back")}
          </div>
        </div>
        <div class="orbit celebration" aria-hidden="true">
          <img class="planet-art" src="${planetArt}" alt="">
          <span>${icon("star")}</span>
          <span>${icon("star")}</span>
          <span>${icon("star")}</span>
        </div>
      </div>
    </section>`;
}
