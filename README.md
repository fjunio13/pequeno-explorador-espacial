# Pequeno Explorador Espacial

Jogo educativo de matemática e exploração espacial para navegador móvel em paisagem. A primeira missão leva ao Planeta das Estrelas para contar de uma a cinco estrelas.

## Executar localmente

Na pasta do projeto, inicie um servidor HTTP com Python 3.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

No Windows, use `py -3` no lugar de `python3`. Abra [a página inicial](http://127.0.0.1:8000/).

## Jogar

Toque em **Começar** e escolha o **Planeta das Estrelas** no mapa. Em cada rodada, toque nas estrelas para marcar ou desmarcar e use **Conferir**. O jogo mantém as escolhas após uma tentativa, indica a próxima estrela e oferece ajuda guiada conforme a criança precisar.

O botão **Ouvir** repete a instrução da tela. A narração começa após uma interação. Ao concluir as cinco rodadas, escolha **Jogar de novo** ou **Voltar ao mapa**.

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

Os testes de lógica cobrem contagem, limites, pistas e conclusão. O Playwright usa toque em um Pixel 7 emulado para testar navegação, áudio, repetição e retorno ao mapa no subdiretório do projeto. A observação em um Android físico complementa os testes automatizados.

## Documentação

- [Especificação funcional v0.1](docs/especificacao-funcional.md)
- [Arquitetura técnica v0.1](docs/arquitetura.md)
- [Guia visual da primeira missão](docs/guia-visual.md)
- [Registro dos recursos audiovisuais](docs/recursos-audiovisuais.md)
- [Instruções para agentes](AGENTS.md)
