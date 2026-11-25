import { control } from "../../ui/controls.js";

const workshopArt = new URL("../../../assets/images/oficina-da-nave.webp", import.meta.url).href;

function picture() {
  return `<div class="story-picture energy-picture" aria-hidden="true"><img src="${workshopArt}" alt=""></div>`;
}

export function energyArrivalScreen() {
  return `
    <section class="screen sky-screen story-screen energy-story" data-screen="energy-arrival">
      <div class="screen-toolbar">
        ${control("map", "Voltar ao mapa", "back")}
        ${control("listen", "Ouvir", "sound")}
      </div>
      <div class="destination-layout">
        <div class="destination-copy">
          <h1 tabindex="-1">Oficina de <strong>Energia</strong></h1>
          <p>A nave precisa de energia para novas viagens. Vamos preparar as cargas?</p>
          <div class="mission-links">${control("skip", "Pular apresentação", "next", "primary")}</div>
        </div>
        ${picture()}
      </div>
    </section>`;
}

export function energyCompleteScreen() {
  return `
    <section class="screen sky-screen story-screen energy-story" data-screen="energy-complete">
      <div class="screen-toolbar">
        ${control("map", "Voltar ao mapa", "back")}
        ${control("listen", "Ouvir", "sound")}
      </div>
      <div class="destination-layout">
        <div class="destination-copy">
          <h1 tabindex="-1">Nave <strong>energizada!</strong></h1>
          <p>Os sistemas acenderam. A nave está pronta para novas viagens!</p>
          <div class="mission-links">
            ${control("next", "Mais desafios", "next", "primary")}
            ${control("replay", "Repetir desafios", "repeat")}
          </div>
        </div>
        ${picture()}
      </div>
    </section>`;
}
