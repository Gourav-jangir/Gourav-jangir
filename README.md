# Gourav Jangir — 3D Artist Portfolio

A responsive portfolio for 3D modeling, environment art, props, and game concepts. The site is served from the root `index.html`; the page uses custom CSS and inline SVG illustrations, with Vite handling the contact form module.

## Run locally

```sh
npm install
npm run dev
```

## Contact form

The contact form sends messages through EmailJS. Copy `.env.example` to `.env.local` and set `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID`, and `VITE_EMAILJS_PUBLIC_KEY`. The template receives `from_email`, `reply_to`, and `message`.

## Customize

- Update your introduction, project descriptions, and page content in `index.html`.
- Update contact form behavior in `src/contact.ts`.
- The project illustrations are inline SVGs in `index.html` and can be replaced with rendered project images when available.
