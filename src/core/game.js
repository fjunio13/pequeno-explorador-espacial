import { mountStars } from "../activities/stars/index.js";
import { bindActions } from "../ui/controls.js";
import { completeScreen, homeScreen, mapScreen } from "../ui/screens.js";

const stars = { targets: [1, 2, 3, 4, 5], starCount: 5 };

export function startGame(container, audio) {
  let closeScreen = () => {};
  let missionCompleted = false;

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
    show(mapScreen(missionCompleted), { home: () => home(), mission }, "mapa");
  }

  function mission() {
    open(() => mountStars({
      container,
      configuration: stars,
      audio,
      onComplete: finish,
      onReturn: map,
    }));
  }

  function finish() {
    missionCompleted = true;
    show(completeScreen(), { map, mission }, "conclusao");
  }

  home({ focus: false });
}
