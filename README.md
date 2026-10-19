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

Articles are Markdown files in `writing/`. One command turns them into pages.

1. Create `writing/your-article-slug.md`. The file name becomes the URL: `/writing/your-article-slug/`.
2. Start it with front matter, then write the article in Markdown (`##` headings, lists, `**bold**`, `*italic*`, `[links](url)`, `> quotes`):

   ```markdown
   ---
   title: Your article title
   date: 2026-10-19
   summary: One sentence shown in the lists and in link previews.
   original: https://www.linkedin.com/pulse/your-article
   cover: your-article-slug.jpg
   tags: Healthcare, Remote Work
   ---

   Your first paragraph.
   ```

   Only `title` and `date` (YYYY-MM-DD) are required. `original` links to where it was first published. `cover` is a 1200x630 image in `assets/images/writing/`, used for link previews. `tags` are comma-separated.

3. Run `npm run writing`. It builds `writing/<slug>/index.html`, the `/writing/` index, the latest four essays on the home page, and `sitemap.xml`.
4. Commit the Markdown and the generated files together.

The home page list sits between `<!-- writing:latest:start -->` and `<!-- writing:latest:end -->` in `index.html`. Leave those markers in place; the build rewrites what is between them.

## Notes

- The site is intentionally static and SEO-friendly: primary content remains in HTML.
- JavaScript is limited to navigation state, accessibility checks, external-link hardening, and the footer year.

## License

© 2026 Mir Ayman Ali. All rights reserved.
