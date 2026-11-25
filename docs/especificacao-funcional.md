# Pequeno Explorador Espacial — especificação v0.1

- **Estado** — aprovada
- **Plataforma** — navegador de celular, com publicação pelo GitHub Pages
- **Público-alvo** — crianças a partir de aproximadamente 4 anos

## 1. Visão do produto

O Pequeno Explorador Espacial será um jogo educativo de exploração espacial, no qual a criança viajará entre planetas e participará de pequenas missões interativas.

O objetivo é estimular a curiosidade, o raciocínio e a compreensão inicial de números e quantidades por meio da brincadeira, sem reproduzir uma sequência convencional de exercícios escolares.

### Princípios fundamentais

- **Aprender explorando** — integrar as atividades educativas à narrativa espacial.
- **Autonomia infantil** — permitir que a criança jogue sem depender de leitura ou da assistência constante de um adulto.
- **Desafios alcançáveis** — oferecer dificuldade progressiva e ajuda quando necessário.
- **Ausência de punições** — não utilizar vidas, cronômetros, classificações ou mensagens negativas por erros.
- **Simplicidade** — priorizar uma experiência curta, intuitiva e visualmente agradável.
- **Fluidez** — reagir imediatamente aos gestos, tornar perceptíveis as consequências e avançar naturalmente após o feedback. Reservar os toques para escolhas e ações significativas, com espaço para ouvir, corrigir e pedir ajuda.

O jogo não terá publicidade, compras, cadastros ou funcionalidades sociais.

## 2. Experiência do usuário

### 2.1. Apresentação visual

- Orientação horizontal (paisagem).
- Visual 2D ilustrado, colorido, com personagens amigáveis.
- Astronauta como personagem principal.
- Nave espacial e planetas com identidades visuais distintas.
- Botões grandes e elementos facilmente manipuláveis.
- Animações suaves e feedback visual para as interações.

A referência estética será a imagem de aventura espacial infantil selecionada durante a concepção.

### 2.2. Navegação

**Fluxo principal** — Tela inicial → Mapa espacial → Planeta → Atividade → Conclusão → Mapa espacial.

A criança poderá selecionar os planetas disponíveis, sem necessidade de cumprir uma ordem rígida.

Após concluir uma atividade, haverá uma pequena celebração visual e sonora, seguida da possibilidade de retornar ao mapa.

A nave espacial funcionará como elemento de ligação narrativa entre os planetas.

### 2.3. Controles

- Toque em objetos e botões.
- Arrastar e soltar elementos.
- Repetir instruções por meio de um botão de áudio.
- Retornar ao mapa espacial.

Não haverá controles virtuais complexos nem necessidade de movimentos precisos.

## 3. Atividades da versão inicial

### Planeta 1 — Estrelas

**Objetivo** — desenvolver a correspondência entre contagem e quantidade.

A criança deverá localizar e selecionar a quantidade solicitada de estrelas. Por exemplo, a narração pede quatro estrelas. A criança toca nas estrelas, que são destacadas e contadas.

**Faixa inicial** — quantidades de 1 a 5.

O jogo deverá ajudar a relacionar cada objeto selecionado à sequência de contagem, e o último número à quantidade total.

A rodada avança após a fala de acerto e uma breve pausa. A criança pode corrigir a seleção durante esse intervalo. Se alterar a quantidade, o jogo cancela a passagem e mantém a rodada.

### Planeta 2 — Cristais

**Objetivo** — associar símbolos numéricos a quantidades concretas.

A criança deverá arrastar cristais para recipientes identificados com números ou escolher o recipiente correspondente à quantidade apresentada.

**Faixa inicial** — números de 1 a 5.

O sistema deverá permitir experimentar, corrigir escolhas e receber pistas.

A quantidade certa abre a escolha do numeral. Alterar a carga cancela a escolha anterior. A criança liga a estação com um toque e vê o efeito antes de o jogo seguir à próxima carga.

### Planeta 3 — Descobertas

**Objetivo** — introduzir intuitivamente a ideia de acrescentar uma unidade.

O cenário apresenta uma pequena quantidade de objetos. Um novo objeto aparece e a criança observa ou identifica a nova quantidade.

Por exemplo, quatro estrelas estão no céu. Surge uma quinta estrela e a narração convida a criança a contar novamente.

Não será obrigatório apresentar expressões matemáticas formais, como “4 + 1 = 5”.

### Progressão

A primeira versão terá dificuldade predominantemente fixa, com desafios curtos e pequenas variações.

Não será implementado inicialmente um sistema complexo de adaptação automática. A adequação da dificuldade deverá ser avaliada durante os testes com a criança.

## 4. Feedback e apoio à criança

As atividades deverão distinguir respostas corretas, tentativas incorretas e pedidos de ajuda.

### Comportamento recomendado

1. **Primeira tentativa incorreta** — feedback neutro e possibilidade de tentar novamente.
2. **Dificuldade persistente** — apresentação de uma pista visual ou sonora.
3. **Nova dificuldade** — demonstração orientada, permitindo que a criança participe da solução.

O jogo não deverá permanecer indefinidamente em uma atividade que a criança não consegue concluir.

As mensagens positivas deverão valorizar a descoberta, a exploração e a perseverança, evitando elogios excessivos e repetitivos.

## 5. Recursos audiovisuais

### 5.1. Imagens e animações

As ilustrações poderão ser produzidas com ferramentas de geração de imagens por IA, seguindo um guia visual comum.

O projeto deverá armazenar seus próprios recursos gráficos, evitando dependência de serviços externos durante a execução.

Animações simples, como deslocamento, pulsação, brilho e transições, poderão ser programadas diretamente.

### 5.2. Narração

Será utilizada voz sintética pré-gravada, em português brasileiro.

As mensagens serão organizadas por identificadores, independentemente das atividades que as utilizam.

#### Categorias previstas

- Instruções.
- Contagem e números.
- Pistas.
- Confirmações e descobertas.
- Navegação e conclusão de missões.

O sistema deverá permitir interromper uma fala anterior, repetir a instrução atual e controlar a reprodução para evitar sobreposição de mensagens.

### 5.3. Efeitos sonoros

Serão utilizados efeitos breves e discretos para seleção, movimentação de objetos, descobertas e transições.

Música de fundo será opcional na primeira versão.

Todos os recursos deverão ter origem e direitos de uso documentados.

## 6. Arquitetura técnica

A [arquitetura técnica v0.1](arquitetura.md) registra as tecnologias, os contratos e a estrutura do repositório.

## 7. Qualidade e testes

### 7.1. Testes de lógica

Verificar, entre outros comportamentos, os seguintes casos.

- Contagem correta de objetos.
- Identificação da conclusão de uma atividade.
- Tratamento de respostas incorretas.
- Progressão das pistas.
- Respeito aos limites numéricos definidos.

### 7.2. Testes de integração

Verificar o fluxo completo de entrada no jogo, seleção de planeta, execução da atividade, conclusão e retorno ao mapa.

Verificar também se a troca entre atividades não deixa controles ou animações da atividade anterior funcionando indevidamente.

### 7.3. Testes de interface

Automatizar interações por toque e arraste, utilizando emulação de dispositivos móveis no Playwright.

Os testes deverão verificar os elementos essenciais, a navegação e a ausência de falhas de execução.

### 7.4. Validação em aparelho real

Testar no Chrome para Android em orientação horizontal, observando os seguintes pontos.

- Legibilidade e tamanho dos controles.
- Fluidez das animações.
- Precisão dos gestos.
- Reprodução de áudio após interação.
- Comportamento diante de erros.
- Interesse e compreensão da criança.

A validação automatizada não substituirá a observação real da experiência infantil.

## 8. Metodologia de desenvolvimento com IA

O trabalho seguirá um processo incremental.

### Etapa 1 — Fundação

Criar o repositório, registrar a arquitetura, estabelecer instruções para os agentes e configurar verificações básicas.

### Etapa 2 — Primeiro planeta funcional

Implementar o fluxo completo com mapa, atividade de contagem, áudio, feedback e retorno.

Esse marco será utilizado para avaliar a arquitetura antes da expansão.

### Etapa 3 — Ampliação

Implementar os outros dois planetas, reutilizando a infraestrutura definida.

### Etapa 4 — Integração e refinamento

Executar testes completos, revisar interface e áudio e corrigir inconsistências.

### Etapa 5 — Publicação e observação

Publicar a versão inicial no GitHub Pages, testar no celular e identificar melhorias a partir do uso real.

### Regras para os agentes

Antes de implementar, cada agente deverá consultar as especificações existentes.

As alterações deverão respeitar os contratos entre componentes e incluir testes proporcionais aos comportamentos modificados.

Mudanças relevantes na arquitetura ou nas regras pedagógicas precisarão de aprovação prévia.

A documentação deverá acompanhar as alterações aprovadas, evitando divergências entre projeto e implementação.

Os agentes poderão propor melhorias, mas não deverão expandir silenciosamente o escopo.

## 9. Critérios de aceitação da versão 0.1

A primeira versão será considerada concluída quando atender aos seguintes critérios.

1. O jogo funcionar no navegador Android, em orientação horizontal.
2. A criança conseguir iniciar e navegar sem precisar ler instruções.
3. Os três planetas tiverem atividades funcionais.
4. Toques e gestos de arrastar funcionarem adequadamente.
5. As instruções e os feedbacks forem reproduzidos por áudio.
6. As tentativas incorretas forem tratadas sem bloqueios ou punições.
7. O fluxo completo de navegação funcionar.
8. Os testes automatizados essenciais estiverem passando.
9. O jogo estiver publicado em um endereço acessível pelo celular.
10. A execução não exigir cadastro, anúncios ou envio de dados pessoais.

A avaliação da qualidade pedagógica e do interesse da criança será realizada separadamente, por observação durante o uso.

## 10. Fora do escopo inicial

- Cadastro de usuários.
- Backend ou banco de dados.
- Inteligência artificial em tempo real.
- Conversação livre com personagens.
- Sistema sofisticado de adaptação de dificuldade.
- Loja, compras ou publicidade.
- Rankings, pontos competitivos ou vidas.
- Aplicativo Android nativo.
- Sincronização entre dispositivos.
- Grande quantidade de fases.
- Painel de acompanhamento pedagógico.

Esses recursos somente deverão ser considerados se houver uma necessidade concreta demonstrada após o protótipo.

**Diretriz final** — priorizar uma primeira experiência pequena, completa, testável e extensível. O sucesso inicial do projeto será medido pela funcionalidade, coerência arquitetural, facilidade de manutenção e adequação à criança.
