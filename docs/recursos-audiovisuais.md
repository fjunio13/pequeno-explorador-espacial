# Registro dos recursos audiovisuais

## Imagens e gráficos

| Recurso | Origem e uso |
| --- | --- |
| `assets/images/astronauta-e-nave.webp` | Ilustração gerada no ChatGPT para a abertura do jogo, exportada em WebP |
| `assets/images/planeta-das-estrelas.webp` | Ilustração gerada no ChatGPT para o mapa e a conclusão, exportada em WebP com transparência |
| `assets/images/planeta-dos-cristais.webp` | Ilustração gerada no ChatGPT para o mapa e a conclusão, exportada em WebP com transparência |
| `assets/images/estacao-cristais.webp` | Ilustração gerada no ChatGPT para a estação, exportada em WebP com transparência |
| `assets/images/cristal.webp` | Ilustração gerada no ChatGPT para as peças manipuláveis, exportada em WebP com transparência |
| Ícones em `src/ui/controls.js` e animações em `src/ui/` | Traçados e animações produzidos para o jogo |

As ilustrações são gerações originais para este projeto. As imagens usam personagens e objetos fictícios. [Guia visual](guia-visual.md)

## Narração e efeitos

As 38 falas em `assets/audio/` foram sintetizadas em português brasileiro com Piper TTS 1.8.0 e o modelo `pt_BR-faber-medium` na revisão `5ec43b186ef915a195d3ddbcfd9916e76c503c3f`. A missão dos Cristais acrescentou 16 falas e regravou a instrução do mapa para os dois destinos. Os arquivos foram normalizados e exportados em MP3 mono a 22.050 Hz. [Catálogo de áudio](../src/services/audio-catalog.js)

O conjunto de treinamento da voz Faber é CC0, conforme a ficha do modelo. A voz-base dessa revisão é a do leitor 92, Cori Samuel, do conjunto Hi-Fi TTS sob CC BY 4.0. Créditos ao OHF-Voice, a Cori Samuel e aos autores do Hi-Fi TTS. O jogo distribui as falas sintetizadas e reproduz os MP3 locais. [Ficha da voz Faber](https://huggingface.co/rhasspy/piper-voices/blob/5ec43b186ef915a195d3ddbcfd9916e76c503c3f/pt/pt_BR/faber/medium/MODEL_CARD) · [Hi-Fi TTS](https://www.openslr.org/109/) · [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/)

O efeito `desmarcar.mp3` e as três notas iniciais de `conclusao.mp3` são tons senoidais com envelope suave, sintetizados para o jogo.

Os efeitos `cristais-encaixe.mp3` e `cristais-retirar.mp3` usam a mesma técnica, com notas diferentes. A energização e a conclusão dos Cristais começam com sequências originais de notas em `cristais-ligado.mp3` e `cristais-conclusao.mp3`.

## Descrições usadas na geração das ilustrações

### Astronauta e nave

```text
Create original 2D storybook game artwork for the launch screen of a Brazilian children's space adventure for age 4+. Wide landscape composition. On the RIGHT half, a small friendly chibi astronaut, waving, with a large smooth reflecting glass visor and simple approachable smiling face, cream-and-mint rounded spacesuit with a few coral accents, gently floating above a lilac moonrock ledge. A charming small coral and ivory rocket with turquoise window flies in the middle distance above and to the left of the astronaut, on a flowing amber trail. Scene is deep midnight indigo, soft lavender clouds and a few pinprick lights. Keep the entire LEFT third dark navy and low-detail with very quiet negative space for a separate HTML game title. The astronaut and rocket must fit in the middle 65% of the image height, make the primary subject large and immediately readable, keep them away from the edges. Art style is a carefully crafted contemporary children's picture book, flat illustrated chunky shapes with subtle paper-like shading, soft rich shadows, hand-drawn texture and warm light. Restrained color harmony, bright accents against a deeply inky blue violet background. Cosmic, adventurous and comforting. No words, letters, numbers, logos, captions, UI elements, or watermark.
```

### Planeta das Estrelas

```text
Create one original isolated 2D picture-book game asset on genuine TRANSPARENT background with clean alpha, no solid backdrop. A single friendly toy-like round lavender/lilac small planet, gently tilted thin rings of warm amber gold that wrap visibly around the globe, one soft band of violet shadow and 3–4 varied subtle lilac crater marks. Large clear silhouette, slightly oblique view and ample transparent padding, entire globe and rings visible, no other objects, no floating stars, no atmospheric glow outside the asset. Visually pair with dark indigo night, coral/mint astronaut palette; make it bright, warm and inviting. Charming contemporary children's storybook 2D illustration, softly rounded graphic shapes, subtle shading and paper grain, crisp readable outline. Square composition, centered, no UI, labels, faces, words, or watermark.
```

### Planeta dos Cristais

```text
Original single planet game asset for a children's illustrated space adventure, genuine transparent background and ample transparent margins. Centered oblique sphere, no orbit ring. A smooth rounded indigo and slate-blue rocky planet with a few broad curving mint and teal crystal veins, two small clusters of turquoise crystal outcrops rising from the surface, glints and faint copper rim light. Clear toy-like silhouette that reads at small size, graphic 2D storybook forms, soft paper grain, rich violet shadows, bright jade highlights. Friendly and magical, consistent with flat hand-painted picture-book space art. Entire planet visible, no objects outside the globe, no backdrop, text, characters, logos, UI, or watermark.
```

### Estação

```text
Create an original isolated futuristic small space-station machine for a Brazilian children's 2D storybook space game, on a genuinely transparent background. Entire machine visible, front-facing with slight three-quarter depth. A compact horizontal ivory shell with rounded corners, copper seams, small mint accents, thin flat base, flanking round wings, and one large circular glass energy core in the center with cool turquoise glow. Keep the machine readable as one object, roughly two times as wide as tall, framed with ample clear margins. Friendly retrofuturist toy design with stylized 2D rounded forms, subtly textured hand-painted surfaces, violet ambient shadows, warm highlights. No ground or shadows outside the asset, cables, crystals, people, typography, insignia, panel labels, numbers, UI, or watermark.
```

### Cristal

```text
Create a single original transparent-background 2D picture-book game sprite of a large mint turquoise energy crystal. One clean chunky upright faceted hexagonal crystal with angled tip, flat base, rounded illustrated silhouette, luminous mint central face and darker teal and violet shaded facets. Gentle paper-brush texture, high contrast at small size, same friendly hand-painted storybook illustration aesthetic as a space game for age four. Center it in a square canvas with generous transparent margins, fully visible. No ground, orbit, fixtures, multiple gems, text, watermark, background glow, or scenery.
```
