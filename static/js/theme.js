const Theme = {
    KEY: 'pd-theme',
    themes: ['light', 'dark', 'alto-contraste'],
    currentIndex: 0,

    init() {
        const saved = localStorage.getItem(this.KEY) || 'light';
        this.currentIndex = this.themes.indexOf(saved);
        if (this.currentIndex === -1) this.currentIndex = 0;
        this.apply(this.themes[this.currentIndex]);
        this.bindEvents();
    },

    apply(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(this.KEY, theme);
        this.updateButton(theme);
    },

    toggle() {
        this.currentIndex = (this.currentIndex + 1) % this.themes.length;
        this.apply(this.themes[this.currentIndex]);
    },

    updateButton(theme) {
        const btn = document.getElementById('themeBtn');
        if (btn) {
            btn.setAttribute('aria-pressed', theme === 'dark' || theme === 'alto-contraste' ? 'true' : 'false');
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