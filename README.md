# 미화 · Mihwa

An ink-painted, interactive 3D website: a small gift for Mihwa, who studies international relations, loves Korean ink painting (수묵화), and is Korean-French.

The whole page is painted in code on warm hanji paper, with no image files:

| Scene | What happens |
| --- | --- |
| **I · Mountains** (산수) | A layered landscape after Jeong Seon's "true-view" style: crystalline peaks, folds, texture strokes, moss dots, pines and a pavilion, drifting mist, a line of geese, falling plum petals and a plum branch against the moon. Click the mountains to scatter blossoms. |
| **II · The moon** (같은 달 아래) | The moon is painted the old way, *홍운탁월*, by washing ink into the clouds around it. Live clocks show Seoul and Paris side by side. |
| **III · The world** (세계) | Scrolling turns the moon into an ink-wash globe, with a red thread between Seoul and Paris. Drag it, or pick one of 16 places where the world talks to itself (the UN, the ICJ, the EU, the African Union, the Green Climate Fund, Panmunjom and more). Each place has a short note and its distance from both homes. |
| **Words of diplomacy** | Flip cards for Korean diplomatic vocabulary, showing the hanja inside each word. |
| **IV · France & Korea** | A handscroll (두루마리) that unrolls as you scroll: 140 years from 1886 to 2026. |
| **V · The Four Gentlemen** (사군자) | Plum, orchid, chrysanthemum and bamboo paint themselves stroke by stroke with a bristle-brush engine. Click a hanging scroll to paint it again. |
| **VI · Empty space** (여백의 미) | A small ink studio: dark, mid and pale ink, plum-blossom stamps, a 美花 seal, wash away, and save as PNG. |
| **VII · A letter** (편지) | A personal letter at dusk, sealed with a cinnabar stamp. |

Everything is written in **English, French and Korean** (toggle at the top right). Sound is off by default. The ♪ button turns on a gentle gayageum-like pluck with 농현 vibrato.

## ✎ Personalise it

Open `js/content.js`:

- **`LETTER`** holds the letter in all three languages, plus the signature line. Write your own words there.
- `PLACES`, `LEXICON`, `EVENTS` and `GENTLEMEN` hold the globe places, vocabulary, timeline and scroll captions.

## Run it locally

It is a static site with no build step. Any static server works:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open <http://localhost:8080>. Opening `index.html` directly from disk won't work, because browsers block ES modules on `file://`.

## Publish it

`.github/workflows/pages.yml` deploys the site to **GitHub Pages** on every push to `main`. Enable it once under **Settings → Pages → Source: GitHub Actions**.

## How it's made

- **3D**: [three.js](https://threejs.org) (vendored in `vendor/three`, MIT). Every surface uses a custom shader:
  - Mountains are layered planes. Their ridge profiles, inner folds and brush contours come from a small ridge texture, and all washes and strokes sample a single baked, tileable noise texture, which keeps it fast on phones.
  - The globe is one sphere that morphs from moon to Earth as ink spreads across it. The land comes from Natural Earth 1:50m data (public domain), stored as a compact SVG path in `js/data/land.js`.
  - Picture quality adapts to the device's frame rate.
- **Brush engine** (`js/ink/brush.js`): each stroke is a wet body that bleeds into the paper plus a bundle of bristles that each carry their own ink, so strokes run dry into "flying white" (비백). A brush can also be loaded with two tones across its width.
- **Type**: Nanum Brush Script, Gowun Batang, Noto Serif KR and Cormorant Garamond, via Google Fonts.
- Respects `prefers-reduced-motion`, works with keyboard and touch, and falls back gracefully without WebGL.

```
index.html
css/style.css
js/
  main.js            orchestration: scroll story, language, globe UI, studio, sound
  content.js         all text (EN/FR/KO) — edit the letter here
  audio.js           Karplus–Strong gayageum pluck
  scene/             three.js world, globe, shaders, painted textures
  ink/               brush engine, Four Gentlemen, studio, handscroll
  data/land.js       world coastlines
vendor/three/        three.js r180
```
