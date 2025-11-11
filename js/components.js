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

    // Mobile Menu Toggle
    const handleMobileMenu = () => {
        const menuToggle = document.querySelector('.menu-toggle');
        const nav = document.querySelector('.top-bar__nav');
        const body = document.body;

        if (!menuToggle || !nav) return;

        const toggleMenu = (open) => {
            const isOpen = open !== undefined ? open : !nav.classList.contains('is-open');

            nav.classList.toggle('is-open', isOpen);
            menuToggle.classList.toggle('is-open', isOpen);
            body.classList.toggle('menu-open', isOpen);
            menuToggle.setAttribute('aria-expanded', isOpen);

            // Update button text
            const buttonText = menuToggle.querySelector('.menu-toggle__text');
            if (buttonText) {
                buttonText.textContent = isOpen ? 'Close' : 'Menu';
            }
        };

        // Toggle on button click
        menuToggle.addEventListener('click', () => toggleMenu());

        // Close when clicking navigation links
        const navLinks = nav.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Small delay to allow smooth scroll to start
                setTimeout(() => toggleMenu(false), 100);
            });
        });

        // Close when clicking overlay
        body.addEventListener('click', (e) => {
            if (body.classList.contains('menu-open') &&
                !nav.contains(e.target) &&
                !menuToggle.contains(e.target)) {
                toggleMenu(false);
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && body.classList.contains('menu-open')) {
                toggleMenu(false);
                menuToggle.focus();
            }
        });
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
            const updateObserver = () => {
                const offset = header ? header.offsetHeight + 32 : 80;
                const observer = new IntersectionObserver((entries) => {
                    const visible = entries
                        .filter((entry) => entry.isIntersecting)
                        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
                    if (visible.length) {
                        activateLink(`#${visible[0].target.id}`);
                    }
                }, {
                    rootMargin: `-${offset}px 0px -50% 0px`,
                    threshold: [0, 0.1, 0.25, 0.5]
                });

                sections.forEach((section) => observer.observe(section));
            };

            updateObserver();

            // Recalculate on resize for mobile/desktop transitions
            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(updateObserver, 150);
            });
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
    };

    // Initialize
    const init = () => {
        updateCopyrightYear();
        handleMobileMenu();
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
