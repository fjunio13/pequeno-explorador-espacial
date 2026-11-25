# Pequeno Explorador Espacial — arquitetura técnica v0.1

Seção 6 da [especificação v0.1 aprovada](especificacao-funcional.md).

## 6.1. Tecnologias

| Componente | Solução |
| --- | --- |
| Estrutura | HTML5 |
| Apresentação e animações | CSS |
| Regras e interações | JavaScript moderno |
| Renderização inicial | Elementos HTML e gráficos SVG/imagens |
| Controles | Pointer Events, para toque e mouse |
| Áudio | API de áudio do navegador |
| Hospedagem | GitHub Pages |
| Versionamento | GitHub |
| Desenvolvimento assistido | Codex e ChatGPT Work |
| Testes de lógica | Testes automatizados em JavaScript |
| Testes de interface | Playwright |
| Integração contínua | GitHub Actions |

Essa combinação permite construir o jogo sem depender inicialmente de frameworks, servidores, bancos de dados ou ferramentas de compilação complexas.

O uso de Canvas ou de um motor de jogos poderá ser reconsiderado se a complexidade visual ou de animação justificar a mudança.

## 6.2. Organização lógica

| Responsabilidade | Atribuição |
| --- | --- |
| Núcleo do jogo | Controlar o estado geral, a navegação, a seleção de planetas e o início ou encerramento de atividades |
| Atividades educativas | Definir a mecânica, os objetivos e a verificação de respostas em um módulo por planeta |
| Interface visual | Apresentar telas, botões, objetos interativos, animações e transições |
| Gerenciador de áudio | Reproduzir falas e efeitos sonoros mediante solicitações dos demais componentes |
| Recursos e configurações | Reunir imagens, áudio, parâmetros das atividades e referências aos recursos utilizados |

O núcleo não deverá conter as regras educativas específicas de cada planeta. Os módulos das atividades não deverão controlar diretamente a navegação geral.

## 6.3. Contrato entre atividades e núcleo

Todas as atividades deverão respeitar uma interface comum. Ao iniciar uma atividade, o núcleo fornecerá os seguintes elementos.

- Um espaço visual onde ela será apresentada.
- Sua configuração.
- Acesso controlado ao serviço de áudio.
- Uma forma de informar que a atividade foi concluída.
- Uma forma de solicitar retorno ao mapa.

A atividade deverá inicializar seus elementos, processar as interações e sinalizar a conclusão. Ao ser encerrada, deverá liberar seus controles, animações e demais recursos temporários.

Os módulos `mountStars`, `mountCrystals`, `mountDiscoveries` e `mountEnergy` recebem `{ container, configuration, audio, onComplete, onReturn }` e retornam uma função de encerramento. O núcleo chama essa função e interrompe o áudio ao trocar de tela. A atividade usa as funções recebidas para comunicar a conclusão e a saída.

Os botões nativos recebem toque, mouse e teclado pela ativação do evento `click`. A área de toque e os estados de seleção, foco e pista são definidos pela interface.

Nos Cristais, os Pointer Events acompanham a peça até qualquer ponto da área de destino. Soltar fora dela ou cancelar o gesto devolve a peça à origem. Um toque sem deslocamento transfere a peça na soltura. Os controles que mantêm a criança na atividade aceitam a soltura logo após um arraste. O retorno ao mapa e a ativação pelo teclado usam o clique nativo.

As atividades usam `round-advance.js` para avançar após o feedback e 650 ms de pausa visual. Se o áudio estiver indisponível, o resultado permanece visível por 1,4 s. Repetir a fala de resultado renova a espera. Mudar a seleção nas Estrelas ou corrigir a carga na Oficina cancela a passagem pendente. Ao trocar de tela, a função de encerramento cancela a transição e remove os eventos. Nos Cristais, ela também libera a captura do ponteiro. Nas Descobertas, cancela o voo da criatura.

Adicionar um novo planeta não deverá exigir modificar a lógica interna dos planetas existentes.

Evitar abstrações excessivamente genéricas. As três atividades poderão compartilhar infraestrutura sem necessariamente compartilhar suas mecânicas educativas.

## 6.4. Organização inicial do repositório

| Caminho | Responsabilidade |
| --- | --- |
| `index.html` | Ponto de entrada |
| `src/` | Código do jogo |
| `src/core/` | Estado e navegação |
| `src/activities/` | Módulos dos planetas e da oficina |
| `src/ui/` | Elementos e apresentação |
| `src/services/` | Áudio e serviços compartilhados |
| `assets/images/` | Imagens |
| `assets/audio/` | Falas e efeitos |
| `tests/` | Testes automatizados |
| `docs/` | Especificações e decisões |
| `AGENTS.md` | Instruções permanentes para agentes |
| `.github/workflows/` | Automações de testes e publicação |

`src/main.js` inicia o jogo. `src/core/game.js` registra os planetas, as falas de chegada e as pistas. O núcleo conta visitas e mantém um conjunto de conclusões por identificador. A primeira entrada abre a chegada narrada. Nas seguintes, a criança pode entrar direto ou rever a chegada pelo mapa. **Próxima missão** usa o mesmo caminho de entrada do mapa e sugere o primeiro planeta pendente na ordem Estrelas, Cristais e Descobertas. **Jogar de novo** inicia a missão que acabou de ser concluída. `src/ui/` contém as telas, os controles e os estilos.

O núcleo reutiliza `round-advance.js` nas chegadas e após a fala da terceira pista. Quando reúne as três, apresenta o desfecho ao fim da fala, com a opção de abri-lo pelo mapa. Ele sinaliza a primeira exibição durante a sessão, para que repetir uma missão preserve as pistas e a escolha da próxima ação.

`src/activities/stars/` implementa a contagem de estrelas. `starConfiguration` usa o número da visita para alternar o numeral repetido e embaralha as cinco rodadas após a abertura. Em `src/activities/crystals/`, `logic.js` controla quantidade, pistas e a liberação da estação. `drag.js` cuida dos gestos, e `index.js` liga as regras à tela e ao áudio. A quantidade certa apresenta os numerais. A criança associa o número e aciona a energia em passos distintos.

Em `src/activities/discoveries/`, `logic.js` mantém o esconderijo, a quantidade inicial, a chegada de uma unidade e a escolha do numeral. `index.js` conecta a exploração do cenário, os controles de contagem, o voo da criatura e a reação do grupo. Cada rodada só avança após a criança identificar a nova quantidade.

Em `src/activities/energy/`, `configuration.js` organiza as três faixas e as variações de cada visita. `logic.js` controla a composição da carga, os complementos, as comparações e a representação em fileiras. `feedback.js` escolhe a mensagem visual e a fala. `index.js` renderiza os painéis e recebe as interações, e `screens.js` apresenta a chegada e a nave energizada.

O núcleo abre a oficina pela nave no mapa e mantém a faixa e as visitas da oficina durante a sessão. Repetir reutiliza a configuração da última visita. O módulo comunica a conclusão da oficina por `onComplete`. O desfecho da aventura consulta o conjunto de pistas dos três planetas.

Os estilos da missão das Descobertas e da modalidade **Completar o painel** animam apenas a opacidade dos brilhos. O estado da atividade determina quais elementos recebem destaque. Trocar de tela remove esses elementos. A regra de movimento reduzido desativa as animações e conserva a sinalização estática.

`src/services/audio.js` controla um único elemento de áudio. Instruções prioritárias podem aguardar a fala em curso. Ações rápidas podem dispensar pequenos efeitos enquanto há voz ativa. A conclusão da fala usa o evento `ended`. Em caso de erro ou de reprodução sem progresso, a apresentação visual conduz a atividade. O catálogo em `src/services/audio-catalog.js` associa os identificadores aos arquivos locais e o botão **Ouvir** repete a instrução atual.

O [guia visual](guia-visual.md) registra a direção de arte. O [registro audiovisual](recursos-audiovisuais.md) reúne a origem das ilustrações, falas e efeitos.

Playwright é uma dependência de desenvolvimento. O navegador carrega diretamente os arquivos estáticos do jogo.

## 6.5. Estado e armazenamento

Inicialmente, o progresso será mantido apenas durante a execução do jogo.

Não haverá banco de dados, contas de usuário nem sincronização com servidores.

O armazenamento local de progresso poderá ser acrescentado posteriormente, se houver necessidade.

## 6.6. Orientação e adaptação às telas

O layout será projetado prioritariamente para celulares na orientação horizontal. Deverá adaptar-se às diferentes proporções de tela, respeitando áreas de segurança e evitando cortes de elementos importantes.

Quando aberto na vertical, poderá apresentar uma orientação visual solicitando que o usuário gire o aparelho. Não dependerá de bloqueio automático de orientação, pois navegadores móveis podem restringir esse recurso.

O toque em **Começar** abre o mapa e inicia a narração antes de solicitar tela cheia no mesmo gesto. Se o navegador recusar a solicitação, o mapa funciona na aba.

## 6.7. Publicação

O jogo será distribuído como site estático pelo GitHub Pages. Atualizações serão realizadas por meio do repositório. A publicação deverá ocorrer somente após a execução satisfatória das verificações automatizadas.

O jogo deverá ser funcional sem cadastro ou autenticação. A primeira versão exigirá acesso à internet para ser carregada. Recursos de funcionamento offline poderão ser adicionados posteriormente.

A URL do GitHub Pages deverá ser tratada como publicamente acessível. Não deverão ser incluídos dados pessoais da criança ou recursos privados no conteúdo publicado.

A entrada fica na raiz. As referências relativas permitem servir o jogo em um subdiretório como `/pequeno-explorador-espacial/`. O artefato do Pages agrupa módulos e recursos em `revisoes/<SHA>/` e inclui `.nojekyll`. O workflow manual confere o SHA aprovado da `main`, reutiliza as verificações e publica o artefato. A ativação da origem GitHub Actions exige autorização administrativa. [Publicação e atualização no navegador](publicacao.md)
