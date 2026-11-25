# Registro dos recursos audiovisuais

## Imagens e gráficos

| Recurso | Origem e uso |
| --- | --- |
| `assets/images/astronauta-e-nave.webp` | Ilustração gerada no ChatGPT para a abertura do jogo, exportada em WebP |
| `assets/images/planeta-das-estrelas.webp` | Ilustração gerada no ChatGPT para o mapa e a conclusão, exportada em WebP com transparência |
| Ícones em `src/ui/controls.js` e animações em `src/ui/styles.css` | Traçados e animações produzidos para o jogo |

As duas ilustrações são gerações originais para este projeto a partir do [guia visual](guia-visual.md). As imagens usam personagens e objetos fictícios.

## Narração e efeitos

As 22 falas em `assets/audio/` foram sintetizadas em português brasileiro com Piper TTS 1.8.0 e o modelo `pt_BR-faber-medium` na revisão `5ec43b186ef915a195d3ddbcfd9916e76c503c3f`. O [catálogo de áudio](../src/services/audio-catalog.js) registra cada identificador e sua fala. Os arquivos foram normalizados e exportados em MP3 mono a 22.050 Hz.

O conjunto de treinamento da voz Faber é CC0, conforme a ficha do modelo. A voz-base dessa revisão é a do leitor 92, Cori Samuel, do conjunto Hi-Fi TTS sob CC BY 4.0. Créditos ao OHF-Voice, a Cori Samuel e aos autores do Hi-Fi TTS. O jogo distribui as falas sintetizadas e reproduz os MP3 locais. [Ficha da voz Faber](https://huggingface.co/rhasspy/piper-voices/blob/5ec43b186ef915a195d3ddbcfd9916e76c503c3f/pt/pt_BR/faber/medium/MODEL_CARD) · [Hi-Fi TTS](https://www.openslr.org/109/) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

O efeito `desmarcar.mp3` e as três notas iniciais de `conclusao.mp3` são tons senoidais com envelope suave, sintetizados para o jogo.

## Descrições usadas na geração das ilustrações

### Astronauta e nave

```text
Create original 2D storybook game artwork for the launch screen of a Brazilian children's space adventure for age 4+. Wide landscape composition. On the RIGHT half, a small friendly chibi astronaut, waving, with a large smooth reflecting glass visor and simple approachable smiling face, cream-and-mint rounded spacesuit with a few coral accents, gently floating above a lilac moonrock ledge. A charming small coral and ivory rocket with turquoise window flies in the middle distance above and to the left of the astronaut, on a flowing amber trail. Scene is deep midnight indigo, soft lavender clouds and a few pinprick lights. Keep the entire LEFT third dark navy and low-detail with very quiet negative space for a separate HTML game title. The astronaut and rocket must fit in the middle 65% of the image height, make the primary subject large and immediately readable, keep them away from the edges. Art style is a carefully crafted contemporary children's picture book, flat illustrated chunky shapes with subtle paper-like shading, soft rich shadows, hand-drawn texture and warm light. Restrained color harmony, bright accents against a deeply inky blue violet background. Cosmic, adventurous and comforting. No words, letters, numbers, logos, captions, UI elements, or watermark.
```

### Planeta das Estrelas

```text
Create one original isolated 2D picture-book game asset on genuine TRANSPARENT background with clean alpha, no solid backdrop. A single friendly toy-like round lavender/lilac small planet, gently tilted thin rings of warm amber gold that wrap visibly around the globe, one soft band of violet shadow and 3–4 varied subtle lilac crater marks. Large clear silhouette, slightly oblique view and ample transparent padding, entire globe and rings visible, no other objects, no floating stars, no atmospheric glow outside the asset. Visually pair with dark indigo night, coral/mint astronaut palette; make it bright, warm and inviting. Charming contemporary children's storybook 2D illustration, softly rounded graphic shapes, subtle shading and paper grain, crisp readable outline. Square composition, centered, no UI, labels, faces, words, or watermark.
```
