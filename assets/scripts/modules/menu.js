const WIDE_QUERY = '(min-width: 641px)';

// Phones: the section links fold into a Menu button and open in a panel over the page.
// Without this script the header keeps its swipeable row of links.
export const setupMenu = () => {
    const bar = document.querySelector('.top-bar');
    const button = bar?.querySelector('.top-bar__menu');
    const nav = bar?.querySelector('.top-bar__nav');

    if (!button || !nav) {
        return;
    }

    document.documentElement.classList.add('has-menu');

    const isOpen = () => bar.classList.contains('is-open');

    const setOpen = (open) => {
        bar.classList.toggle('is-open', open);
        button.setAttribute('aria-expanded', String(open));
    };

    button.addEventListener('click', () => setOpen(!isOpen()));

    // A link was chosen, or the empty part of the panel was tapped.
    nav.addEventListener('click', (event) => {
        if (event.target === nav || event.target.closest('a')) {
            setOpen(false);
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && isOpen()) {
            setOpen(false);
            button.focus();
        }
    });

    // Tabbing out of the header closes the panel, so focus never lands behind it.
    bar.addEventListener('focusout', (event) => {
        if (isOpen() && event.relatedTarget && !bar.contains(event.relatedTarget)) {
            setOpen(false);
        }
    });

    window.matchMedia(WIDE_QUERY).addEventListener('change', (event) => {
        if (event.matches) {
            setOpen(false);
        }
    });
};
