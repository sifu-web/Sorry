# Sorry Generator

Generate your text 1 to 10,000 times and copy it in one click — a premium, 3D-inspired text repeater.

A polished, animated, glassmorphic text-repeater web app. Type a message, choose how many times to repeat it, and get a clean numbered list you can copy with one tap — fully in Bangla/English, entirely client-side.

## Features

- **Text input** — supports Bangla, English, Banglish, emoji, and Unicode, up to 500 characters, with a live character counter.
- **Repeat count** — number input from 1 to 10,000, plus quick-select chips (10 / 100 / 500 / 1000 / 10000).
- **Generate** — produces exactly the requested number of lines in the format `1 . your text`, with a lightweight loading state for large counts so the UI never freezes.
- **Copy All** — one-click copy via the Clipboard API with an automatic `document.execCommand` fallback and a friendly error message if copying truly fails. Button flips to "Copied ✓" and a toast confirms the copy.
- **Clear** — resets the text, output, and any error state.
- **Live stats** — line count and character count shown after every generation.
- **Ambient 3D-style background** — soft drifting "note" particles on a `<canvas>`, with an automatic pure-CSS animated gradient fallback if 2D canvas isn't available.
- **Fully responsive** — tested from 320px phones up to 1920px desktops; no horizontal scroll, no clipped text, comfortable tap targets.
- **Accessible** — labeled fields, visible focus states, `aria-live` status/error regions, keyboard shortcuts, and full `prefers-reduced-motion` support.
- **Private by design** — everything happens in your browser. Nothing you type is ever sent anywhere.

### Keyboard shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl`/`Cmd` + `Enter` | Generate |
| `Ctrl`/`Cmd` + `Shift` + `C` | Copy all |

## Tech stack

Zero-build, zero-dependency **vanilla HTML / CSS / JavaScript (ES modules)**. No React, bundler, or `npm install` is required to run it — open `index.html` (via a static server) and it works.

> **Why not React + Vite + Three.js, as originally requested?** This was built in a sandboxed environment with no network access, so packages could not be installed from npm and a Vite/React/Three.js build could not be produced or verified here. A dependency-free vanilla build was the only option that could be fully implemented, tested, and delivered working. The code is organized into small, focused ES modules (`generator.js`, `clipboard.js`, `background.js`, `app.js`) so it is easy to read, extend, or port into a React/TypeScript/Vite/R3F project later if you'd like — the generation, validation, and clipboard logic in particular are already pure functions with no DOM coupling, so they can be dropped into React components almost as-is.

Google Fonts (Hind Siliguri for Bangla, Fraunces + Manrope for display/UI type) are loaded from a CDN at runtime; everything else is local.

## Project structure

```
sorry-generator/
├── index.html          # Markup, SEO/meta tags, app shell
├── css/
│   └── styles.css      # Design tokens + full styling (glassmorphism, motion, responsive)
├── js/
│   ├── generator.js     # Pure text-generation + validation utilities
│   ├── clipboard.js     # Clipboard API with legacy fallback
│   ├── background.js    # Canvas particle background + CSS fallback
│   └── app.js            # DOM wiring: state, events, keyboard shortcuts
├── assets/
│   └── favicon.svg
└── README.md
```

## Installation & running locally

No `npm install` needed. Because the app uses ES modules (`<script type="module">`), it must be served over `http://` (not opened directly as a `file://` URL, which browsers block for module imports). Any static file server works:

```bash
# Option 1: Node (no dependencies, built into most setups via npx)
npx serve .

# Option 2: Python 3
python3 -m http.server 5173

# Option 3: VS Code "Live Server" extension
```

Then open the printed URL (e.g. `http://localhost:5173`) in your browser.

There is no separate "development" vs "production build" step — the app ships as its final, optimized static assets already. To deploy, upload the folder as-is to any static host (Netlify, Vercel, GitHub Pages, Cloudflare Pages, S3, etc.).

## How generation works

`js/generator.js` exports `generateRepeatedText(text, count)`, which builds an array of `count` strings in the exact form:

```
1 . Sorry apu 😭
2 . Sorry apu 😭
3 . Sorry apu 😭
```

(number, space, dot, space, text) and joins them with `\n` in a single pass — no per-line DOM nodes and no repeated string concatenation — so it stays smooth even at the 10,000-line maximum. The result panel renders the whole block as one `<pre>` element with `overflow-y: auto` and a capped height, which keeps the DOM small and scrolling native and fast regardless of line count.

## How to customize

- **Colors / spacing / radii / motion timing** — all defined as CSS custom properties at the top of `css/styles.css` under `:root`; change a token once and it updates everywhere.
- **Copy limits** — `MIN_COUNT`, `MAX_COUNT`, `MAX_TEXT_LENGTH` are exported constants in `js/generator.js`.
- **Quick-count chips** — edit the `data-count` buttons inside `.quick-counts` in `index.html`.
- **Background particles** — density, colors (`PALETTE`), size, and speed are tunable constants near the top of `js/background.js`.
- **Copy/labels** — all Bangla/English strings live directly in `index.html` and the small set of user-facing messages in `app.js`, so they're easy to find and edit.

## Browser requirements

Any modern evergreen browser (Chrome, Edge, Firefox, Safari — desktop or mobile). Requires JavaScript and ES module support (all browsers from the last several years). The canvas background gracefully falls back to a CSS animation if 2D canvas is unavailable, and respects `prefers-reduced-motion`.

## Clipboard requirements

The one-click copy uses `navigator.clipboard.writeText`, which requires a **secure context** — i.e. the page must be served over `https://` or `http://localhost`. On any other plain-`http://` origin, the app automatically falls back to a legacy `document.execCommand('copy')` method, so copying still works; if both methods fail (e.g. clipboard permission denied), a clear inline error is shown instead of silently failing.

## Troubleshooting

| Problem | Fix |
|---|---|
| Blank page / console error about modules | You opened `index.html` directly as a file. Serve it with a local static server (see above) instead. |
| Copy button doesn't work | Make sure you're on `https://` or `localhost`. Otherwise the fallback copy method should still work; if it doesn't, your browser may be blocking clipboard access — check site permissions. |
| Bangla text looks broken | Make sure your OS/browser has the Hind Siliguri font available or an internet connection so the Google Fonts CDN link can load; a Unicode-capable system fallback font is used otherwise. |
| Background looks like soft blobs instead of drifting notes | That's the intentional CSS fallback — it activates automatically when canvas 2D isn't available or you have "reduce motion" enabled in your OS. |
