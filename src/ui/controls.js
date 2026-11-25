const paths = {
  back: '<path d="M20 12H4m7 7-7-7 7-7"/>',
  next: '<path d="M4 12h16m-7-7 7 7-7 7"/>',
  play: '<path d="M8 5.5v13L18 12 8 5.5Z" fill="currentColor" stroke-linejoin="round"/>',
  repeat: '<path d="M20 11a8 8 0 1 0-2 6m2-11v5h-5"/>',
  sound: '<path d="M3 9h4l5-4v14l-5-4H3V9Zm13-1a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.3 8.8a2.8 2.8 0 0 1 5.4 1c0 2-2.7 2.1-2.7 4m0 3h.01"/>',
  bolt: '<path d="m13 2-9 12h7l-1 8 10-12h-7l1-8Z" fill="currentColor" stroke="none"/>',
  gem: '<path d="m12 2 7 7-2 11H7L5 9l7-7Z"/>',
  star: '<path d="m12 2.5 2.9 5.9 6.5 1-4.7 4.6 1.1 6.5-5.8-3.1-5.8 3.1 1.1-6.5-4.7-4.6 6.5-1L12 2.5Z"/>',
};

export function icon(name) {
  return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
}

export function control(action, label, symbol, style = "quiet") {
  return `<button class="button button--${style}" type="button" data-action="${action}">
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
