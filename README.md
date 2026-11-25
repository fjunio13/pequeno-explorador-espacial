# Pequeno Explorador Espacial

Jogo educativo de matemática e exploração espacial para navegador móvel em paisagem. Na aventura do sinal de luz, a criança pode visitar os planetas das Estrelas, dos Cristais e das Descobertas em qualquer ordem.

## Executar localmente

Na pasta do projeto, inicie um servidor HTTP com Python 3.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

No Windows, use `py -3` no lugar de `python3`. Abra [a página inicial](http://127.0.0.1:8000/).

## Jogar

Toque em **Começar** e escolha um planeta no mapa. O mesmo toque pede tela cheia nos navegadores compatíveis.

- **Estrelas** — toque para selecionar ou desmarcar estrelas. A primeira das seis rodadas pede uma estrela. As demais pedem de duas a cinco em ordem variável. Ao atingir a quantidade pedida, o jogo diz o total e prepara a próxima rodada. Toque de novo para corrigir a seleção enquanto o resultado permanece na tela.
- **Cristais** — arraste ou toque para mover os cristais entre a reserva e o gerador. A quantidade certa abre as opções de número. Escolha o numeral e ligue a estação. O jogo avança após a estação acender. As três cargas alternam entre **1, 3, 5** e **2, 4, 5** a cada entrada.
- **Descobertas** — explore a pedra, a flor e o arco do vale. No lugar que brilha, sai mais uma luzinha, que voa até o grupo. As luzinhas visíveis têm um brilho suave para facilitar a contagem. Toque no numeral para ver e ouvir a resposta do grupo. Os três grupos começam com **1, 3 e 4** luzinhas.

O botão **Ouvir** repete a fala da tela. Na primeira visita, é possível esperar a chegada narrada ou pular para a missão. O ícone de livro no mapa permite rever uma chegada. As três missões oferecem pistas progressivas e ajuda guiada.

Cada missão acrescenta uma pista ao mapa durante a sessão. **Próxima missão** oferece um planeta que ainda está pendente. **Jogar de novo** e **Voltar ao mapa** continuam disponíveis. Após a terceira pista, a nave responde ao sinal das luzinhas. O mapa permite escolher qualquer planeta e rever a conclusão geral pelo botão **Responder ao sinal**.

O botão com a nave abre a **Oficina de Energia**. Cada visita tem três desafios curtos. Monte a carga solicitada encaixando grupos e unidades, preencha os espaços contornados para completar o painel e compare duas cargas. Uma fileira cheia tem cinco luzes e duas fileiras formam um painel de dez. Por exemplo, 18 energias cabem em um painel cheio, uma fileira de cinco e três espaços do outro painel.

A oficina começa em **6 a 10**, passa por **11 a 15** e chega a **16 a 20** à medida que as visitas são concluídas. **Mais desafios** abre a faixa seguinte ou uma variação ao chegar à última. **Repetir desafios** reinicia a mesma visita. O botão **Voltar ao mapa** está disponível o tempo todo.

## Verificar

Use Node.js 24 e Python 3. Os dois primeiros comandos instalam a ferramenta de testes e o Chromium de teste.

```sh
npm ci
npx playwright install --only-shell chromium
npm run check
npm test
npm run test:ui
```

Em Linux, se o Chromium precisar de bibliotecas de sistema, use `npx playwright install --with-deps --only-shell chromium`. O Playwright inicia um servidor local na porta 4173 e abre o jogo em um subdiretório, como no GitHub Pages.

O GitHub Actions executa as verificações nos pull requests para `main` e nos pushes para essa branch.

Os testes de lógica cobrem contagem, associação de números, transferência, acréscimo de uma unidade, composição até vinte, complementos, comparações e pistas. No Chromium com emulação de celular, o Playwright verifica toque, arraste, narração, cancelamento de gestos, layout em paisagem, progressão da oficina e o desfecho nas seis ordens possíveis de missões. A observação em um Android físico complementa os testes automatizados.

## Publicar e homologar

O GitHub Pages serve o `index.html` da raiz da branch selecionada. Para homologar um PR, escolha a branch dele em **Settings → Pages → Build and deployment**, com origem **Deploy from a branch** e pasta **/ (root)**. Após o merge aprovado, selecione `main` nessa mesma configuração e confirme a implantação. [Guia de publicação e atualização no Android](docs/publicacao.md)

## Documentação

- [Especificação funcional v0.1](docs/especificacao-funcional.md)
- [Arquitetura técnica v0.1](docs/arquitetura.md)
- [Guia visual das missões](docs/guia-visual.md)
- [Roteiro narrativo aprovado](docs/roteiro-narrativo.md)
- [Registro dos recursos audiovisuais](docs/recursos-audiovisuais.md)
- [Capturas da quinta entrega](docs/capturas-quinta-entrega.webp)
- [Capturas da Oficina de Energia](docs/capturas-oficina-de-energia.webp)
- [Prontidão para a versão 1.0](docs/prontidao-versao-1.md)
- [Capturas da oitava entrega](docs/capturas-oitava-entrega/)
- [Plano de evolução](docs/plano-evolucao.md)
- [Instruções para agentes](AGENTS.md)
