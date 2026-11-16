# Gourav Jangir — Portfolio Terminal

A single-page, keyboard-driven portfolio built with React, TypeScript, Vite, Tailwind CSS, and a lazy-loaded React Three Fiber model viewer. The interface uses a monochrome tactical CRT style with CSS/SVG halftone texture.

## Run locally

```sh
npm install
npm run dev
```

Use the arrow keys or WASD to navigate the menu. Press Enter or P to open an item; Escape or Backspace returns to the menu. Project cards open a file readout.

The app stays locked to the viewport. On touch screens, use the `^` and `v` buttons; the active screen panel scrolls internally when needed.

## Customize

- Replace the sample work in `src/data/projects.ts`.
- Update the profile and skills in `src/App.tsx`.
- Copy `.env.example` to `.env.local` and set the three EmailJS values. The EmailJS template should use `from_email`, `reply_to`, and `message`.
- Add an optimized model at `public/models/character.glb`. The Stats viewer normalizes its size and applies monochrome materials; it uses `character-preview.svg` while loading or if WebGL/model loading fails.
- Add `move.mp3`, `select.mp3`, and `open.mp3` to `public/sounds/`. If a clip is missing, a short synthesized 8-bit tone is used instead.

See `docs/reference-analysis.md` for the reference site’s observed hierarchy and interaction patterns, plus the limits of the available inspection evidence.
