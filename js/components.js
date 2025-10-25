const MAX_FEED_LINES = 6;

document.addEventListener('DOMContentLoaded', () => {
    const feed = document.querySelector('#terminal-feed');
    const buttons = Array.from(document.querySelectorAll('[data-command-target]'));
    const sections = Array.from(document.querySelectorAll('[data-section]'));
    const clockElement = document.getElementById('system-clock');
    const yearElement = document.getElementById('copyright-year');
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (yearElement) {
        yearElement.textContent = String(new Date().getFullYear());
    }

    if (clockElement) {
        const updateClock = () => {
            const now = new Date();
            const formatter = new Intl.DateTimeFormat('en-GB', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZone: 'Asia/Dhaka'
            });
            clockElement.textContent = formatter.format(now) + ' BD';
        };
        updateClock();
        setInterval(updateClock, 1000);
    }

    const logCommand = (command, highlight = false) => {
        if (!feed) {
            return;
        }
        const line = document.createElement('div');
        line.className = 'terminal-line';
        if (highlight) {
            line.classList.add('is-highlight');
        }
        line.innerHTML = `
            <span class="prompt">mirayman@shastho:~$</span>
            <span class="cmd">${command}</span>
        `;
        feed.appendChild(line);
        while (feed.children.length > MAX_FEED_LINES) {
            feed.removeChild(feed.firstElementChild);
        }
        feed.scrollTop = feed.scrollHeight;
    };

    const focusSection = (target) => {
        const element = document.querySelector(target);
        if (!element) {
            return;
        }
        element.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
    };

    buttons.forEach((button) => {
        button.addEventListener('click', () => {
            const command = button.dataset.command || 'run';
            const target = button.dataset.commandTarget;
            logCommand(command, true);
            if (target) {
                focusSection(target);
            }
        });
    });

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const id = `#${entry.target.id}`;
                    buttons.forEach((btn) => {
                        btn.classList.toggle('is-active', btn.dataset.commandTarget === id);
                    });
                }
            });
        }, {
            threshold: 0.4
        });

        sections.forEach((section) => observer.observe(section));
    }

    if (!prefersReducedMotion) {
        setTimeout(() => {
            logCommand('cat summary.txt');
        }, 600);
    }
});
