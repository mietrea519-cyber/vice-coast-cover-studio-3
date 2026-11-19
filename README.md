[![make.fun · gta6-cover-art-01](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![rank](https://make.fun/badge/gta6-cover-art-01/mietrea519-cyber/vice-coast-cover-studio-3/rank.svg)](https://make.fun/bounty/gta6-cover-art-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)
[![reward](https://make.fun/badge/gta6-cover-art-01/mietrea519-cyber/vice-coast-cover-studio-3/reward.svg)](https://make.fun/bounty/gta6-cover-art-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-cover-art-01)

# Vice Coast Cover Studio

A cover art maker in the style of a sun-soaked crime-city poster: your photos go in, a five-panel poster comes out. One big hero panel and four smaller ones, bold Anton caption lettering with a neon script tagline across the foot, and a neon or sunset colour grade washing over the whole thing. Everything runs in the browser from the files in this repo — no account, no upload, no network.

## How it works

The editor has four steps, with a live preview of the poster beside them:

1. **Photos** — Add your own photos from your machine, or try the two built-in samples, *Neon Driver* and *Sunset Pier* (both generated for this entry). Drag a photo file onto the page to drop it in. Click a panel in the preview to choose where a photo goes.
2. **Frame the panel** — Drag the poster to move the photo and scroll to zoom. The Zoom, Shift across, and Shift up/down sliders do the same thing precisely. Reset framing puts the photo back to its cover fit, and *Fill every panel with this photo* spreads the selected panel's photo across all the panels.
3. **Caption & grade** — Type a Title and a Tagline; both update live on the poster. Three layouts (five panels, hero + three, full bleed) and five colour grades: **Neon Nights**, **Sunset Gold**, **Pastel Vice**, **Midnight Teal**, **Coral Dusk**.
4. **Export** — One click saves the poster as a PNG in a post-ready size: **1080 × 1080**, **1080 × 1350**, or **1920 × 1080**.

The caption is drawn by measuring the whole title-plus-tagline block first and shrinking it until it fits inside the frame with a real bottom margin, so the lettering can never clip off the bottom edge. Grain and a vignette finish the poster.

## Screenshots

- `1-cover.jpg` — the NEON COAST poster on its own (landscape, 1920 × 1080).
- `2-editor.jpg` — the editor at work on the NEON COAST poster (steps 1–2).
- `3-cover.jpg` — the SUNSET KING poster on its own (portrait, 1080 × 1350).
- `4-editor.jpg` — the editor scrolled to steps 3–4 on the SUNSET KING poster, showing caption editing, grades, layouts, and all three export sizes.

The demo scenes behind them are built into the app: `?shot=cover` shows the poster alone, `?shot=editor` the editor with a photo loaded, `?shot=editor34` the editor at steps 3–4 (see `shots.json` for the exact queries).

## Run it offline

The app is plain static files under `app/` with no build step and no network requests — every script, font, and sample image is a file in this repo, and your photos are read on your own machine, never uploaded.

```sh
node serve.ts
```

Then open the address it prints (port 8080) in desktop Chrome. Or serve `app/` with any static file server.

## What is in this repo

- `app/` — the app: `index.html`, `style.css`, `src/main.js` (editor wiring), `src/cover.js` (the poster renderer), `src/shots.js` (demo scenes), the Anton and Pacifico fonts under `fonts/` (SIL Open Font License, OFL text beside them), and the two sample photos under `samples/` (generated for this entry).
- `screenshots/` — the four screenshots above.
- `main.ts` — the hand-in program; `vendor/makefun-app.ts` is the kit's library, unchanged.

No Rockstar Games logo, artwork, or font is used anywhere in this entry.
