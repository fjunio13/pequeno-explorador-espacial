# Prontidão para a versão 1.0

A sétima entrega consolida a `main` após o PR #8. A homologação depende da validação em Android físico e da aprovação da publicação.

## Funcionalidades concluídas

- Abertura em paisagem, pedido de tela cheia no toque em **Começar** e continuidade na aba em caso de recusa.
- Mapa com os três planetas em qualquer ordem e apresentações que podem ser puladas e revistas. As três pistas liberam o desfecho, que volta a ficar disponível no mapa após a exibição. Repetir uma missão conserva uma marca por planeta.
- Oficina independente com montagem, complemento e comparação nas faixas 6–10, 11–15 e 16–20. Cada visita tem três desafios e pode ser repetida. Os painéis mostram as unidades em fileiras de cinco, com molduras de dez, e as três faixas são percorridas em sessões curtas.
- Narração local em português brasileiro, repetição pelo botão **Ouvir**, pistas progressivas, correção de escolhas e retorno ao mapa. O áudio usa um único elemento e é liberado na troca de tela. Os testes exercitam a saída durante fala, arraste e animação e o avanço visual quando a mídia falha.

## Problemas identificados e tratados

| Ponto | Evidência e correção |
| --- | --- |
| Intermitência nas Estrelas | Na execução da main após o PR #7, a linha 107 esperava a rodada 1 e recebeu a 2. O teste consultava `ended` do elemento de áudio reutilizado, sem conferir o clipe, e dependia de vários comandos na pausa de 650 ms. Em uma reprodução local, 900 ms de atraso no driver fizeram a consulta aceitar o fim de `pedido-2.mp3`. O teste agora agenda **Ouvir** e **Voltar ao mapa** no navegador após o evento do clipe esperado e registra a rodada em que a ação ocorreu. Há toques reais nos demais cenários de interface. [Execução com a falha](https://github.com/fjunio13/pequeno-explorador-espacial/actions/runs/45654096521) |
| Mistura de arquivos em cache | O histórico registra troca da branch publicada, e a entrada, o módulo importado, o CSS e o áudio responderam com cache de 600 s em URLs reutilizadas. O pacote novo usa o SHA no caminho de todos os recursos e o mostra na abertura. O workflow manual confere a ponta aprovada da main e roda os testes antes da publicação. [Diagnóstico, operação e limites](publicacao.md) |
| Comparação na oficina | Nas primeiras visitas das três faixas, a resposta correta estava sempre à direita. A faixa intermediária agora começa com a resposta à esquerda. O mesmo ícone de toque nos dois painéis indica a ação, com o total representado pelas luzes. A montagem admite composições equivalentes, e a atividade de completar oferece grupos que correspondem aos espaços vazios. |

O tempo para observar a resposta, a compreensão dos ícones e o interesse em repetir os desafios ficam para observação em aparelho físico antes de qualquer novo refinamento.

As capturas mostram a abertura com um SHA de ensaio e a comparação na faixa intermediária. [Capturas da consolidação](capturas-consolidacao.webp)

## Verificações executadas

- `npm run check` em 36 arquivos JavaScript e `npm test` com 28 testes de lógica.
- Suíte completa de 30 testes Playwright. A cobertura inclui as seis ordens das missões, a integridade das pistas, o desfecho, a oficina, o cancelamento, a mídia indisponível, os caminhos relativos e a troca entre duas revisões do pacote.
- Cenário das Estrelas repetido 20 vezes em quatro workers após a correção. Antes, oito repetições do teste original passaram espontaneamente e o atraso controlado reproduziu o erro da main.
- Emulação de paisagem em 568 × 320, 667 × 375 e 780 × 360. A condição do workflow foi exercitada localmente com a main e SHA correspondentes, com SHA divergente e com branch de teste.

## Critérios para a versão 1.0

| Verificação pendente | Critério de aprovação |
| --- | --- |
| Android físico | No Chrome em paisagem, abrir e sair da tela cheia, ouvir e repetir a primeira instrução e conseguir usar todos os controles sem corte ou rolagem para alcançar uma ação. |
| Uso pela criança | Após ouvir a narração, iniciar e sair de uma missão e escolher um planeta sem precisar ler. Montar uma carga acima de dez usando grupos, preencher um painel pelos espaços disponíveis e comparar duas cargas. Usar ajuda ou corrigir ao menos uma escolha durante a sessão. |
| Aventura e estabilidade | Chegar ao desfecho após três pistas, revê-lo pelo mapa e retornar de uma atividade durante uma interação ou fala sem que a tela anterior reapareça. Aprovar a suíte automatizada no SHA que será publicado. |
| Publicação aprovada | Autorizar a origem GitHub Actions, testar o workflow no Pages real e confirmar que o endereço da revisão e o identificador na abertura correspondem ao SHA aprovado. Testar a atualização em uma aba comum com cache anterior. |

A entrada da raiz depende da propagação e do cache do Pages. O endereço fixo da revisão permite validar o pacote publicado nesse intervalo. O progresso do jogo é guardado durante a sessão. [Limitações de publicação](publicacao.md)
