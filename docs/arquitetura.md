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

Na primeira missão, `mountStars({ container, configuration, audio, onComplete, onReturn })` retorna a função que desativa os eventos da atividade. O núcleo chama essa função e interrompe o áudio ao trocar de tela. A atividade usa as funções recebidas para comunicar a conclusão e a saída.

Os botões nativos recebem toque, mouse e teclado pela ativação do evento `click`. A área de toque e os estados de seleção, foco e pista são definidos pela interface.

Adicionar um novo planeta não deverá exigir modificar a lógica interna dos planetas existentes.

Evitar abstrações excessivamente genéricas. As três atividades poderão compartilhar infraestrutura sem necessariamente compartilhar suas mecânicas educativas.

## 6.4. Organização inicial do repositório

| Caminho | Responsabilidade |
| --- | --- |
| `index.html` | Ponto de entrada |
| `src/` | Código do jogo |
| `src/core/` | Estado e navegação |
| `src/activities/` | Módulos dos planetas |
| `src/ui/` | Elementos e apresentação |
| `src/services/` | Áudio e serviços compartilhados |
| `assets/images/` | Imagens |
| `assets/audio/` | Falas e efeitos |
| `tests/` | Testes automatizados |
| `docs/` | Especificações e decisões |
| `AGENTS.md` | Instruções permanentes para agentes |
| `.github/workflows/` | Automações de testes e publicação |

`src/main.js` inicia o jogo. `src/core/game.js` controla abertura, mapa, atividade e conclusão. `src/ui/` contém as telas, os controles e os estilos. `src/activities/stars/` implementa a atividade e mantém a lógica de contagem separada do DOM.

`src/services/audio.js` controla um único elemento de áudio. Cada nova mensagem interrompe a anterior. O catálogo em `src/services/audio-catalog.js` associa os identificadores aos arquivos locais e o botão **Ouvir** repete a instrução atual.

O [guia visual](guia-visual.md) registra a direção de arte. O [registro audiovisual](recursos-audiovisuais.md) reúne a origem das ilustrações, falas e efeitos.

Playwright é uma dependência de desenvolvimento. O navegador carrega diretamente os arquivos estáticos do jogo.

## 6.5. Estado e armazenamento

Inicialmente, o progresso será mantido apenas durante a execução do jogo.

Não haverá banco de dados, contas de usuário nem sincronização com servidores.

O armazenamento local de progresso poderá ser acrescentado posteriormente, se houver necessidade.

## 6.6. Orientação e adaptação às telas

O layout será projetado prioritariamente para celulares na orientação horizontal. Deverá adaptar-se às diferentes proporções de tela, respeitando áreas de segurança e evitando cortes de elementos importantes.

Quando aberto na vertical, poderá apresentar uma orientação visual solicitando que o usuário gire o aparelho. Não dependerá de bloqueio automático de orientação, pois navegadores móveis podem restringir esse recurso.

## 6.7. Publicação

O jogo será distribuído como site estático pelo GitHub Pages. Atualizações serão realizadas por meio do repositório. A publicação deverá ocorrer somente após a execução satisfatória das verificações automatizadas.

O jogo deverá ser funcional sem cadastro ou autenticação. A primeira versão exigirá acesso à internet para ser carregada. Recursos de funcionamento offline poderão ser adicionados posteriormente.

A URL do GitHub Pages deverá ser tratada como publicamente acessível. Não deverão ser incluídos dados pessoais da criança ou recursos privados no conteúdo publicado.

A entrada fica na raiz. Referências como `./src/ui/styles.css` funcionam também sob `/pequeno-explorador-espacial/`. O arquivo `.nojekyll` prepara a publicação direta dos arquivos estáticos. A configuração da hospedagem fica para a etapa de publicação. [Documentação do GitHub Pages](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
