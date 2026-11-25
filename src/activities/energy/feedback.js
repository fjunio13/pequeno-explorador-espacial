import { energyTotal, isSolved } from "./logic.js";

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

  if (!attempts) return { cue: instructionFor(challenge), note: "" };
  if (mode === "compare") {
    if (attempts === 3) {
      const cue = challenge.relation === "more" ? "oficina-pista-mais" : "oficina-pista-menos";
      return { cue, note: "Compare os espaços marcados." };
    }
    if (attempts === 2) return { cue: "oficina-comparar-fileiras", note: "Compare as fileiras dos dois lados." };
    return { cue: "oficina-comparar-ajuda", note: "Olhe as duas cargas." };
  }

  if (energyTotal(state) > target) return { cue: "oficina-retirar", note: "Toque em menos para retirar energia." };
  if (issue === "space" && attempts === 1) return { cue: "oficina-sem-espaco", note: "Experimente um grupo menor." };
  if (mode === "complete") {
    if (attempts === 3) return { cue: "oficina-encaixar-espacos", note: "Compare os espaços com as luzes das peças." };
    return { cue: "oficina-espacos", note: "Veja os espaços que faltam." };
  }
  if (attempts === 3) return { cue: "oficina-pista", note: "Experimente a peça que brilha." };
  if (attempts === 2) return { cue: "oficina-espacos", note: "Veja quantas luzes ainda faltam." };
  return { cue: "oficina-grupos", note: "Olhe as fileiras do pedido e da sua carga." };
}
