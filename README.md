# Pequeno Explorador Espacial

Jogo educativo de matemática e exploração espacial para navegador móvel em paisagem. Na aventura do sinal de luz, a criança pode visitar os planetas das Estrelas, dos Cristais e das Descobertas em qualquer ordem.

## Executar localmente

Na pasta do projeto, inicie um servidor HTTP com Python 3.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

No Windows, use `py -3` no lugar de `python3`. Abra [a página inicial](http://127.0.0.1:8000/).

## Jogar

Toque em **Começar** e escolha um planeta no mapa.

- **Estrelas** — toque para selecionar ou desmarcar estrelas. Ao atingir a quantidade pedida, o jogo diz o total e prepara a próxima rodada. Toque de novo para corrigir a seleção enquanto o resultado permanece na tela.
- **Cristais** — arraste ou toque para mover os cristais entre a reserva e o gerador. A quantidade certa abre as opções de número. Escolha o numeral e ligue a estação. O jogo avança após a estação acender. As três cargas alternam entre **1, 3, 5** e **2, 4, 5** a cada entrada.
- **Descobertas** — explore a pedra, a flor e o arco do vale. No lugar que brilha, sai mais uma luzinha, que voa até o grupo. Conte as que ficaram juntas e toque no numeral para ver e ouvir a resposta delas. Os três grupos começam com **1, 3 e 4** luzinhas.

O botão **Ouvir** repete a fala da tela. Na primeira visita, é possível esperar a chegada narrada ou pular para a missão. O ícone de livro no mapa permite rever uma chegada. As três missões oferecem pistas progressivas e ajuda guiada.

Cada missão acrescenta uma pista ao mapa durante a sessão. Após a terceira, a nave responde ao sinal das luzinhas. A criança pode jogar qualquer missão de novo, voltar ao mapa ou rever a conclusão geral pelo botão **Responder ao sinal**.

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

Os testes de lógica cobrem contagem, associação de números, transferência, acréscimo de uma unidade, pistas e conclusão. No Chromium com emulação de celular, o Playwright verifica toque, arraste, narração, cancelamento de gestos, layout em paisagem e o desfecho nas seis ordens possíveis de missões. A observação em um Android físico complementa os testes automatizados.

## Documentação

- [Especificação funcional v0.1](docs/especificacao-funcional.md)
- [Arquitetura técnica v0.1](docs/arquitetura.md)
- [Guia visual das missões](docs/guia-visual.md)
- [Roteiro narrativo aprovado](docs/roteiro-narrativo.md)
- [Registro dos recursos audiovisuais](docs/recursos-audiovisuais.md)
- [Capturas da quinta entrega](docs/capturas-quinta-entrega.webp)
- [Instruções para agentes](AGENTS.md)
