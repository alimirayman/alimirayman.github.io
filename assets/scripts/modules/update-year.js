export const updateCopyrightYear = () => {
    const yearElement = document.getElementById('copyright-year');

    if (!yearElement) {
        return;
    }

    yearElement.textContent = new Date().getFullYear();
};
