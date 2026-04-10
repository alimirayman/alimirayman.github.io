const isExternalUrl = (href) => /^https?:\/\//i.test(href);

export const enhanceExternalLinks = () => {
    document.querySelectorAll('a[href]').forEach((link) => {
        const href = link.getAttribute('href');

        if (!href || !isExternalUrl(href)) {
            return;
        }

        if (!link.getAttribute('target')) {
            link.setAttribute('target', '_blank');
        }

        const rel = new Set((link.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
        rel.add('noopener');
        rel.add('noreferrer');
        link.setAttribute('rel', Array.from(rel).join(' '));
    });
};
