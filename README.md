# Mir Ayman Ali - Portfolio

Static single-page portfolio for [aymana.li](https://aymana.li), organized for direct hosting on GitHub Pages or any other static file server.

## Structure

```text
.
├── assets
│   ├── images
│   │   ├── icons
│   │   └── portraits
│   ├── scripts
│   │   ├── main.js
│   │   └── modules
│   └── styles
│       └── main.css
├── index.html
├── robots.txt
├── sitemap.xml
├── site.webmanifest
└── favicon and PWA icons
```

## Editing Guide

- Keep page content, SEO metadata, and structured data in `index.html`.
- Keep visual system changes in `assets/styles/main.css`.
- Keep progressive enhancement logic in `assets/scripts/modules/`.
- Keep deploy-root files such as `robots.txt`, `sitemap.xml`, `site.webmanifest`, and the favicon assets at the repository root so they are served from `/`.

## Development

No build step is required.

Run a local server from the repository root:

```bash
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Notes

- The site is intentionally static and SEO-friendly: primary content remains in HTML.
- JavaScript is limited to navigation state, accessibility checks, external-link hardening, and the footer year.

## License

© 2026 Mir Ayman Ali. All rights reserved.
