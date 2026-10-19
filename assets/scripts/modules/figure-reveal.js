const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

// Draws each construction figure once, the first time it scrolls into view.
// Without JavaScript or with reduced motion, the finished drawing simply shows.
export const revealFigures = () => {
    const figures = Array.from(document.querySelectorAll('.construction'));

    if (!figures.length || window.matchMedia(REDUCED_MOTION_QUERY).matches || !('IntersectionObserver' in window)) {
        return;
    }

    figures.forEach((figure) => figure.classList.add('is-waiting'));

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                entry.target.classList.replace('is-waiting', 'is-drawing');
                observer.unobserve(entry.target);
            });
        },
        { threshold: 0.4 }
    );

    figures.forEach((figure) => observer.observe(figure));
};
