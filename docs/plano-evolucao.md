# Plano de evolução do Pequeno Explorador Espacial

## Estado das entregas

| Estado | Escopo |
| --- | --- |
| Implementado e homologado na revisão do PR #9 | Três planetas, Oficina de Energia, três pistas reunidas em qualquer ordem e desfecho atual |
| Integrado na oitava entrega, PR #10 | Seis rodadas variáveis nas Estrelas com abertura fixa, atalho **Próxima missão**, brilho das luzinhas e destaque dos espaços faltantes na Oficina |
| Integrado na nona entrega, PR #11 | Publicação direta pela raiz da branch no GitHub Pages, com retorno à `main` após o merge |
| Homologado na décima entrega, PR #12 | Ajuda desde a primeira tentativa, pistas progressivas nos três planetas e nas três modalidades da Oficina de Energia |
| Incorporado e homologado na décima primeira entrega, PR #13 | Cinco situações por visita nos Cristais, com carga vazia, complemento, excesso, comparação e variação final |
| Implementado na décima segunda entrega, para homologação | Dois encontros de busca e três comparações no Planeta das Descobertas, com variação de formações entre visitas |
| Aprovado como direção de planejamento | Planejar um desfecho interativo e homologar o ciclo em Android físico |
| Depende de aprovação específica | Implementação das etapas 13 e 14, aprovação do roteiro do novo desfecho e decisões de versão e publicação |

As etapas abaixo são a referência para futuras entregas. A especificação funcional, a arquitetura e o roteiro vigentes continuam orientando o jogo. O [guia de publicação](publicacao.md) registra o fluxo aprovado para colocar uma revisão no ar.

## Etapa 10 — Autonomia e assistência progressiva

As Estrelas orientam a seleção e a retirada. Os Cristais oferecem ajuda nos encaixes, na escolha do numeral e no botão de energização. As Descobertas orientam a busca e destacam as luzinhas uma a uma na recontagem. Na Oficina, a assistência sinaliza falta ou excesso na montagem, espaços livres no painel e diferenças entre posições correspondentes na comparação. A criança realiza cada ação sugerida e pode repetir a fala pelo botão **Ouvir**. [Capturas da assistência](capturas-decima-entrega/)

A orientação espontânea por inatividade fica adiada. Sem observação em aparelho real, uma pausa pode significar que a criança está olhando o cenário ou pensando. A ajuda sob demanda evita interromper esse tempo. Na homologação, observar se a criança encontra o ícone de ajuda sozinha, reconhece o próximo gesto a partir da pista e precisa de intervenção de um adulto após uma pausa longa.

A persistência de desempenho entre sessões depende de aprovação adicional.

## Etapa 11 — Ampliação do Planeta dos Cristais

Quatro roteiros se alternam entre visitas, com cinco desafios em cada um. Completar e retirar reaproveitam o gesto e a ajuda da montagem. A comparação alterna **mais** e **menos**, com a maior carga dos dois lados ao longo do ciclo. Os dois geradores usam a mesma disposição de encaixes para permitir a comparação por pares. [Capturas dos desafios](capturas-decima-primeira-entrega/)

A duração de três a cinco minutos é uma hipótese para observação em Android físico. Vale observar se a criança distingue completar e retirar pela fala e pelos encaixes, se compara os grupos sem escolher sempre o mesmo lado e se mantém o interesse até a quinta situação.

## Etapa 12 — Ampliação do Planeta das Descobertas

A missão tem dois encontros com esconderijos diferentes e três comparações de **mais**, **menos** e **igual**. Quatro roteiros variam esconderijos, quantidades, formações, lados e ordem das relações. A mesma quantidade aparece em fileiras ou agrupamentos. O símbolo **=** aparece em todas as comparações. A assistência por pares permite observar o que sobra e mantém a decisão com a criança. [Capturas dos desafios](capturas-decima-segunda-entrega/)

Na homologação em Android físico, observar se a criança encontra as luzinhas, consegue contar em ambas as formações e reconhece o símbolo **=** com a narração. Três a cinco minutos continua sendo uma hipótese de duração.

## Etapa 13 — Novo desfecho narrativo

**O Farol das Luzinhas** é uma proposta conceitual que precisa de aprovação de roteiro antes de desenvolvimento ou produção audiovisual. As criaturas enviam o sinal porque seu farol parou. As Estrelas indicam a direção, os Cristais fornecem energia e as Descobertas identificam quem chamou.

1. Reunir as três pistas.
2. Descobrir que o farol deixou de funcionar.
3. Pedir à criança uma ação simples para ajudar.
4. Acender o farol de novo.
5. Celebrar com uma recompensa visual.

Prever a opção de rever a cena pelo mapa e indicar sua conclusão na sessão. Usar o [roteiro vigente](roteiro-narrativo.md) para conferir a continuidade durante o planejamento.

## Etapa 14 — Homologação do ciclo de melhorias

Testar a aventura completa em Android físico. Observar duração, fluidez e compreensão, conferir navegação e áudio e verificar a revisão publicada. Atualizar a documentação com resultados e limitações. Avaliar a próxima versão estável com base nesses testes. Uma versão intermediária pode ser homologada antes de todas as ampliações.

## Melhorias adiadas e fora do escopo

| Melhoria | Prioridade |
| --- | --- |
| Novos planetas e expansão indefinida das missões | Adiadas |
| Adaptação sofisticada e persistência de desempenho entre sessões | Adiadas e sujeitas a aprovação específica |
| Contas de usuário, banco de dados, rankings e pontuação competitiva | Fora do escopo atual |
| Exercícios formais de aritmética | Fora do escopo atual |
| Aplicativo Android nativo | Fora do escopo atual |
