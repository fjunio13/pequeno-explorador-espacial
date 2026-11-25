import { isSolved } from "./logic.js";

export function roundPrompt(challenge) {
  if (challenge.mode === "build") return "Monte a carga";
  if (challenge.mode === "complete") return "Complete o painel";
  return challenge.relation === "more" ? "Qual tem mais energia?" : "Qual tem menos energia?";
}

function instructionFor({ mode, target, relation }) {
  if (mode === "build") return `oficina-montar-${target}`;
  if (mode === "complete") return `oficina-completar-${target}`;
  return relation === "more" ? "oficina-mais" : "oficina-menos";
}

export function feedbackFor(state) {
  const { challenge, issue, attempts } = state;
  const { mode, target } = challenge;
  if (isSolved(state)) {
    if (mode === "complete") return { cue: "oficina-painel-pronto", note: "Todas as luzes acenderam!" };
    if (mode === "compare") return { cue: "oficina-comparacao-pronta", note: "Veja a diferença entre as cargas." };
    const cue = [13, 18].includes(target) ? `oficina-carga-${target}` : "oficina-carga-pronta";
    return { cue, note: "Carga pronta!" };
  }

  if (attempts >= 3) return { cue: "oficina-pista", note: "Toque no que está brilhando." };
  if (issue === "excess") return { cue: "oficina-retirar", note: "Toque em menos para retirar energia." };
  if (issue === "space") return { cue: "oficina-sem-espaco", note: "Experimente um grupo menor." };
  if (attempts > 0 && mode === "compare") {
    return { cue: "oficina-comparar-ajuda", note: "Veja onde as fileiras são diferentes." };
  }
  if (attempts >= 2) return { cue: "oficina-espacos", note: "Veja quais espaços faltam." };
  if (attempts === 1) return { cue: "oficina-grupos", note: "Uma fileira cheia tem cinco energias." };
  return { cue: instructionFor(challenge), note: "" };
}
