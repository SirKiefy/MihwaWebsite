# 미화 · Mihwa

A roll of film for Mihwa, framed in Korean ink. It's an interactive website about her: her portrait, her prints, her poses and her colours, with a nod to her two homes and a letter at the end.

| Scene | What happens |
| --- | --- |
| **Her portrait, in ink** | Her photo appears inside an ink bloom on hanji paper. A real GPU fluid simulation carries ink through the water around her. Moving the cursor or a finger stirs it, and clicking drops more ink. |
| **Darkroom** | A 3D walk along a drying line under the red safelight. Each print develops as you reach it (shadows first, like real paper in the tray), with its caption pencilled in the margin. Click a print to open it. |
| **Contact sheet** | Her poses on film strips on a light table. A loupe follows the cursor, and red grease-pencil circles and handwritten notes mark the favourites. |
| **Her palette** | Her colours, pulled automatically from her photos with k-means, plus a card of field notes about her. |
| **Two homes** | An ink globe with a red thread between Seoul and Paris, and live clocks for both cities. |
| **Instagram** | Her handle, a short bio, and a 3×3 grid from her photos, linking to [@mulnaengmyeonn](https://www.instagram.com/mulnaengmyeonn/). |
| **A letter** | A personal note, sealed with a 美花 stamp. |

Everything is in **English, French and Korean** (toggle at the top right). Sound is off by default. The camera button turns on shutter clicks and soft gayageum plucks.

## ✎ Add her photos

1. Put the photos in the `photos/` folder (JPG or PNG; about 1600 px on the long side is plenty).
2. Open `js/her.js` and write each file name in `PHOTOS`, for example `src: 'photos/01.jpg'`.
3. Rewrite the captions to fit each photo (English, French and Korean).
4. Optionally choose:
   - `heroPhoto`: which photo appears in the ink at the top.
   - `favourites`: which ones get circled on the contact sheet.
   - `bio` and `notes`: the short lines about her.

Any photo left as `src: ''` shows a film-style placeholder, so the site always looks complete.

The **letter** is in `LETTER` in the same file. Write your own words there.

## Run it locally

It is a static site with no build step:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then open <http://localhost:8080>. Opening `index.html` directly from disk won't work, because browsers block ES modules on `file://`.

## Publish it

`.github/workflows/pages.yml` deploys the site to **GitHub Pages** on every push to `main`. Enable it once under **Settings → Pages → Source: GitHub Actions**.

If the repository is public, her photos will be public too.

## How it's made

- **Ink** (`js/fx/fluid.js`): a WebGL2 stable-fluids simulation (advection, vorticity confinement, pressure projection) at half-float precision, rendered as an ink wash with pigment pooling at the edges. Her photo is framed by an animated bloom whose edge the water can push around.
- **Darkroom** (`js/fx/reel.js`): three.js, with custom shaders for the hand-brushed emulsion edge, the developing curve, the paper curl and the film grain. Rendered with antialiasing at full device resolution.
- **Contact sheet** (`js/fx/sheet.js`): the grease-pencil loops are generated SVG paths drawn with a stroke animation and a waxy filter.
- **Palette** (`js/fx/palette.js`): k-means clustering over downsampled pixels from all her photos.
- **Globe**: Natural Earth 1:50m coastlines (public domain) in an ink-wash shader.
- Every canvas only runs while it's on screen.
- Respects `prefers-reduced-motion`, works with keyboard and touch, and falls back gracefully without WebGL.

```
index.html
css/style.css
js/
  her.js           ✎ her photos, captions, notes and the letter
  i18n.js          interface text (EN / FR / KO)
  main.js          wiring: language, scroll, lightbox, sections
  audio.js         shutter clicks and gayageum plucks
  fx/              ink fluid, darkroom, contact sheet, palette, lightbox, globe
  scene/           globe and shared shader code
  ink/brush.js     seal stamp and small ink helpers
photos/            her photos go here
vendor/three/      three.js r180 (MIT)
```
