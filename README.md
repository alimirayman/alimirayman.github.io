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

Articles are Markdown files in `content/articles/`. One command turns them into pages at `/articles/<slug>/`.

1. Create `content/articles/your-article-slug.md`. The file name becomes the URL: `/articles/your-article-slug/`.
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

   Only `title` and `date` (YYYY-MM-DD) are required. `original` links to where it was first published. `tags` are comma-separated.

3. For a cover image, put a 1280x720 JPEG in `assets/images/articles/` and name it in `cover`. It shows on the article page, in the lists, and in link previews. Optional, for faster pages: add `your-article-slug.webp` (1280x720) and `your-article-slug-thumb.webp` (800x450) next to it, for example with `cwebp -q 70 cover.jpg -o your-article-slug.webp`. The build uses them when they exist.
4. Run `npm run articles`. It rebuilds `articles/` (every article page and the index), the latest four on the home page, and `sitemap.xml`.
5. Commit the Markdown, the images, and the generated files together.

The home page list sits between `<!-- articles:latest:start -->` and `<!-- articles:latest:end -->` in `index.html`. Leave those markers in place. `content/` is kept out of search results in `robots.txt`.

## Notes

- The site is intentionally static and SEO-friendly: primary content remains in HTML.
- JavaScript is limited to navigation state, accessibility checks, external-link hardening, and the footer year.

## License

© 2026 Mir Ayman Ali. All rights reserved.
