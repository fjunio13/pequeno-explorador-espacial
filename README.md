# Pequeno Explorador Espacial

Jogo educativo de matemática e exploração espacial para navegador móvel em paisagem. O mapa oferece o Planeta das Estrelas e o Planeta dos Cristais.

## Executar localmente

Na pasta do projeto, inicie um servidor HTTP com Python 3.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

No Windows, use `py -3` no lugar de `python3`. Abra [a página inicial](http://127.0.0.1:8000/).

## Jogar

Toque em **Começar** e escolha um planeta no mapa.

- **Estrelas** — marque ou desmarque estrelas por toque e use **Conferir**.
- **Cristais** — arraste ou toque para mover os cristais entre a reserva e o gerador. Confira a carga, escolha o numeral que representa a quantidade e ligue a estação. São três cargas por missão. As sequências **1, 3, 5** e **2, 4, 5** se alternam a cada entrada.

O botão **Ouvir** repete a instrução da tela. Os dois planetas oferecem pistas progressivas e ajuda guiada. Após concluir, escolha **Jogar de novo** ou **Voltar ao mapa**.

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

Os testes de lógica cobrem contagem, associação de números, transferência, pistas e conclusão. O Playwright simula toque e arraste no Chromium móvel. Também verifica o cancelamento de gestos, a troca entre planetas, a repetição, o áudio e o layout em paisagem no subdiretório do projeto. A observação em um Android físico complementa os testes automatizados.

## Documentação

- [Especificação funcional v0.1](docs/especificacao-funcional.md)
- [Arquitetura técnica v0.1](docs/arquitetura.md)
- [Guia visual das missões](docs/guia-visual.md)
- [Registro dos recursos audiovisuais](docs/recursos-audiovisuais.md)
- [Instruções para agentes](AGENTS.md)
