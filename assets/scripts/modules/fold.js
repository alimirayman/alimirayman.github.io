// Phones show each long entry's heading and opening lines first; a button opens the rest in place.
// Only the phone media query hides anything, so wider screens and pages without this script show it all.

const ensureId = (element, id) => {
    if (!element.id) {
        element.id = id;
    }

    return element;
};

const makeToggle = (className, controls) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = className;
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('aria-controls', controls.map((element) => element.id).join(' '));

    return button;
};

const bind = (root, button) => {
    root.classList.add('is-foldable');
    button.addEventListener('click', () => {
        const open = !root.classList.contains('is-open');
        root.classList.toggle('is-open', open);
        button.setAttribute('aria-expanded', String(open));
    });
};

export const foldOnPhones = () => {
    // Ventures: the name and opening paragraph stay; the rest of the story and the details fold.
    document.querySelectorAll('.venture').forEach((venture) => {
        const lede = venture.querySelector('.entry__main > .venture__lede');
        const rest = lede ? Array.from(venture.querySelectorAll('.entry__main > .venture__lede ~ *')) : [];

        if (!rest.length) {
            return;
        }

        const folded = [...rest, venture.querySelector('.spec')]
            .filter(Boolean)
            .map((element, i) => ensureId(element, `${venture.id}-more-${i + 1}`));
        const button = makeToggle('fold__toggle', folded);
        button.textContent = `More about ${venture.querySelector('.venture__name').textContent.trim()}`;
        lede.after(button);
        bind(venture, button);
    });

    // Experience: each role keeps its years, company, and title; the description folds.
    document.querySelectorAll('.role').forEach((role, i) => {
        const title = role.querySelector('.role__title');
        const text = role.querySelector('.entry__main > p:last-child');

        if (!title || !text || text === title) {
            return;
        }

        const button = makeToggle('role__toggle', [ensureId(text, `role-${i + 1}-text`)]);
        const label = document.createElement('span');
        label.className = 'visually-hidden';
        label.textContent = `What I did at ${role.querySelector('.role__org').textContent.trim()}`;
        button.append(label);
        title.after(button);
        bind(role, button);
    });
};
