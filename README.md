# Pequeno Explorador Espacial

Jogo educativo de matemática e exploração espacial para navegador móvel em paisagem. A fundação contém a página inicial em HTML, CSS e JavaScript e as verificações da interface.

## Executar localmente

Na pasta do projeto, inicie um servidor HTTP com Python 3.

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

No Windows, use `py -3` no lugar de `python3`. Abra [a página inicial](http://127.0.0.1:8000/).

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

## Documentação

- [Especificação funcional v0.1](docs/especificacao-funcional.md)
- [Arquitetura técnica v0.1](docs/arquitetura.md)
- [Instruções para agentes](AGENTS.md)
