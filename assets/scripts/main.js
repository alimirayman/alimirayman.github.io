import { enhanceAccessibility } from './modules/accessibility.js?v=e1a8137460';
import { trackContents } from './modules/contents.js?v=474f31db4b';
import { enhanceExternalLinks } from './modules/external-links.js?v=3aec3518b7';
import { revealFigures } from './modules/figure-reveal.js?v=fe29b045fc';
import { foldOnPhones } from './modules/fold.js?v=d71069adb2';
import { setupMenu } from './modules/menu.js?v=576cb1c3bb';
import { setupNavigation } from './modules/navigation.js?v=afbac42210';
import { updateCopyrightYear } from './modules/update-year.js?v=62acfa4df8';

const init = () => {
    updateCopyrightYear();
    setupMenu();
    setupNavigation();
    foldOnPhones();
    enhanceExternalLinks();
    enhanceAccessibility();
    revealFigures();
    trackContents();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
} else {
    init();
}
