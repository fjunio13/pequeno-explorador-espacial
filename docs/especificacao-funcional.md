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

**Fluxo principal** — Tela inicial → Mapa espacial → Planeta → Atividade → Conclusão → Próxima missão, repetição ou mapa.

A criança pode selecionar os planetas em qualquer ordem. A primeira visita inclui uma chegada narrada e pulável. O mapa oferece a opção de rever uma chegada já visitada.

Após concluir uma atividade, a criança vê e ouve a descoberta daquela missão. **Próxima missão** mostra a imagem do primeiro planeta pendente, seguindo a ordem de referência Estrelas, Cristais e Descobertas. A criança pode jogar de novo ou voltar ao mapa para escolher outro destino. O mapa registra uma pista visual por planeta durante a sessão.

A nave liga as missões de [A aventura do sinal de luz](roteiro-narrativo.md). Quando as três pistas são reunidas, a nave pisca para as luzinhas do vale e elas respondem. Todas as missões continuam disponíveis.

No mapa, a nave dá acesso à Oficina de Energia a qualquer momento. A conclusão de uma visita acende os sistemas da nave. As três pistas da história são encontradas nos planetas.

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

**Faixa inicial** — quantidades de 1 a 5. Em cada visita, a primeira rodada pede uma estrela. Nas cinco rodadas seguintes, a ordem é embaralhada e um dos números de 2 a 5 aparece duas vezes, em rodadas separadas. O número repetido muda a cada visita.

O jogo deverá ajudar a relacionar cada objeto selecionado à sequência de contagem, e o último número à quantidade total.

A ajuda distingue estrelas que ainda precisam acender e estrelas a mais. A orientação guiada marca uma estrela por vez para a criança tocar.

A rodada avança após a fala de acerto e uma breve pausa. A criança pode corrigir a seleção durante esse intervalo. Se alterar a quantidade, o jogo cancela a passagem e mantém a rodada.

### Planeta 2 — Cristais

**Objetivo** — associar os numerais de 1 a 5 a quantidades concretas e comparar pequenos grupos.

A visita tem cinco desafios. A criança monta uma carga com o gerador vazio, completa uma carga parcial, retira cristais em excesso, compara dois geradores e resolve uma variação final. As visitas variam a quantidade solicitada e a carga inicial. As interações usam os cristais e os encaixes do gerador.

Na montagem e nas correções, a criança move qualquer peça entre o gerador e a reserva por toque ou arraste. A ajuda distingue encaixes vazios e peças em excesso. A quantidade certa abre a escolha do numeral. Alterar a carga cancela a escolha anterior. A criança usa o botão com o raio para energizar a estação.

Na comparação, a criança toca diretamente no gerador com mais ou menos cristais, conforme a fala. Os dois têm a mesma arte, cinco encaixes alinhados e cristais do mesmo tamanho. A ajuda começa pelos dois grupos, mostra os pares e depois destaca as diferenças nos mesmos encaixes dos dois lados. O acerto acende o gerador escolhido e prepara a próxima rodada.

### Planeta 3 — Descobertas

**Objetivo** — introduzir intuitivamente a ideia de acrescentar uma unidade.

O vale apresenta um grupo de criaturas-luz e três lugares para explorar. Ao tocar no brilho entre a pedra, a flor e o arco, a criança chama uma criatura escondida. Ela voa até as que já estavam juntas.

A criança pode tocar nas criaturas para contar e escolher o numeral que representa o novo grupo. O grupo responde com luz e som, e a próxima exploração começa após o feedback. As três rodadas mostram a passagem de 1 para 2, de 3 para 4 e de 4 para 5, com esconderijos diferentes a cada visita.

As pistas indicam o lugar que brilha, apoiam a recontagem e destacam o numeral quando necessário. A criança continua responsável por explorar o lugar e escolher a quantidade.

As luzinhas visíveis têm um brilho suave durante a busca e a contagem. Na ajuda para recontar, o contorno acompanha a próxima luzinha e o toque mostra sua posição na contagem. Com movimento reduzido, o destaque permanece estático.

### Oficina de Energia

**Objetivo** — relacionar numerais de 6 a 20 a grupos visuais, construir quantidades e perceber diferenças entre elas.

Cada visita tem três desafios. Em **Montar a carga**, a criança encaixa e retira módulos inteiros de cinco ou dez e unidades individuais. O painel da nave mostra a quantidade solicitada e o painel ao lado muda com os toques. Uma mesma quantidade aceita combinações diferentes.

Em **Completar o painel**, algumas posições já estão acesas. Um contorno luminoso identifica as posições que faltam desde o começo e se intensifica com a ajuda. A criança escolhe um grupo que preencha os espaços livres ou acrescenta unidades. O contorno acompanha a carga e desaparece ao completar o painel. Com movimento reduzido, ele permanece estático. Nas primeiras faixas o painel comporta dez luzes. Na última faixa, um painel cheio acompanha o segundo até ambos somarem vinte.

Em **Comparar cargas**, dois painéis do mesmo tamanho têm um ícone de toque e exibem quantidades distintas. A instrução pede a carga com mais ou menos energia. A resposta correta pode aparecer de qualquer lado. A ajuda destaca as fileiras e, no nível avançado, os espaços correspondentes em que as cargas diferem. Os totais aparecem após o acerto.

As faixas **6 a 10**, **11 a 15** e **16 a 20** avançam com a conclusão de visitas, independentemente das tentativas. A montagem e a comparação variam dentro da faixa. A criança pode repetir a mesma sequência ou voltar ao mapa entre desafios. Os grupos visuais e as pistas orientam as escolhas, e a próxima rodada começa após a fala e uma breve pausa. Uma correção durante o resultado cancela a passagem.

### Progressão

A primeira versão terá dificuldade predominantemente fixa, com desafios curtos e pequenas variações.

Não será implementado inicialmente um sistema complexo de adaptação automática. A adequação da dificuldade deverá ser avaliada durante os testes com a criança.

## 4. Feedback e apoio à criança

O botão **Ajuda** fica disponível desde o início de cada fase interativa. Pedidos repetidos ou escolhas que precisam de ajuste avançam a orientação até o terceiro nível.

1. **Reorientação** — retomar o objetivo e chamar a atenção para a área de ação.
2. **Pista específica** — distinguir falta e excesso, apoiar a contagem ou indicar grupos a observar.
3. **Orientação guiada** — destacar uma ação possível ou a região que permite tomar a decisão.

A criança realiza o toque, arraste ou escolha para continuar. A fala pode ser repetida em **Ouvir**. Quando o áudio falha, o ícone de som fica riscado e os destaques visuais continuam disponíveis. O nível de ajuda pertence à fase ou rodada em curso.

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
