// Marks the section being read in an article's contents list: the last heading that has
// scrolled above a line a third of the way down the window. Nothing is marked above the first one.
export const trackContents = () => {
    const links = Array.from(document.querySelectorAll('.contents a[href^="#"]'));
    const headings = links.map((link) => document.getElementById(decodeURIComponent(link.hash.slice(1))));

    if (!links.length || headings.some((heading) => !heading)) {
        return;
    }

    let current = -1;
    let queued = false;

    const update = () => {
        queued = false;
        const line = window.innerHeight / 3;
        const index = headings.reduce((found, heading, i) => (heading.getBoundingClientRect().top <= line ? i : found), -1);

        if (index === current) {
            return;
        }

        current = index;
        links.forEach((link, i) => {
            if (i === index) {
                link.setAttribute('aria-current', 'true');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };

    const queue = () => {
        if (!queued) {
            queued = true;
            window.requestAnimationFrame(update);
        }
    };

    window.addEventListener('scroll', queue, { passive: true });
    window.addEventListener('resize', queue, { passive: true });
    update();
};
