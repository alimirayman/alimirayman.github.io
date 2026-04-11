const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

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

    const entries = navLinks
        .map((link) => {
            const hash = link.getAttribute('href');
            const section = hash ? document.querySelector(hash) : null;

            return section ? { hash, link, section } : null;
        })
        .filter(Boolean);

    if (!entries.length) {
        return;
    }

    const getHeaderOffset = () => {
        return header ? header.offsetHeight + 24 : 96;
    };

    const setActiveLink = (activeHash) => {
        entries.forEach(({ hash, link }) => {
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

    const clickHandlers = entries.map(({ hash, link, section }) => {
        const handleClick = (event) => {
            event.preventDefault();
            setActiveLink(hash);
            scrollToSection(section, hash);
        };

        link.addEventListener('click', handleClick);
        return { handleClick, link };
    });

    const knownHashes = new Set(entries.map(({ hash }) => hash));
    const defaultHash = entries[0].hash;
    setActiveLink(knownHashes.has(window.location.hash) ? window.location.hash : defaultHash);

    if (!('IntersectionObserver' in window)) {
        return;
    }

    let observer;

    const createObserver = () => {
        if (observer) {
            observer.disconnect();
        }

        observer = new IntersectionObserver(
            (intersectionEntries) => {
                const visibleSections = intersectionEntries
                    .filter((entry) => entry.isIntersecting)
                    .sort((entryA, entryB) => entryB.intersectionRatio - entryA.intersectionRatio);

                if (!visibleSections.length) {
                    return;
                }

                setActiveLink(`#${visibleSections[0].target.id}`);
            },
            {
                rootMargin: `-${getHeaderOffset()}px 0px -45% 0px`,
                threshold: [0.15, 0.35, 0.55],
            }
        );

        entries.forEach(({ section }) => observer.observe(section));
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
