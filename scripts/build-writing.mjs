// Builds the Writing section from writing/*.md: one page per article, the /writing/ index,
// the latest articles on the home page, and sitemap.xml. No dependencies: run `npm run writing`.
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const WRITING_DIR = join(ROOT, 'writing');
const SITE = 'https://aymana.li';
const HOME_LIMIT = 4;
const WORDS_PER_MINUTE = 220;
const HOME_START = '<!-- writing:latest:start -->';
const HOME_END = '<!-- writing:latest:end -->';

const escapeHtml = (text) =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const formatDate = (iso) =>
    new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'UTC',
    });

const parseArticle = (file) => {
    const source = readFileSync(join(WRITING_DIR, file), 'utf8').replace(/\r\n/g, '\n');
    const match = source.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);

    if (!match) {
        throw new Error(`${file}: add front matter between --- lines (title, date)`);
    }

    const meta = {};
    match[1].split('\n').forEach((line) => {
        const colon = line.indexOf(':');
        if (colon > 0) {
            meta[line.slice(0, colon).trim()] = line.slice(colon + 1).trim();
        }
    });

    if (!meta.title || !meta.date) {
        throw new Error(`${file}: front matter needs a title and a date`);
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(meta.date)) {
        throw new Error(`${file}: date must be YYYY-MM-DD, got "${meta.date}"`);
    }

    const body = match[2].trim();
    const words = body.split(/\s+/).filter(Boolean).length;

    return {
        slug: file.replace(/\.md$/, ''),
        title: meta.title,
        date: meta.date,
        summary: meta.summary || '',
        original: meta.original || '',
        cover: meta.cover || '',
        tags: meta.tags ? meta.tags.split(',').map((tag) => tag.trim()).filter(Boolean) : [],
        minutes: Math.max(1, Math.round(words / WORDS_PER_MINUTE)),
        body,
    };
};

// Inline Markdown: code, links, bold, italic. Text is escaped first.
const renderInline = (text) =>
    escapeHtml(text)
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?=[^*\w]|$)/g, '$1<em>$2</em>')
        .replace(/\n/g, '<br>');

// Block Markdown: ## and ### headings, > quotes, - and 1. lists, images, paragraphs.
const renderMarkdown = (markdown) =>
    markdown
        .split(/\n{2,}/)
        .map((block) => block.trim())
        .filter(Boolean)
        .map((block) => {
            const lines = block.split('\n');
            const heading = block.match(/^(#{2,3})\s+(.+)$/);
            const image = block.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);

            if (heading) {
                const level = heading[1].length;
                return `<h${level}>${renderInline(heading[2])}</h${level}>`;
            }

            if (image) {
                return `<figure><img src="${image[2]}" alt="${escapeHtml(image[1])}" loading="lazy"></figure>`;
            }

            if (lines.every((line) => /^>\s?/.test(line))) {
                return `<blockquote><p>${renderInline(lines.map((line) => line.replace(/^>\s?/, '')).join('\n'))}</p></blockquote>`;
            }

            if (lines.every((line) => /^[-*]\s+/.test(line))) {
                return `<ul>${lines.map((line) => `<li>${renderInline(line.replace(/^[-*]\s+/, ''))}</li>`).join('')}</ul>`;
            }

            if (lines.every((line) => /^\d+\.\s+/.test(line))) {
                return `<ol>${lines.map((line) => `<li>${renderInline(line.replace(/^\d+\.\s+/, ''))}</li>`).join('')}</ol>`;
            }

            return `<p>${renderInline(block)}</p>`;
        })
        .join('\n');

const articleUrl = (article) => `/writing/${article.slug}/`;

// The summary often is the opening sentence; only repeat it under the title when it is not.
const plainText = (markdown) =>
    markdown
        .replace(/[*_`>#]|\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\p{Extended_Pictographic}/gu, '')
        .replace(/\s+/g, ' ')
        .trim();
const showDek = (article) => article.summary && !plainText(article.body).startsWith(plainText(article.summary).slice(0, 48));

// The list used on the home page and on /writing/.
const renderList = (articles) => `<ol class="articles" role="list">
${articles
    .map(
        (article) => `                    <li class="entry entry--article">
                        <div class="entry__main">
                            <h3 class="article__title"><a href="${articleUrl(article)}">${escapeHtml(article.title)}</a></h3>
                            <p class="article__summary">${escapeHtml(article.summary)}</p>
                        </div>
                        <aside class="entry__note"><p class="when"><time datetime="${article.date}">${formatDate(article.date)}</time><span class="when__sep">, </span><br>${article.minutes} min read</p></aside>
                    </li>`
    )
    .join('\n')}
                </ol>`;

const header = `<a href="#main" class="skip-link">Skip to main content</a>

    <header class="top-bar">
        <div class="sheet top-bar__inner">
            <a class="top-bar__brand" href="/" aria-label="Mir Ayman Ali, home">
                <span class="top-bar__name">Mir Ayman Ali</span>
                <span class="top-bar__note">Founder / Systems Architect / Product Builder</span>
            </a>
            <nav class="top-bar__nav" aria-label="Primary">
                <a href="/#philosophy">Philosophy</a>
                <a href="/#ventures">Ventures</a>
                <a href="/#now">Now</a>
                <a href="/writing/" aria-current="page">Writing</a>
                <a href="/#experience">Experience</a>
                <a href="/#contact">Contact</a>
            </nav>
        </div>
    </header>`;

const footer = `<footer class="site-footer">
        <div class="sheet site-footer__inner">
            <p>Set in SUSE Mono and Newsreader. Built by hand with HTML, CSS, and a little JavaScript.</p>
            <p>© <span id="copyright-year">${new Date().getFullYear()}</span> Mir Ayman Ali</p>
        </div>
    </footer>`;

const page = ({ title, description, path, image, type, body, schema }) => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <meta name="author" content="Mir Ayman Ali">
    <meta name="theme-color" content="#0f0f11">
    <link rel="canonical" href="${SITE}${path}">
    <link rel="icon" href="/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
    <link rel="manifest" href="/site.webmanifest">

    <meta property="og:type" content="${type}">
    <meta property="og:url" content="${SITE}${path}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:image" content="${SITE}${image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="Mir Ayman Ali">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:creator" content="@alimirayman">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${SITE}${image}">

    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=SUSE+Mono:wght@400;500;600;700;800&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/styles/main.css">
    <script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body class="page--writing">
    ${header}

    <main id="main" tabindex="-1">
${body}
    </main>

    ${footer}

    <script type="module" src="/assets/scripts/main.js"></script>
</body>
</html>
`;

const renderArticlePage = (article, newer, older) => {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: article.title,
        description: article.summary,
        datePublished: article.date,
        author: { '@type': 'Person', '@id': `${SITE}/#person`, name: 'Mir Ayman Ali', url: SITE },
        image: article.cover ? `${SITE}/assets/images/writing/${article.cover}` : `${SITE}/assets/images/og-ayman.jpg`,
        mainEntityOfPage: `${SITE}${articleUrl(article)}`,
        ...(article.original ? { sameAs: article.original } : {}),
        ...(article.tags.length ? { keywords: article.tags.join(', ') } : {}),
    };

    const neighbours = [
        newer ? `<a class="essay__next" href="${articleUrl(newer)}"><span>Newer</span>${escapeHtml(newer.title)}</a>` : '',
        older ? `<a class="essay__next" href="${articleUrl(older)}"><span>Older</span>${escapeHtml(older.title)}</a>` : '',
    ].join('\n                ');

    const body = `        <article class="essay" aria-labelledby="essay-title">
            <header class="sheet essay__head">
                <p class="section__index"><a href="/writing/">Writing</a></p>
                <h1 id="essay-title" class="essay__title">${escapeHtml(article.title)}</h1>
                ${showDek(article) ? `<p class="essay__dek">${escapeHtml(article.summary)}</p>` : ''}
            </header>

            <div class="sheet entry essay__layout">
                <div class="entry__main essay__body">
${renderMarkdown(article.body)}
                </div>
                <aside class="entry__note essay__meta">
                    <dl class="spec">
                        <div><dt>Published</dt><dd><time datetime="${article.date}">${formatDate(article.date)}</time></dd></div>
                        <div><dt>Reading time</dt><dd>${article.minutes} min</dd></div>
                        ${article.original ? `<div><dt>First published on</dt><dd><a href="${article.original}">LinkedIn</a></dd></div>` : ''}
                        ${article.tags.length ? `<div><dt>Tags</dt><dd>${article.tags.map((tag) => escapeHtml(tag.replace(/([a-z])([A-Z])/g, '$1 $2'))).join(', ')}</dd></div>` : ''}
                    </dl>
                </aside>
            </div>

            <nav class="sheet essay__foot" aria-label="More writing">
                ${neighbours}
                <a class="essay__all" href="/writing/">All writing</a>
            </nav>
        </article>`;

    return page({
        title: `${article.title} | Mir Ayman Ali`,
        description: article.summary || article.title,
        path: articleUrl(article),
        image: article.cover ? `/assets/images/writing/${article.cover}` : '/assets/images/og-ayman.jpg',
        type: 'article',
        body,
        schema,
    });
};

const renderIndexPage = (articles) =>
    page({
        title: 'Writing | Mir Ayman Ali',
        description: 'Essays by Mir Ayman Ali on healthcare, work, learning, and communication.',
        path: '/writing/',
        image: '/assets/images/og-ayman.jpg',
        type: 'website',
        schema: {
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'Writing by Mir Ayman Ali',
            url: `${SITE}/writing/`,
            author: { '@id': `${SITE}/#person` },
        },
        body: `        <section class="section section--first" aria-labelledby="writing-title">
            <div class="sheet">
                <header class="section__head">
                    <p class="section__index">Writing</p>
                    <h1 id="writing-title" class="section__title">Essays and notes</h1>
                    <p class="section__summary">${articles.length} essays on healthcare, work, learning, and communication.</p>
                </header>
                ${renderList(articles)}
            </div>
        </section>`,
    });

const updateHome = (articles) => {
    const file = join(ROOT, 'index.html');
    const html = readFileSync(file, 'utf8');
    const start = html.indexOf(HOME_START);
    const end = html.indexOf(HOME_END);

    if (start === -1 || end === -1) {
        throw new Error(`index.html: add ${HOME_START} and ${HOME_END} where the latest articles go`);
    }

    const latest = `${HOME_START}
                ${renderList(articles.slice(0, HOME_LIMIT))}
                <p class="more-link"><a href="/writing/">All ${articles.length} essays</a></p>
                ${HOME_END}`;

    writeFileSync(file, html.slice(0, start) + latest + html.slice(end + HOME_END.length));
};

const updateSitemap = (articles) => {
    const today = new Date().toISOString().slice(0, 10);
    const urls = [
        { loc: `${SITE}/`, lastmod: today, priority: '1.0' },
        { loc: `${SITE}/writing/`, lastmod: articles[0] ? articles[0].date : today, priority: '0.7' },
        ...articles.map((article) => ({ loc: `${SITE}${articleUrl(article)}`, lastmod: article.date, priority: '0.6' })),
    ];

    writeFileSync(
        join(ROOT, 'sitemap.xml'),
        `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `    <url>\n        <loc>${url.loc}</loc>\n        <lastmod>${url.lastmod}</lastmod>\n        <priority>${url.priority}</priority>\n    </url>`).join('\n')}
</urlset>
`
    );
};

const articles = readdirSync(WRITING_DIR)
    .filter((file) => file.endsWith('.md'))
    .map(parseArticle)
    .sort((a, b) => b.date.localeCompare(a.date));

articles.forEach((article, index) => {
    const dir = join(WRITING_DIR, article.slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), renderArticlePage(article, articles[index - 1], articles[index + 1]));
});

writeFileSync(join(WRITING_DIR, 'index.html'), renderIndexPage(articles));
updateHome(articles);
updateSitemap(articles);

console.log(`Built ${articles.length} articles: ${articles.map((article) => article.slug).join(', ')}`);
