document.addEventListener('DOMContentLoaded', () => {
    const yearElement = document.getElementById('copyright-year');
    const header = document.querySelector('.top-bar');
    const navLinks = Array.from(document.querySelectorAll('[data-nav]'));

    if (yearElement) {
        yearElement.textContent = String(new Date().getFullYear());
    }

    const scrollToTarget = (target) => {
        if (!target) {
            return;
        }
        const headerHeight = header ? header.offsetHeight + 24 : 96;
        const top = target.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top, behavior: 'smooth' });
    };

    const activateLink = (hash) => {
        navLinks.forEach((link) => {
            link.classList.toggle('is-active', link.getAttribute('href') === hash);
        });
    };

    const sections = navLinks
        .map((link) => {
            const selector = link.getAttribute('href');
            const section = selector ? document.querySelector(selector) : null;
            if (section) {
                link.addEventListener('click', (event) => {
                    event.preventDefault();
                    scrollToTarget(section);
                });
            }
            return section;
        })
        .filter((section) => section);

    if (sections.length) {
        activateLink(`#${sections[0].id}`);
    }

    if ('IntersectionObserver' in window && sections.length) {
        const offset = (header ? header.offsetHeight : 0) + 64;
        const observer = new IntersectionObserver((entries) => {
            const visible = entries
                .filter((entry) => entry.isIntersecting)
                .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
            if (visible.length) {
                activateLink(`#${visible[0].target.id}`);
            }
        }, {
            rootMargin: `-${offset}px 0px -40% 0px`,
            threshold: [0.2, 0.35, 0.6]
        });

        sections.forEach((section) => observer.observe(section));
    }
});
