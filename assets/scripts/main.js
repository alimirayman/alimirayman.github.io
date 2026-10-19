import { enhanceAccessibility } from './modules/accessibility.js';
import { enhanceExternalLinks } from './modules/external-links.js';
import { revealFigures } from './modules/figure-reveal.js';
import { setupNavigation } from './modules/navigation.js';
import { updateCopyrightYear } from './modules/update-year.js';

const init = () => {
    updateCopyrightYear();
    setupNavigation();
    enhanceExternalLinks();
    enhanceAccessibility();
    revealFigures();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
    init();
}
