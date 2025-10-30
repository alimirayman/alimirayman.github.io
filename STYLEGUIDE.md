# Ayman Ali Portfolio - Style Guide & Documentation

**Last Updated:** October 30, 2025
**Version:** 1.0
**Site:** https://mirayman.com

---

## Design Philosophy

### Core Principles

1. **Simple but Powerful** - Clean design without excessive animations or unnecessary elements
2. **Monospaced Typography** - SUSE Mono font throughout for technical aesthetic
3. **Minimal Color Palette** - Black, white, and red accent only
4. **Golden Ratio** - 1.618 used for layouts and proportions
5. **8px Base Unit** - All spacing derived from 8px increments
6. **No Boxes, No Gradients** - Clean lines and flat design
7. **Modern/Retro Aesthetic** - Combines contemporary minimal design with dot-matrix imagery

### Design Criteria

✓ **Approved:**
- Clean black/white with red accent
- Monospaced fonts (SUSE Mono)
- Minimal, flat design
- Simple hover states (0.15s transitions)
- Golden ratio layouts (1.618:1)
- 8px spacing system
- Semantic HTML with proper accessibility

✗ **Avoid:**
- Excessive animations (parallax, page load fades, transforms)
- Boxes and gradients
- Multiple color schemes
- Redundant horizontal lines
- Non-monospaced fonts
- Complex interactions

---

## Color System

```css
--black: #0f0f0f;        /* Primary text, borders */
--white: #fafafa;        /* Background */
--red: #e63946;          /* Accent, highlights, active states */

/* Grayscale */
--gray-100: #e8e8e8;     /* Light borders */
--gray-200: #d0d0d0;     /* Section dividers */
--gray-400: #8a8a8a;     /* Secondary text */
--gray-600: #505050;     /* Tertiary text */
```

### Color Usage

- **Primary Actions:** Black buttons with white text on hover
- **Accent Elements:** Red for kickers, labels, active nav, dots
- **Body Text:** Black (#0f0f0f)
- **Secondary Text:** Gray-600 (#505050)
- **Borders:** Black for strong divisions, Gray-200 for soft divisions
- **Selection:** Red background, white text

---

## Typography

### Font Stack

```css
--font-mono: 'SUSE Mono', 'SF Mono', 'Courier New', monospace;
```

**Weights Used:**
- 400 (Regular) - Body text
- 500 (Medium) - Emphasized text, nav links
- 600 (Semi-bold) - Strong tags, kickers
- 700 (Bold) - Headings
- 900 (Black) - Hero title only

### Line Heights

```css
--line-height-tight: 1.2;      /* Headings */
--line-height-normal: 1.5;     /* Standard text */
--line-height-relaxed: 1.618;  /* Body paragraphs (golden ratio) */
```

### Type Scale

```css
/* Hero */
.hero-block__title: clamp(48px, 8vw, 84px)  /* 900 weight */
.hero-block__lede: 21px                      /* 500 weight */
.hero-block__body: 15px                      /* 400 weight */

/* Section Headers */
.section-head__title: 30px                   /* 700 weight */
.section-head__eyebrow: 10px                 /* 600 weight */
.section-head__index: 13px                   /* 700 weight */

/* Content */
.rail-card h3: 23px                          /* 700 weight */
.timeline h3: 16px                           /* 700 weight */
body: 15px                                   /* 400 weight */

/* Small Text */
.chip: 10px                                  /* 500 weight */
.rail-card__label: 10px                      /* 600 weight */
.footer-note: 10px                           /* 400 weight */
```

### Letter Spacing

- **Headings:** -0.012em to -0.025em (tighter for larger text)
- **Small Caps:** 0.08em to 0.15em (looser for readability)
- **Body Text:** Default (no adjustment)

---

## Spacing System

### Base Unit: 8px

```css
--unit: 8px;
--space-1:  8px    (var(--unit) * 1)
--space-2:  16px   (var(--unit) * 2)
--space-3:  24px   (var(--unit) * 3)
--space-4:  32px   (var(--unit) * 4)
--space-5:  40px   (var(--unit) * 5)
--space-6:  48px   (var(--unit) * 6)
--space-8:  64px   (var(--unit) * 8)
--space-10: 80px   (var(--unit) * 10)
--space-12: 96px   (var(--unit) * 12)
```

### Spacing Guidelines

- **Component gaps:** 16-32px (space-2 to space-4)
- **Section spacing:** 64-96px (space-8 to space-12)
- **Element margins:** 8-24px (space-1 to space-3)
- **Padding:** 24-48px (space-3 to space-6)

---

## Layout Structure

### Grid System

```css
--content-width: 960px;
--content-padding: var(--space-4);  /* 32px */
```

### Golden Ratio Columns

```css
/* Hero and Callout sections */
grid-template-columns: 1.618fr 1fr;  /* ~62% / ~38% split */
```

### Page Structure

```
┌─────────────────────────────────────┐
│ Sticky Navigation (top-bar)        │
├─────────────────────────────────────┤
│                                     │
│ Hero (1.618:1 grid)                │
│ ├─ Primary (left)                  │
│ └─ Aside (right)                   │
│                                     │
├─────────────────────────────────────┤
│ Philosophy (1.618:1 grid)          │
├─────────────────────────────────────┤
│ Ventures (rail-card list)          │
├─────────────────────────────────────┤
│ Skills (grid)                      │
├─────────────────────────────────────┤
│ Experience (timeline)              │
├─────────────────────────────────────┤
│ Contact (1.618:1 grid callout)     │
├─────────────────────────────────────┤
│ Footer                             │
└─────────────────────────────────────┘
```

---

## Component Patterns

### Navigation

```css
.top-bar {
    position: sticky;
    border-bottom: 1px solid var(--black);
    padding: var(--space-3) 0;
}

.top-bar__nav a {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--gray-600);
}

.top-bar__nav a.is-active {
    color: var(--black);
    border-bottom: 1px solid var(--black);
}
```

**Behavior:**
- Sticky positioning
- Active state based on scroll position (IntersectionObserver)
- Smooth scroll with offset for header height

### Buttons

```css
/* Primary Button */
.hero-block__links a {
    padding: 10px 18px;
    border: 1px solid var(--black);
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
}

.hero-block__links a:hover {
    background: var(--black);
    color: var(--white);
}
```

### Chips/Tags

```css
.chip {
    padding: 6px 12px;
    border: 1px solid var(--gray-200);
    font-size: 10px;
    text-transform: uppercase;
    letter-spacing: 0.1em;
}

.chip:hover {
    border-color: var(--red);
    color: var(--red);
}
```

### Timeline

```css
.timeline li {
    border-left: 2px solid var(--gray-200);
    padding-left: var(--space-4);
}

.timeline li::before {
    /* Red dot with white border */
    width: 8px;
    height: 8px;
    background: var(--red);
    border: 2px solid var(--white);
    border-radius: 50%;
}

.timeline li:hover {
    border-left-color: var(--red);
}

.timeline li:hover::before {
    background: var(--black);
}
```

### Cards

```css
.rail-card {
    gap: var(--space-3);
    padding: var(--space-6) 0;
    border-bottom: 1px solid var(--gray-100);
}

.rail-card:hover {
    border-bottom-color: var(--red);
}
```

---

## Content Structure

### Page Sections

1. **About (Hero)** - `#about`
   - Name, title, bio
   - Portrait with dot-matrix effect
   - Focus chips
   - Social links

2. **Philosophy** - `#signal`
   - Core principles list
   - Quote box

3. **Ventures** - `#ventures`
   - Shastho Limited (2021-Present)
   - BusinessOS (In Development)
   - ASSENT (Co-lead)

4. **Skills** - `#tools`
   - Full-Stack Development
   - System Architecture
   - Infrastructure & DevOps

5. **Experience** - `#timeline`
   - Obviously AI
   - ProSymmetry LLC
   - HSBlox
   - IDEEZA
   - Hypnotic Code
   - The Profs

6. **Contact** - `#contact`
   - CTA callout
   - Contact links
   - Availability info

### Removed Sections

- ❌ **Products** - Redundant with Ventures section
- ❌ **Brand header** - Removed from navigation for cleaner look

---

## SEO & Metadata

### Meta Tags

```html
<meta name="description" content="Mir Ayman Ali — Systems architect, entrepreneur, and product builder...">
<meta name="author" content="Mir Ayman Ali">
<meta name="theme-color" content="#0f0f0f">

<!-- Open Graph -->
<meta property="og:type" content="website">
<meta property="og:image" content="https://mirayman.com/img/dot-art-3.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:creator" content="@alimirayman">
```

### Structured Data

- **Type:** Person schema
- **Includes:** Name variations, job titles, organization, skills, employment history, languages
- **Enhanced with:** Role-based occupation data, detailed skill descriptions

### SEO Files

- **robots.txt** - Allows all crawlers including AI (GPTBot, Claude-Web, etc.)
- **sitemap.xml** - All sections with priority levels
- **Canonical URL:** https://mirayman.com

---

## Responsive Breakpoints

```css
@media (max-width: 768px) {
    /* Tablet */
    - Single column layouts
    - Font size: 26px (section titles)
    - Reduced padding
}

@media (max-width: 520px) {
    /* Mobile */
    - Font size: 24px (section titles), 36px (hero)
    - Tighter spacing
}
```

---

## Accessibility

### Features

✓ **Skip to main content** link
✓ **ARIA labels** on navigation and sections
✓ **Semantic HTML** (header, nav, main, section, footer)
✓ **Keyboard navigation** support
✓ **Focus states** on interactive elements
✓ **Alt text** on images
✓ **Reduced motion** support

### Standards

- WCAG 2.1 AA compliant
- Proper heading hierarchy (h1 → h2 → h3)
- Color contrast ratios meet requirements
- Touch targets: 44x44px minimum

---

## File Structure

```
alimirayman.github.io/
├── index.html                 # Main HTML file
├── me.md                      # Content source of truth
├── STYLEGUIDE.md             # This file
├── robots.txt                # SEO: crawler permissions
├── sitemap.xml               # SEO: site structure
├── stylesheets/
│   └── stylesheet.css        # Main stylesheet (753 lines)
├── js/
│   └── components.js         # JavaScript (110 lines)
└── img/
    ├── dot-art-3.png         # Portrait image
    └── icons/                # Favicons
```

---

## Performance Optimizations

### Implemented

✓ Removed normalize.css (~425 lines saved)
✓ Optimized font loading (5 weights vs 7)
✓ Removed unused CSS variables
✓ Minimal JavaScript (110 lines)
✓ No external dependencies
✓ Font preloading
✓ Optimized images

### File Sizes

```
stylesheet.css: ~15.7KB
components.js:  ~3.9KB
index.html:     ~26KB
Total:          ~45.6KB
```

---

## Links & Social

### Contact Information

- **Email:** ayman@shastho.ai
- **LinkedIn:** https://www.linkedin.com/in/alimirayman/
- **GitHub:** https://github.com/alimirayman
- **Twitter:** @alimirayman
- **Website:** https://shastho.ai

### Name Variations

- Mir Ayman Ali (full name)
- Ayman Ali (preferred)
- alimirayman (username)

---

## Development Guidelines

### CSS

1. **Use CSS custom properties** for all repeated values
2. **Follow BEM naming** (block__element--modifier)
3. **Group by component** with clear comments
4. **Maintain 8px spacing** multiples
5. **Keep transitions simple** (0.15s ease)

### HTML

1. **Semantic markup** always
2. **ARIA labels** where needed
3. **No inline styles**
4. **Validate HTML5** compliance

### JavaScript

1. **Keep minimal** - only essential interactions
2. **Use vanilla JS** - no frameworks
3. **Progressive enhancement**
4. **Handle errors gracefully**

### Content Updates

1. **Update me.md first** - source of truth
2. **Sync to index.html**
3. **Update sitemap.xml** if structure changes
4. **Test all links** before deploying

---

## Browser Support

### Supported

✓ Chrome (latest)
✓ Firefox (latest)
✓ Safari (latest)
✓ Edge (latest)
✓ iOS Safari
✓ Chrome Mobile

### Features Used

- CSS Grid
- CSS Custom Properties
- IntersectionObserver
- Sticky positioning
- clamp() function

---

## Design Evolution

### Original Issues

❌ Worst design and messaging
❌ Too many animations (parallax, transforms, fades)
❌ Navigation shadow issues
❌ Timeline dot misalignment
❌ Redundant product section
❌ Incorrect social links
❌ Missing SEO files

### Final Result

✓ Clean black/white/red aesthetic
✓ Simple but powerful design
✓ No excessive animations
✓ Perfect alignment
✓ Optimized content structure
✓ Correct links
✓ Full SEO optimization

---

## Maintenance Checklist

### Regular Updates

- [ ] Update copyright year (automatic via JS)
- [ ] Review and update employment history
- [ ] Check all external links
- [ ] Update project descriptions
- [ ] Regenerate sitemap if needed

### Before Deploy

- [ ] Validate HTML
- [ ] Check CSS for errors
- [ ] Test all interactive elements
- [ ] Verify mobile responsiveness
- [ ] Test navigation highlighting
- [ ] Check image optimization
- [ ] Validate structured data

---

## Version History

### v1.0 (October 2025)

- Complete redesign from scratch
- Implemented 8px spacing system
- Added golden ratio layouts
- Created minimal color palette
- Removed excessive animations
- Optimized for SEO and AI crawlers
- Added comprehensive accessibility features
- Cleaned up redundant sections

---

**End of Style Guide**

For questions or updates, contact: ayman@shastho.ai
