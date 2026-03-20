const Theme = {
    KEY: 'pd-theme',

    init() {
        this.apply(localStorage.getItem(this.KEY) || 'light');
        this.bindEvents();
    },

    apply(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(this.KEY, theme);
        this.updateButton(theme);
    },

    toggle() {
        const current = document.documentElement.getAttribute('data-theme') || 'light';
        this.apply(current === 'light' ? 'dark' : 'light');
    },

    updateButton(theme) {
        const btn = document.getElementById('themeBtn');
        if (btn) {
            btn.textContent = theme === 'dark' ? '☀️' : '🌓';
            btn.setAttribute('aria-pressed', theme === 'dark' ? 'true' : 'false');
        }
    },

    bindEvents() {
        const btn = document.getElementById('themeBtn');
        if (btn) {
            btn.addEventListener('click', () => this.toggle());
        }
    }
};

document.addEventListener('DOMContentLoaded', () => Theme.init());
