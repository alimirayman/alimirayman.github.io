# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a personal portfolio website for Mir Ayman Ali, hosted on GitHub Pages at https://aymana.li. The site is a single-page application built with pure HTML, CSS, and minimal vanilla JavaScript - no frameworks or build tools required.

## Design Philosophy

The portfolio follows a brutalist, minimal aesthetic with these core principles:

- **Monospaced typography** using SUSE Mono throughout
- **Minimal color palette**: Black (#0f0f0f), white (#fafafa), and red accent (#e63946)
- **8px spacing system** - all spacing is derived from 8px increments (--space-1 through --space-12)
- **Golden ratio layouts** - 1.618:1 grid proportions for hero, philosophy, and contact sections
- **No excessive animations** - only simple 0.15s transitions on hover states
- **Flat design** - no boxes, gradients, or complex visual effects

Refer to `STYLEGUIDE.md` for comprehensive design documentation including color system, typography scale, spacing guidelines, and component patterns.

## File Structure

```
├── index.html              # Single-page HTML (semantic, accessible)
├── stylesheets/
│   └── stylesheet.css      # All styles (~753 lines)
├── js/
│   └── components.js       # Navigation and interactions (~110 lines)
├── img/
│   └── dot-art-3.png      # Portrait with dot-matrix aesthetic
├── me.md                  # Content source of truth
├── STYLEGUIDE.md          # Complete design documentation
├── robots.txt             # Allows all crawlers including AI bots
├── sitemap.xml            # SEO structure
└── site.webmanifest       # PWA manifest
```

## Development Workflow

### No Build Process

This is a static site - just open `index.html` in a browser. No installation, compilation, or build steps required.

### Making Changes

1. **Content updates**: Edit `me.md` first (source of truth), then sync to `index.html`
2. **Style changes**: Edit `stylesheets/stylesheet.css` directly
3. **Behavior changes**: Edit `js/components.js` for navigation or interactions
4. **Testing**: Open `index.html` in browser or use a local server:
   ```bash
   python3 -m http.server 8000
   # or
   npx serve
   ```

### Git Workflow

- **Main branch**: `master` (GitHub Pages deployment)
- **Current branch**: Check git status for active branch
- Site automatically deploys when pushing to `master`

## Key Architecture Details

### CSS Custom Properties System

All values use CSS custom properties defined in `:root`:

```css
--unit: 8px;                    /* Base spacing unit */
--space-1 through --space-12    /* 8px to 96px increments */
--font-mono: 'SUSE Mono', ...   /* Typography */
--black, --white, --red         /* Color palette */
--content-width: 960px          /* Max container width */
```

Always use these variables - never hardcode spacing, colors, or font stacks.

### BEM Naming Convention

CSS follows Block Element Modifier pattern:

```css
.hero-block                 /* Block */
.hero-block__title         /* Element */
.hero-block__title--muted  /* Modifier (if needed) */
```

### JavaScript Architecture

`js/components.js` is a single IIFE containing:

1. **Navigation system** with IntersectionObserver
   - Smooth scroll with header offset
   - Active state based on visible section
   - Responsive offset calculation on resize

2. **Utility functions**
   - Copyright year auto-update
   - External link handling (target="_blank")
   - Accessibility enhancements

The navigation uses `data-nav` attribute on links and observes sections with rootMargin offset to handle the sticky header.

### Section Structure

Six main sections with semantic IDs:
- `#about` - Hero with golden ratio grid (1.618fr 1fr)
- `#signal` - Philosophy with list and quote
- `#ventures` - Rail cards for projects (Shastho, BusinessOS, ASSENT)
- `#tools` - Skills grid
- `#timeline` - Experience with vertical timeline (dots + borders)
- `#contact` - Callout with golden ratio grid

Each section uses `.slice` wrapper with consistent spacing (--space-12 gaps, border-top dividers).

## SEO & Schema

### Structured Data

`index.html` includes comprehensive JSON-LD schema:
- Person schema with job titles, skills, and employment history
- Organization schema for Shastho Limited
- Social media links and contact points

### Meta Tags

Full Open Graph and Twitter Card metadata configured. Update these when changing content:
- Primary OG image: `/img/dot-art-3.png` (1200x630)
- Description: Keep under 155 characters
- Theme color: `#0f0f0f`

### SEO Files

- `robots.txt` - Allows all crawlers including GPTBot, Claude-Web, Google-Extended
- `sitemap.xml` - Update priorities and lastmod dates when content changes

## Design System Rules

### Spacing

**ONLY use multiples of 8px** via CSS custom properties:
- Component gaps: --space-2 to --space-4 (16-32px)
- Section spacing: --space-8 to --space-12 (64-96px)
- Padding: --space-3 to --space-6 (24-48px)

### Typography

Font weights and usage:
- 900: Hero title only
- 700: Section headings
- 600: Kickers, labels, strong tags
- 500: Emphasized text, nav links
- 400: Body text

Letter spacing:
- Headings: -0.012em to -0.025em (negative for large text)
- Small caps/labels: 0.08em to 0.15em (positive for small text)
- Body: Default (no adjustment)

### Colors

**Never introduce new colors.** Only use:
- `var(--black)` - Primary text, strong borders
- `var(--white)` - Background
- `var(--red)` - Accents, hovers, active states
- `var(--gray-100)` through `var(--gray-600)` - Borders and secondary text

### Interactive States

**Keep transitions simple:**
```css
transition: all 0.15s ease;  /* Standard duration */
```

Hover patterns:
- Links: border-bottom-color changes to red
- Buttons: background fills with black, text turns white
- Cards/list items: border-color changes to red

### Avoid

- Multiple animations or transforms
- Parallax effects or page load fades
- Box shadows (use borders instead)
- Gradients
- Non-monospaced fonts
- Spacing that isn't an 8px multiple

## Accessibility Standards

The site is WCAG 2.1 AA compliant:

- Skip link for keyboard navigation (`.skip-link`)
- Semantic HTML5 elements (header, nav, main, section, footer)
- ARIA labels on navigation and chip groups
- Proper heading hierarchy (single h1, then h2, h3)
- Alt text on all images
- Focus states on interactive elements
- Reduced motion media query support

When adding new content, maintain these standards.

## Responsive Design

Two breakpoints handle all devices:

```css
@media (max-width: 768px)  /* Tablet: single column layouts */
@media (max-width: 520px)  /* Mobile: tighter spacing, smaller type */
```

Golden ratio grids (1.618fr 1fr) collapse to single column below 768px.

## Common Tasks

### Update Employment History

1. Edit `me.md` with new role
2. Add to `#timeline` section in `index.html` as a new `<li>`
3. Update JSON-LD schema's `hasOccupation` array
4. Update `sitemap.xml` lastmod date

### Add New Venture/Project

1. Edit `me.md` venture description
2. Add new `.rail-card` in `#ventures` section
3. Use red `rail-card__label` for status (e.g., "2025 — Present")
4. Keep format consistent with existing cards

### Modify Color Palette

Don't. The black/white/red palette is core to the design. If absolutely necessary, update `:root` variables and document the change in `STYLEGUIDE.md`.

### Fix Navigation Issues

Navigation state is controlled by IntersectionObserver in `js/components.js`:
- `rootMargin` offset accounts for sticky header (line 61)
- Threshold array controls sensitivity (line 62)
- Resize handler recalculates on viewport changes (line 70-75)

## Content Source of Truth

`me.md` contains the canonical content. When updating:
1. Edit `me.md` first
2. Sync changes to `index.html`
3. Update structured data if job/org info changed
4. Test navigation and responsive layout

## Browser Support

Targets modern browsers with:
- CSS Grid
- CSS Custom Properties
- IntersectionObserver API
- Sticky positioning
- clamp() function

No polyfills or fallbacks for older browsers.

## Performance Notes

The site is intentionally minimal:
- Total uncompressed: ~45.6KB (HTML + CSS + JS)
- No external dependencies except Google Fonts
- Font preloading for SUSE Mono
- Optimized images with grayscale filter applied via CSS
- No JavaScript frameworks or libraries

Keep it lightweight - avoid adding dependencies.

## Known Patterns

### Golden Ratio Grid

Used in hero, philosophy, and contact sections:
```css
grid-template-columns: 1.618fr 1fr;  /* ~62% / ~38% */
gap: var(--space-10);                /* 80px */
```

### Vertical Timeline

Uses border-left, pseudo-element dots, and hover states:
```css
.timeline li::before {
  /* Red dot with white border */
  width: 8px;
  height: 8px;
  background: var(--red);
  border: 2px solid var(--white);
}
```

### Section Header Pattern

Consistent structure across all sections:
```html
<header class="section-head">
  <span class="section-head__index">01</span>
  <span class="section-head__eyebrow">Label</span>
  <h2 class="section-head__title">Title</h2>
  <p class="section-head__summary">Description</p>
</header>
```

## Contact & Deployment

- **Live URL**: https://aymana.li
- **Email**: ayman@shastho.ai
- **GitHub**: @alimirayman
- **Deployment**: Automatic via GitHub Pages from `master` branch

When pushing changes to `master`, site updates automatically within 1-2 minutes.
