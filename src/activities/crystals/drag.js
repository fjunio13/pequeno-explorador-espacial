const dragDistance = 8;

function containsPoint(panel, x, y) {
  const bounds = panel.getBoundingClientRect();
  return x >= bounds.left && x <= bounds.right && y >= bounds.top && y <= bounds.bottom;
}

export function bindCrystalDrag(screen, move) {
  const controller = new AbortController();
  const options = { signal: controller.signal };
  const ghost = screen.querySelector("[data-crystal-ghost]");
  const panels = [...screen.querySelectorAll("[data-zone]")];
  let active;
  let ignoredClick;

  function destinationAt(event) {
    return panels.find((panel) => panel.dataset.zone !== active.from &&
      containsPoint(panel, event.clientX, event.clientY));
  }

  function reset() {
    if (!active) return;

    const { button, pointer } = active;
    active = undefined;
    button.removeAttribute("data-dragging");
    ghost.hidden = true;
    for (const panel of panels) panel.removeAttribute("data-drop");
    if (button.hasPointerCapture(pointer)) button.releasePointerCapture(pointer);
  }

  screen.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || event.button !== 0 || active) return;
    ignoredClick = undefined;

    const button = event.target.closest("button[data-action]:not([data-native-click])");
    if (!button || button.disabled) return;

    button.setPointerCapture(event.pointerId);
    active = {
      button,
      pointer: event.pointerId,
      from: button.closest("[data-zone]")?.dataset.zone,
      startX: event.clientX,
      startY: event.clientY,
      dragging: false,
    };
  }, options);

  screen.addEventListener("pointermove", (event) => {
    if (event.pointerId !== active?.pointer || !active.from) return;
    if (!active.dragging && Math.hypot(event.clientX - active.startX, event.clientY - active.startY) < dragDistance) {
      return;
    }

    active.dragging = true;
    active.button.dataset.dragging = "true";
    ghost.hidden = false;
    ghost.style.left = `${event.clientX}px`;
    ghost.style.top = `${event.clientY}px`;
    const destination = destinationAt(event);
    for (const panel of panels) panel.toggleAttribute("data-drop", panel === destination);
  }, options);

  screen.addEventListener("pointerup", (event) => {
    if (event.pointerId !== active?.pointer) return;

    const { button, dragging, from } = active;
    const destination = from && (dragging
      ? destinationAt(event)?.dataset.zone
      : from === "reserve" ? "generator" : "reserve");
    ignoredClick = event.pointerId;
    reset();

    if (destination) move(Number(button.dataset.crystal), destination);
    else if (!from && containsPoint(button, event.clientX, event.clientY)) button.click();
  }, options);

  function cancel(event) {
    if (event.pointerId === active?.pointer) reset();
  }
  screen.addEventListener("pointercancel", cancel, options);
  screen.addEventListener("lostpointercapture", cancel, options);

  // O ponteiro já foi tratado na soltura. A ativação por teclado continua pelo clique nativo.
  screen.addEventListener("click", (event) => {
    if (event.detail === 0 || event.pointerId !== ignoredClick || ignoredClick === undefined) return;
    ignoredClick = undefined;
    event.stopPropagation();
  }, { ...options, capture: true });

  return () => {
    controller.abort();
    reset();
  };
}
