const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
const SECTION_GAP = 24;

const getScrollBehavior = () => {
    if (window.matchMedia(REDUCED_MOTION_QUERY).matches) {
        return 'auto';
    }

    return 'smooth';
};

export const setupNavigation = () => {
    const header = document.querySelector('.top-bar');
    const navLinks = Array.from(document.querySelectorAll('[data-nav]'));

    if (!navLinks.length) {
        return;
    }

    const linksByHash = new Map(
        navLinks
            .map((link) => [link.getAttribute('href'), link])
            .filter(([hash]) => hash && document.querySelector(hash))
    );

    if (!linksByHash.size) {
        return;
    }

    // Every top-level section is observed, so sections without a nav link (like the stack) clear the active state.
    const sections = Array.from(document.querySelectorAll('main > section[id]'));

    // The header only takes up space while it is sticky (wide screens).
    const getHeaderOffset = () => {
        const isSticky = header && window.getComputedStyle(header).position === 'sticky';

        return isSticky ? header.offsetHeight + SECTION_GAP : SECTION_GAP;
    };

    const setActiveLink = (activeHash) => {
        linksByHash.forEach((link, hash) => {
            const isActive = hash === activeHash;
            link.classList.toggle('is-active', isActive);

            if (isActive) {
                link.setAttribute('aria-current', 'true');
            } else {
                link.removeAttribute('aria-current');
            }
        });
    };

    const scrollToSection = (section, hash) => {
        const top = section.getBoundingClientRect().top + window.scrollY - getHeaderOffset();

        window.scrollTo({
            top,
            behavior: getScrollBehavior(),
        });

        if (window.history?.replaceState) {
            window.history.replaceState(null, '', hash);
            return;
        }

        window.location.hash = hash;
    };

    const clickHandlers = Array.from(linksByHash).map(([hash, link]) => {
        const handleClick = (event) => {
            event.preventDefault();
            setActiveLink(hash);
            scrollToSection(document.querySelector(hash), hash);
        };

        link.addEventListener('click', handleClick);
        return { handleClick, link };
    });

    // Nothing is active at the top of the page unless the URL points at a section.
    setActiveLink(linksByHash.has(window.location.hash) ? window.location.hash : null);

    if (!('IntersectionObserver' in window)) {
        return;
    }

    let observer;
    const inBand = new Set();

    const createObserver = () => {
        if (observer) {
            observer.disconnect();
        }

        inBand.clear();

        // A band near the top of the viewport. The lowest section inside it is the current one.
        observer = new IntersectionObserver(
            (intersectionEntries) => {
                intersectionEntries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        inBand.add(entry.target);
                    } else {
                        inBand.delete(entry.target);
                    }
                });

                const current = sections.filter((section) => inBand.has(section)).pop();

                if (!current) {
                    return;
                }

                setActiveLink(linksByHash.has(`#${current.id}`) ? `#${current.id}` : null);
            },
            {
                rootMargin: `-${getHeaderOffset()}px 0px -60% 0px`,
                threshold: 0,
            }
        );

        sections.forEach((section) => observer.observe(section));
    };

    createObserver();

    let resizeTimer;
    const handleResize = () => {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(createObserver, 150);
    };

    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
        if (observer) {
            observer.disconnect();
        }

        window.removeEventListener('resize', handleResize);
        clickHandlers.forEach(({ handleClick, link }) => link.removeEventListener('click', handleClick));
    };
};
