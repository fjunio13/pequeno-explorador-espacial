# Publicação pelo GitHub Pages

## Diagnóstico

O histórico do Pages registra publicações da `main` e de branches de teste. A última publicação encontrada na revisão de 25/11/2026 veio da `feat/oficina-de-energia`, no commit `bd7fc12`. A consulta à página publicada e às URLs de JavaScript, CSS e áudio retornou `Cache-Control: max-age=600`. Como o mesmo endereço era reutilizado para cada arquivo, o navegador podia atualizar a entrada antes de um módulo importado ou de um recurso em cache. [Publicação pela main](https://github.com/fjunio13/pequeno-explorador-espacial/actions/runs/45654554762) · [Publicação da oficina](https://github.com/fjunio13/pequeno-explorador-espacial/actions/runs/45670788381)

## Artefato por revisão

`scripts/preparar-pages.mjs` copia `src/` e `assets/` para `revisoes/<SHA completo>/`. O HTML da raiz aponta para essa pasta. Os imports relativos e as URLs baseadas em `import.meta.url` mantêm módulos, estilos e mídia dentro da mesma revisão, inclusive quando o jogo é hospedado em um subdiretório. A própria pasta da revisão também tem uma entrada jogável.

A abertura mostra os sete primeiros caracteres do SHA. O atributo `title` desse identificador e o arquivo `versao.txt` permitem consultar o SHA completo. Use a revisão que aparece na abertura para confirmar qual jogo o navegador carregou.

O pacote mantém uma revisão por publicação. A entrada da raiz pode ficar em cache até expirar, e uma aba que já estava aberta pode pedir arquivos da revisão retirada. Se isso ocorrer ao atualizar, abra o endereço da revisão que saiu no resumo do workflow. O progresso pertence à sessão do jogo e recomeça ao recarregar.

## Operação após a aprovação

1. Com autorização administrativa, selecione **GitHub Actions** em **Settings → Pages → Source**. Essa migração é feita uma vez. [Configuração da origem no GitHub](https://docs.github.com/pt/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
2. Depois de revisar o commit, abra **Actions → Publicar revisão no GitHub Pages → Run workflow**, selecione a `main` e informe o SHA completo aprovado. O workflow exige que ele corresponda à ponta da `main` selecionada, executa os testes e prepara o artefato antes da implantação. [Workflow de publicação](../.github/workflows/publicar-pages.yml)
3. Abra o endereço da revisão no resumo da execução e confira o identificador na abertura. Use esse endereço na validação do lançamento.

## Ensaio local

Na raiz do projeto, gere o pacote em um diretório novo. Com o servidor local do README em execução, abra `http://127.0.0.1:8000/_site/`.

```sh
node scripts/preparar-pages.mjs "$(git rev-parse HEAD)" _site
```

O teste de interface troca duas revisões no servidor local e verifica as URLs do módulo inicial, dos imports, do CSS, das imagens e do áudio. A ativação do workflow e a propagação do Pages fazem parte da validação após a autorização de publicação.
