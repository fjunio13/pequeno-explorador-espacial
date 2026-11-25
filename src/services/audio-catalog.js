export const messages = Object.freeze({
  inicio: "A nave captou um sinal de luz. Vamos investigar? Toque em Começar.",
  mapa: "Toque em um planeta para começar uma missão.",
  "estrelas-chegada": "O sinal vem de longe. Vamos contar estrelas para achar a direção?",
  "pedido-1": "Toque em uma estrela.",
  "pedido-2": "Toque em duas estrelas.",
  "pedido-3": "Toque em três estrelas.",
  "pedido-4": "Toque em quatro estrelas.",
  "pedido-5": "Toque em cinco estrelas.",
  "contagem-1": "Um.",
  "contagem-2": "Dois.",
  "contagem-3": "Três.",
  "contagem-4": "Quatro.",
  "contagem-5": "Cinco.",
  "acerto-1": "Uma estrela!",
  "acerto-2": "Duas estrelas!",
  "acerto-3": "Três estrelas!",
  "acerto-4": "Quatro estrelas!",
  "acerto-5": "Cinco estrelas!",
  "tentar-novamente": "Vamos contar de novo?",
  pista: "Toque na estrela que está brilhando.",
  "contar-juntos": "Vamos contar juntos. Toque na estrela que brilha.",
  conclusao: "Encontramos a direção do sinal! Veja a seta no mapa.",
  "cristais-chegada": "A estação deste planeta está apagada. Vamos ligar o gerador?",
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
  "cristais-revisar-numero": "Conte os cristais no gerador e tente de novo.",
  "cristais-pista-numero": "Conte um por um. O número que brilha mostra quantos são.",
  "cristais-ativar": "Isso! Agora, aperte o botão para ligar a estação.",
  "cristais-ligado": "A estação acendeu!",
  "cristais-conclusao": "A estação deu energia à nave. A antena pisca no ritmo do sinal.",
  "descobertas-chegada": "Tem luzinhas piscando no vale. Vamos chegar mais perto?",
  "descobertas-procurar-1": "Já temos uma luzinha. Toque no brilho para chamar mais uma.",
  "descobertas-procurar-3": "Já temos três luzinhas. Procure mais uma onde o vale pisca.",
  "descobertas-procurar-4": "Já temos quatro luzinhas. Toque onde aparece o brilho.",
  "descobertas-explorar": "Vamos procurar em outro lugar do vale?",
  "descobertas-pista": "Olhe onde tem um brilho dourado.",
  "descobertas-guia": "Toque no brilho dourado. Vamos chamar uma luzinha.",
  "descobertas-chegou": "Chegou mais uma! Conte o grupo e toque no número.",
  "descobertas-contar": "Toque em cada luzinha para contar.",
  "descobertas-numero": "Conte as luzinhas. O número que brilha mostra quantas são.",
  "descobertas-sinal": "As luzinhas piscaram juntas!",
  "descobertas-conclusao": "Descobrimos quem mandou o sinal. Foram as luzinhas do vale!",
  "aventura-conclusao": "A nave piscou. Olhe, as luzinhas responderam!",
});

export const effects = Object.freeze(["desmarcar", "cristais-encaixe", "cristais-retirar"]);

export function audioUrl(id) {
  if (!Object.hasOwn(messages, id) && !effects.includes(id)) {
    throw new RangeError(`Áudio desconhecido: ${id}`);
  }

  return new URL(`../../assets/audio/${id}.mp3`, import.meta.url).href;
}
