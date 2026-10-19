// Builds the Articles section from content/articles/*.md: one page per article at /articles/<slug>/,
// the /articles/ index, the latest articles on the home page, and sitemap.xml.
// No dependencies: run `npm run articles`.
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SOURCE_DIR = join(ROOT, 'content', 'articles');
const OUTPUT_DIR = join(ROOT, 'articles');
const IMAGE_DIR = join(ROOT, 'assets', 'images', 'articles');
const IMAGE_URL = '/assets/images/articles';
const SITE = 'https://aymana.li';
const HOME_LIMIT = 4;
const WORDS_PER_MINUTE = 220;
const HOME_START = '<!-- articles:latest:start -->';
const HOME_END = '<!-- articles:latest:end -->';

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
    const source = readFileSync(join(SOURCE_DIR, file), 'utf8').replace(/\r\n/g, '\n');
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

    if (meta.cover && !existsSync(join(IMAGE_DIR, meta.cover))) {
        throw new Error(`${file}: cover "${meta.cover}" is not in assets/images/articles/`);
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

// Optional companions next to a cover: <name>.webp for display and <name>-thumb.webp for lists.
const companion = (cover, suffix) => {
    const name = `${cover.replace(/\.[^.]+$/, '')}${suffix}.webp`;
    return existsSync(join(IMAGE_DIR, name)) ? `${IMAGE_URL}/${name}` : '';
};

const coverPicture = (article, { suffix, className, loading }) => {
    if (!article.cover) {
        return '';
    }

    const webp = companion(article.cover, suffix);

    return `<picture class="${className}">
                            ${webp ? `<source type="image/webp" srcset="${webp}">` : ''}
                            <img src="${IMAGE_URL}/${article.cover}" alt="Cover image for ${escapeHtml(article.title)}" width="1280" height="720" loading="${loading}" decoding="async">
                        </picture>`;
};

// Inline Markdown: code, links, bold, italic. Text is escaped first.
const renderInline = (text) =>
    escapeHtml(text)
        .replace(/`([^`]+)`/g, '<code>$1</code>')
        .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^*\w])\*([^*\s][^*]*?)\*(?=[^*\w]|$)/g, '$1<em>$2</em>')
        .replace(/\n/g, '<br>');

// A list item that opens with a bold lead-in ("**Telemedicine**: ...") sets the lead on its own line.
// Handles "**Lead**: text", "**Lead:** text", and "**Lead**text".
const renderItem = (text) => {
    const lead = text.match(/^\*\*([^*]+?):?\*\*:?\s*([\s\S]*)$/);
    return lead
        ? `<li><strong class="lead">${renderInline(lead[1])}</strong> ${renderInline(lead[2])}</li>`
        : `<li>${renderInline(text)}</li>`;
};

const renderItems = (lines, pattern) => {
    const items = lines.map((line) => line.replace(pattern, ''));
    const leads = items.some((item) => /^\*\*[^*]+\*\*/.test(item));
    return { leads, html: items.map(renderItem).join('') };
};

const slugify = (text) =>
    plainText(text)
        .toLowerCase()
        .replace(/['’]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'section';

// Block Markdown: ## and ### headings, > quotes, - and 1. lists, images, paragraphs.
// Returns the HTML and the ## headings, numbered, for the contents list.
const renderMarkdown = (markdown) => {
    const headings = [];
    const ids = new Set();

    const html = markdown
        .split(/\n{2,}/)
        .map((block) => block.trim())
        .filter(Boolean)
        .map((block) => {
            const lines = block.split('\n');
            const heading = block.match(/^(#{2,3})\s+(.+)$/);
            const image = block.match(/^!\[([^\]]*)\]\(([^)\s]+)\)$/);

            if (heading) {
                const level = heading[1].length;
                let id = slugify(heading[2]);
                for (let n = 2; ids.has(id); n += 1) {
                    id = `${slugify(heading[2])}-${n}`;
                }
                ids.add(id);

                if (level === 3) {
                    return `<h3 id="${id}">${renderInline(heading[2])}</h3>`;
                }

                headings.push({ id, text: heading[2] });
                const number = String(headings.length).padStart(2, '0');
                return `<h2 id="${id}"><span class="essay__num">${number}</span> ${renderInline(heading[2])}</h2>`;
            }

            if (image) {
                return `<figure><img src="${image[2]}" alt="${escapeHtml(image[1])}" loading="lazy"></figure>`;
            }

            if (lines.every((line) => /^>\s?/.test(line))) {
                return `<blockquote><p>${renderInline(lines.map((line) => line.replace(/^>\s?/, '')).join('\n'))}</p></blockquote>`;
            }

            if (lines.every((line) => /^[-*]\s+/.test(line))) {
                const list = renderItems(lines, /^[-*]\s+/);
                return `<ul${list.leads ? ' class="leads"' : ''}>${list.html}</ul>`;
            }

            if (lines.every((line) => /^\d+\.\s+/.test(line))) {
                const list = renderItems(lines, /^\d+\.\s+/);
                return `<ol${list.leads ? ' class="leads"' : ''}>${list.html}</ol>`;
            }

            return `<p>${renderInline(block)}</p>`;
        })
        .join('\n');

    return { html, headings };
};

const articleUrl = (article) => `/articles/${article.slug}/`;

// The summary often is the opening sentence; only repeat it under the title when it is not.
const plainText = (markdown) =>
    markdown
        .replace(/[*_`>#]|\[([^\]]+)\]\([^)]+\)/g, '$1')
        .replace(/\p{Extended_Pictographic}/gu, '')
        .replace(/\s+/g, ' ')
        .trim();
const showDek = (article) => article.summary && !plainText(article.body).startsWith(plainText(article.summary).slice(0, 48));

// The list used on the home page and on /articles/: text in the main column, the cover in the margin.
const renderList = (articles, level = 3) => `<ol class="articles" role="list">
${articles
    .map(
        (article) => `                    <li class="entry entry--article">
                        <div class="entry__main">
                            <h${level} class="article__title"><a href="${articleUrl(article)}">${escapeHtml(article.title)}</a></h${level}>
                            <p class="article__summary">${escapeHtml(article.summary)}</p>
                            <p class="when"><time datetime="${article.date}">${formatDate(article.date)}</time> · ${article.minutes} min read</p>
                        </div>
                        ${article.cover ? `<a class="entry__note article__thumb" href="${articleUrl(article)}" tabindex="-1" aria-hidden="true">
                        ${coverPicture(article, { suffix: '-thumb', className: 'article__cover', loading: 'lazy' })}
                        </a>` : ''}
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
                <a href="/articles/" aria-current="page">Articles</a>
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

const page = ({ title, description, path, image, imageSize, type, body, schema }) => `<!DOCTYPE html>
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
    ${imageSize ? `<meta property="og:image:width" content="${imageSize[0]}">\n    <meta property="og:image:height" content="${imageSize[1]}">` : ''}
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
<body class="page--articles">
    ${header}

    <main id="main" tabindex="-1">
${body}
    </main>

    ${footer}

    <script type="module" src="/assets/scripts/main.js"></script>
</body>
</html>
`;

// Closes every article page, on night like the contact section of the home page. Wording from the home page.
const authorBand = `<section class="section--night author" aria-labelledby="author-title">
            <div class="sheet entry">
                <div class="entry__main">
                    <p class="contact__eyebrow">Written by</p>
                    <h2 id="author-title" class="author__name">Mir Ayman Ali</h2>
                    <p class="author__role">Founder &amp; CEO, Shastho Limited</p>
                    <p class="author__lede">
                        Technology is a tool, not an end. I build systems that cut through real complexity – in
                        <a href="/#shastho">healthcare</a>, <a href="/#businessos">business finance</a>, and
                        <a href="/#noyae">interior design</a>.
                    </p>
                    <div class="hero__actions">
                        <a class="button button--light" href="mailto:ayman@shastho.ai">Email</a>
                        <a class="button" href="https://www.linkedin.com/in/alimirayman/">LinkedIn</a>
                        <a class="button" href="/">About me</a>
                    </div>
                </div>
                <figure class="entry__note author__photo">
                    <picture>
                        <source type="image/webp" srcset="/assets/images/portrait/ayman-720.webp">
                        <img src="/assets/images/portrait/ayman-720.jpg" alt="Mir Ayman Ali in a navy three-piece suit" width="720" height="900" loading="lazy" decoding="async">
                    </picture>
                </figure>
            </div>
        </section>`;

// Three more to read: the next older ones, wrapping round to the newest.
const keepReading = (articles, index) =>
    [...articles.slice(index + 1), ...articles.slice(0, index)].slice(0, 3);

const renderArticlePage = (article, more, total) => {
    const image = article.cover ? `${IMAGE_URL}/${article.cover}` : '/assets/images/og-ayman.jpg';
    const { html, headings } = renderMarkdown(article.body);
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: article.title,
        description: article.summary,
        datePublished: article.date,
        author: { '@type': 'Person', '@id': `${SITE}/#person`, name: 'Mir Ayman Ali', url: SITE },
        image: `${SITE}${image}`,
        mainEntityOfPage: `${SITE}${articleUrl(article)}`,
        ...(article.original ? { sameAs: article.original } : {}),
        ...(article.tags.length ? { keywords: article.tags.join(', ') } : {}),
    };

    const tags = article.tags.map((tag) => escapeHtml(tag.replace(/([a-z])([A-Z])/g, '$1 $2'))).join(', ');

    // A contents list in the margin once there are at least two sections to move between.
    const contents = headings.length > 1
        ? `<aside class="entry__note essay__aside">
                    <nav class="contents" aria-labelledby="contents-title">
                        <p id="contents-title" class="contents__title">Contents</p>
                        <ol role="list">
${headings
    .map((heading, i) => `                            <li><a href="#${heading.id}"><span>${String(i + 1).padStart(2, '0')}</span> ${renderInline(heading.text)}</a></li>`)
    .join('\n')}
                        </ol>
                    </nav>
                </aside>`
        : '';

    const body = `        <article class="essay" aria-labelledby="essay-title">
            <header class="essay__masthead">
                <div class="sheet">
                    <p class="essay__kicker"><a href="/articles/">Articles</a><span aria-hidden="true">/</span><time datetime="${article.date}">${formatDate(article.date)}</time></p>
                    <h1 id="essay-title" class="essay__title">${escapeHtml(article.title)}</h1>
                    ${showDek(article) ? `<p class="essay__dek">${escapeHtml(article.summary)}</p>` : ''}
                    <div class="entry essay__byline">
                        <p class="entry__main byline">
                            <picture>
                                <source type="image/webp" srcset="/assets/images/portrait/ayman-avatar.webp">
                                <img class="byline__photo" src="/assets/images/portrait/ayman-avatar.jpg" alt="" width="160" height="160">
                            </picture>
                            <span><span class="byline__name">Mir Ayman Ali</span> <span class="byline__role">Founder &amp; CEO, Shastho Limited</span></span>
                        </p>
                        <p class="entry__note essay__facts">${article.minutes} min read${article.original ? `<br>First published on <a href="${article.original}">LinkedIn</a>` : ''}</p>
                    </div>
                </div>
            </header>

            ${article.cover ? `<div class="essay__coverband">
                <div class="sheet">
                    ${coverPicture(article, { suffix: '', className: 'essay__cover', loading: 'eager' })}
                </div>
            </div>` : ''}

            <div class="sheet entry essay__layout">
                <div class="entry__main">
                    <div class="essay__body">
${html}
                    </div>
                    ${tags ? `<p class="essay__tags"><span>Tags</span> ${tags}</p>` : ''}
                </div>
                ${contents}
            </div>

            <section class="sheet essay__more" aria-labelledby="more-title">
                <header class="section__head">
                    <p class="section__index">Articles</p>
                    <h2 id="more-title" class="section__title">Keep reading</h2>
                </header>
                ${renderList(more)}
                <p class="more-link"><a href="/articles/">All ${total} articles</a></p>
            </section>
        </article>

        ${authorBand}`;

    return page({
        title: `${article.title} | Mir Ayman Ali`,
        description: article.summary || article.title,
        path: articleUrl(article),
        image,
        imageSize: article.cover ? [1280, 720] : [1200, 630],
        type: 'article',
        body,
        schema,
    });
};

const renderIndexPage = (articles) =>
    page({
        title: 'Articles by Mir Ayman Ali',
        description: 'Articles by Mir Ayman Ali on healthcare, technology, work, learning, and communication.',
        path: '/articles/',
        image: '/assets/images/og-ayman.jpg',
        imageSize: [1200, 630],
        type: 'website',
        schema: {
            '@context': 'https://schema.org',
            '@type': 'Blog',
            name: 'Articles by Mir Ayman Ali',
            url: `${SITE}/articles/`,
            author: { '@id': `${SITE}/#person` },
            blogPost: articles.map((article) => ({
                '@type': 'BlogPosting',
                headline: article.title,
                datePublished: article.date,
                url: `${SITE}${articleUrl(article)}`,
            })),
        },
        body: `        <header class="essay__masthead essay__masthead--index">
            <div class="sheet">
                <p class="essay__kicker">${articles.length} articles</p>
                <h1 id="articles-title" class="essay__title">Articles by Mir Ayman Ali</h1>
                <p class="essay__dek">On healthcare, technology, work, learning, and communication</p>
            </div>
        </header>

        <div class="section">
            <div class="sheet">
                ${renderList(articles, 2)}
            </div>
        </div>

        ${authorBand}`,
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
                <p class="more-link"><a href="/articles/">All ${articles.length} articles</a></p>
                ${HOME_END}`;

    writeFileSync(file, html.slice(0, start) + latest + html.slice(end + HOME_END.length));
};

const updateSitemap = (articles) => {
    const today = new Date().toISOString().slice(0, 10);
    const urls = [
        { loc: `${SITE}/`, lastmod: today, priority: '1.0' },
        { loc: `${SITE}/articles/`, lastmod: articles[0] ? articles[0].date : today, priority: '0.8' },
        ...articles.map((article) => ({ loc: `${SITE}${articleUrl(article)}`, lastmod: article.date, priority: '0.7' })),
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

const articles = readdirSync(SOURCE_DIR)
    .filter((file) => file.endsWith('.md'))
    .map(parseArticle)
    .sort((a, b) => b.date.localeCompare(a.date));

// Rebuild the output folder from scratch so deleted or renamed articles do not linger.
rmSync(OUTPUT_DIR, { recursive: true, force: true });
mkdirSync(OUTPUT_DIR, { recursive: true });

articles.forEach((article, index) => {
    const dir = join(OUTPUT_DIR, article.slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, 'index.html'), renderArticlePage(article, keepReading(articles, index), articles.length));
});

writeFileSync(join(OUTPUT_DIR, 'index.html'), renderIndexPage(articles));
updateHome(articles);
updateSitemap(articles);

console.log(`Built ${articles.length} articles: ${articles.map((article) => article.slug).join(', ')}`);
