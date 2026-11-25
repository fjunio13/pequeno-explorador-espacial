export const messages = Object.freeze({
  inicio: "Vamos viajar pelo espaço? Toque no botão de começar.",
  mapa: "Toque em um planeta para começar uma missão.",
  "pedido-1": "Toque em uma estrela. Depois, confira.",
  "pedido-2": "Toque em duas estrelas. Depois, confira.",
  "pedido-3": "Toque em três estrelas. Depois, confira.",
  "pedido-4": "Toque em quatro estrelas. Depois, confira.",
  "pedido-5": "Toque em cinco estrelas. Depois, confira.",
  "contagem-1": "Um.",
  "contagem-2": "Dois.",
  "contagem-3": "Três.",
  "contagem-4": "Quatro.",
  "contagem-5": "Cinco.",
  "acerto-1": "Uma estrela! Toque na seta para continuar.",
  "acerto-2": "Duas estrelas! Toque na seta para continuar.",
  "acerto-3": "Três estrelas! Toque na seta para continuar.",
  "acerto-4": "Quatro estrelas! Toque na seta para continuar.",
  "acerto-5": "Cinco estrelas! Toque na seta para continuar.",
  "tentar-novamente": "Vamos contar de novo?",
  pista: "Toque na estrela que está brilhando.",
  "contar-juntos": "Vamos contar juntos. Toque na estrela que brilha.",
  "conferir-agora": "Agora, toque no botão de conferir.",
  conclusao: "Missão concluída! Você contou as estrelas. Quer jogar de novo ou voltar ao mapa?",
  "cristais-pedido-1": "Coloque um cristal no gerador.",
  "cristais-pedido-2": "Coloque dois cristais no gerador.",
  "cristais-pedido-3": "Coloque três cristais no gerador.",
  "cristais-pedido-4": "Coloque quatro cristais no gerador.",
  "cristais-pedido-5": "Coloque cinco cristais no gerador.",
  "cristais-escolher": "Quantos cristais estão no gerador? Toque no número.",
  "cristais-recontar": "Vamos contar os cristais de novo?",
  "cristais-faltam": "Coloque o cristal que está brilhando.",
  "cristais-sobram": "Devolva o cristal que brilha para a reserva.",
  "cristais-ajuda": "Toque no cristal brilhando ou no botão Ajudar.",
  "cristais-conferir": "Agora, toque em Conferir a carga.",
  "cristais-revisar-numero": "Conte os cristais no gerador e tente de novo.",
  "cristais-pista-numero": "Conte um por um. O número que brilha mostra quantos são.",
  "cristais-ativar": "Isso! Agora, aperte o botão para ligar a estação.",
  "cristais-ligado": "A estação acendeu! Toque na seta para continuar.",
  "cristais-conclusao": "Missão cumprida! Você ligou a estação com os cristais.",
});

export const effects = Object.freeze(["desmarcar", "cristais-encaixe", "cristais-retirar"]);

export function audioUrl(id) {
  if (!Object.hasOwn(messages, id) && !effects.includes(id)) {
    throw new RangeError(`Áudio desconhecido: ${id}`);
  }

  return new URL(`../../assets/audio/${id}.mp3`, import.meta.url).href;
}
