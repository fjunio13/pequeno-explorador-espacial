# Publicação pelo GitHub Pages

O GitHub Pages serve o `index.html`, os módulos, o CSS e a mídia da raiz da branch selecionada. O arquivo `.nojekyll` permite publicar os arquivos estáticos diretamente. Use sempre o [endereço habitual do jogo](https://fjunio13.github.io/pequeno-explorador-espacial/).

## Homologar um pull request

1. Abra o PR da branch de desenvolvimento, confirme que as verificações passaram e confira a autorização para publicar a branch.
2. Em **Settings → Pages → Build and deployment**, selecione **Deploy from a branch** em **Source**. Abra a lista **Branch**, escolha a branch do PR, mantenha **/ (root)** na lista de pastas e clique em **Save**. A troca requer acesso à configuração do repositório. [Configuração do Pages](https://github.com/fjunio13/pequeno-explorador-espacial/settings/pages)
3. Aguarde o sucesso de **pages build and deployment**. Confira a branch e o commit na execução, abra o jogo pelo endereço habitual e confirme que ele carrega. Envie esse endereço para a homologação. [Execuções no GitHub](https://github.com/fjunio13/pequeno-explorador-espacial/actions)

O Pages tem uma única branch de origem. Durante a homologação, o endereço público exibe a versão em teste. Novos commits na branch selecionada disparam a publicação automática do Pages, independentemente das verificações do PR. Rode os testes locais antes de atualizar a branch e confira o resultado de cada implantação.

**pages build and deployment** é gerenciado pelo GitHub. Se um push deixar de disparar o build, confira se ele foi feito por uma pessoa com acesso administrativo e e-mail verificado. Pushes de workflows feitos com `GITHUB_TOKEN` ficam fora desse disparo automático. [Regras de publicação por branch no GitHub](https://docs.github.com/pt/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site#publishing-from-a-branch)

## Voltar à main após o merge

1. Confirme os testes do PR e obtenha aprovação do responsável para o merge.
2. Incorpore o PR à `main` e confira o commit que entrou.
3. Volte a **Settings → Pages → Build and deployment**. Com **Deploy from a branch** selecionado, escolha `main` e **/ (root)** e clique em **Save**. A troca de origem é uma operação separada após o merge. [Configuração do Pages](https://github.com/fjunio13/pequeno-explorador-espacial/settings/pages)
4. Aguarde o sucesso da publicação da `main`. Confira o commit implantado e abra a versão aprovada no endereço habitual. Só então considere a entrega publicada.

Mantenha a branch de homologação até confirmar o retorno da publicação à `main`. Se o Work estiver sem acesso administrativo, quem administra o repositório deve executar os passos de seleção e salvamento indicados acima.

## Atualizar o jogo no Chrome para Android

A publicação por branch reutiliza os endereços do HTML, JavaScript, CSS e mídia. Durante uma troca, o navegador pode carregar arquivos de versões diferentes. Um parâmetro como `?v=1` muda somente o endereço da página inicial. Os módulos importados e outros recursos conservam suas próprias URLs e entradas de cache. [Como funciona o cache HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Caching)

1. Confirme o sucesso de **pages build and deployment** para a branch e o commit esperados.
2. Feche as abas anônimas já abertas e abra o endereço habitual em uma nova aba anônima. Use essa sessão para comparar com uma aba comum, que pode ainda reutilizar o cache anterior.
3. Para atualizar a aba comum, no Chrome toque em **⋮ → Excluir dados de navegação → Mais opções**. Selecione **Todo o período** e marque somente **Imagens e arquivos armazenados em cache**. Confirme e abra o jogo novamente pelo endereço habitual. [Ajuda do Chrome para Android](https://support.google.com/chrome/answer/2392709?co=GENIE.Platform%3DAndroid&hl=pt-BR)

O Pages respondeu com `Cache-Control: max-age=600` na consulta ao HTML e ao módulo do jogo nesta entrega. Se uma sessão nova ainda receber a versão anterior depois do deploy, aguarde a propagação e tente novamente. Limpar o cache do aparelho age sobre os arquivos locais do Chrome. O cache de distribuição do Pages tem validade própria.

Use o endereço habitual também ao substituir favoritos antigos que apontavam para `revisoes/<SHA>/`. O progresso do jogo pertence à sessão e recomeça ao abrir uma nova aba ou recarregar.
