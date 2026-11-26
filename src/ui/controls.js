const paths = {
  back: '<path d="M20 12H4m7 7-7-7 7-7"/>',
  next: '<path d="M4 12h16m-7-7 7 7-7 7"/>',
  play: '<path d="M8 5.5v13L18 12 8 5.5Z" fill="currentColor" stroke-linejoin="round"/>',
  repeat: '<path d="M20 11a8 8 0 1 0-2 6m2-11v5h-5"/>',
  fullscreen: '<path d="M9 3H3v6m12-6h6v6M3 15v6h6m12-6v6h-6"/>',
  sound: '<path d="M3 9h4l5-4v14l-5-4H3V9Z"/><path class="sound-waves" d="M16 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/><path class="sound-unavailable" d="m4 3 16 18"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.3 8.8a2.8 2.8 0 0 1 5.4 1c0 2-2.7 2.1-2.7 4m0 3h.01"/>',
  tap: '<path d="M9 13V7a1.5 1.5 0 0 1 3 0v4l5 1a2.5 2.5 0 0 1 2 3l-1 4a2 2 0 0 1-2 2h-4a2 2 0 0 1-1.6-.8L6.5 15a1.4 1.4 0 0 1 2.2-1.7l.3.3M4 8l1 .5M7 3l.6 1M14 3l-.5 1"/>',
  bolt: '<path d="m13 2-9 12h7l-1 8 10-12h-7l1-8Z" fill="currentColor" stroke="none"/>',
  ship: '<path d="M9 15c-1-4 1-8 4-10 3-2 6-2 8-2 0 2 0 5-2 8-2 3-6 5-10 4Zm0-5-4 1-2 4h6m5 0-1 4-4 2v-6m-4 3-2 3 3-2"/><circle cx="15.5" cy="8.5" r="1.5"/>',
  star: '<path d="m12 2.5 2.9 5.9 6.5 1-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5-4.7-4.6 6.5-1L12 2.5Z"/>',
  spark: '<path d="M12 2c0 6-4 10-10 10 6 0 10 4 10 10 0-6 4-10 10-10-6 0-10-4-10-10Z" fill="currentColor" stroke="none"/>',
  direction: '<path d="M4 20 20 4m-8 0h8v8"/><circle cx="7" cy="9" r="1.3"/><circle cx="15" cy="19" r="1.3"/>',
  antenna: '<circle cx="12" cy="9" r="1.5" fill="currentColor"/><path d="m8 21 4-9 4 9M6 21h12M7.5 5a6 6 0 0 0 0 8m9-8a6 6 0 0 1 0 8M4 2a10 10 0 0 0 0 14M20 2a10 10 0 0 1 0 14"/>',
  lighthouse: '<path d="M4 21v-5a8 8 0 0 1 16 0v5m-12 0v-5a4 4 0 0 1 8 0v5M12 2v3M4 6l2 2m14-2-2 2"/>',
  lights: '<ellipse cx="12" cy="9" rx="3" ry="4"/><ellipse cx="5.5" cy="17" rx="3" ry="4"/><ellipse cx="18.5" cy="17" rx="3" ry="4"/>',
  story: '<path d="M12 5c-3-2-5-2-9-2v15c4 0 6 0 9 2 3-2 5-2 9-2V3c-4 0-6 0-9 2Zm0 0v15"/><path d="M6 8h2m8 0h2M6 12h2m8 0h2"/>',
};

export const lightPattern = '<span class="light-pattern" aria-hidden="true"><i></i><i></i><i></i></span>';

export function icon(name) {
  return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
}

export function control(action, label, symbol, style = "quiet") {
  const description = action === "listen" ? ' aria-describedby="audio-status"' : "";
  return `<button class="button button--${style}" type="button" data-action="${action}"${description}>
    ${icon(symbol)}<span>${label}</span>
  </button>`;
}

export function bindActions(container, handlers) {
  const controller = new AbortController();
  container.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (button && !button.disabled && Object.hasOwn(handlers, button.dataset.action)) {
      handlers[button.dataset.action](button, event);
    }
  }, { signal: controller.signal });

  return () => controller.abort();
}
