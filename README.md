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

## Adding an article

Articles live in the `#writing` section of `index.html`, newest first. No build step, no JavaScript.

1. Copy the `<li class="entry entry--article">` template from the HTML comment above the list.
2. Paste it at the top of the `<ol class="articles">` list.
3. Set the article URL, the title, one plain sentence for the summary, and the date (`datetime` as YYYY-MM-DD, plus the visible date) in the margin note.
4. The "All articles on LinkedIn" link below the list always points at the full list.

## Notes

- The site is intentionally static and SEO-friendly: primary content remains in HTML.
- JavaScript is limited to navigation state, accessibility checks, external-link hardening, and the footer year.

## License

© 2026 Mir Ayman Ali. All rights reserved.
