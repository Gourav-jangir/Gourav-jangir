# Gourav Jangir — 2D Portfolio World

A single-page React, TypeScript, Vite, and Tailwind portfolio styled as a 2D pixel-art game. The world, character, clouds, and interface are drawn with SVG and CSS; no 3D renderer or model files are used.

## Run locally

```sh
npm install
npm run dev
```

Use hotbar slots **1–5** or click a slot to switch between Stats, Projects, About, Contact, and Resume. Left and right arrows cycle through the slots. Select a project block or project item to jump to its details. Press Escape to close the project window or return to Stats.

The app fits the viewport. Panels scroll internally when their contents need more room, and the hotbar remains touch-friendly on narrow screens.

## Customize

- Update project content in `src/data/projects.ts` and profile/skill copy in `src/App.tsx`.
- Small 16×16 block maps in `public/imgs/blocks/` are used as pixel-art decoration for the floor and project blocks.
- The world and outlined player character are implemented in `src/components/PixelWorld.tsx` and `src/components/PlayerCharacter.tsx` using HTML, CSS, and SVG.
- Copy `.env.example` to `.env.local` and set the EmailJS service ID, template ID, and public key. The template receives `from_email`, `reply_to`, and `message`.
- Optional sound files go in `public/sounds/`: `move.mp3`, `select.mp3`, `open.mp3`, and `block-break.mp3`. When a clip is unavailable, the app synthesizes a short sound in Web Audio.
