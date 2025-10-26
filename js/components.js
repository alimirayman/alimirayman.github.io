// Simple, Clean Interactions
(function() {
    'use strict';

    // Update copyright year
    const updateCopyrightYear = () => {
        const yearElement = document.getElementById('copyright-year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    };

    // Navigation with smooth scroll
    const handleNavigation = () => {
        const header = document.querySelector('.top-bar');
        const navLinks = Array.from(document.querySelectorAll('[data-nav]'));

        const scrollToTarget = (target) => {
            if (!target) return;
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

        // Intersection Observer for active nav state
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
    };

    // Handle external links
    const handleExternalLinks = () => {
        const links = document.querySelectorAll('a[href^="http"]');
        links.forEach(link => {
            if (!link.getAttribute('target')) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });
    };

    // Basic accessibility
    const enhanceAccessibility = () => {
        // Ensure all images have alt text
        document.querySelectorAll('img:not([alt])').forEach(img => {
            console.warn('Image missing alt text:', img.src);
            img.setAttribute('alt', '');
        });

        // Add contentinfo role to footer
        const footer = document.querySelector('.footer-note');
        if (footer && !footer.getAttribute('role')) {
            footer.setAttribute('role', 'contentinfo');
        }
    };

    // Initialize
    const init = () => {
        updateCopyrightYear();
        handleNavigation();
        handleExternalLinks();
        enhanceAccessibility();
    };

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
