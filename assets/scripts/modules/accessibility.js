export const enhanceAccessibility = () => {
    document.querySelectorAll('img').forEach((image) => {
        if (!image.hasAttribute('alt')) {
            console.warn('Image missing alt text:', image.src);
            image.setAttribute('alt', '');
        }

        if (!image.hasAttribute('decoding')) {
            image.setAttribute('decoding', 'async');
        }
    });
};
