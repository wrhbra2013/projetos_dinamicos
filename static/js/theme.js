// Theme Toggle - Projetos Dinâmicos
(function() {
    const THEME_KEY = 'pd-theme';
    const DARK_THEME = {
        '--primary': '#0f172a',
        '--secondary': '#1e293b',
        '--accent': '#818cf8',
        '--accent-light': '#6366f1',
        '--accent-hover': '#a5b4fc',
        '--highlight': '#f472b6',
        '--text-primary': '#f1f5f9',
        '--text-secondary': '#94a3b8',
        '--text-muted': '#64748b',
        '--card-bg': '#1e293b',
        '--border': '#334155',
        '--shadow': '0 1px 3px rgba(0, 0, 0, 0.3)',
        '--shadow-md': '0 4px 12px rgba(0, 0, 0, 0.4)',
        '--shadow-lg': '0 10px 25px rgba(0, 0, 0, 0.5)'
    };

    const LIGHT_THEME = {
        '--primary': '#f8fafc',
        '--secondary': '#ffffff',
        '--accent': '#4f46e5',
        '--accent-light': '#818cf8',
        '--accent-hover': '#4338ca',
        '--highlight': '#ec4899',
        '--text-primary': '#1e293b',
        '--text-secondary': '#64748b',
        '--text-muted': '#94a3b8',
        '--card-bg': '#ffffff',
        '--border': '#e2e8f0',
        '--shadow': '0 1px 3px rgba(0, 0, 0, 0.08)',
        '--shadow-md': '0 4px 12px rgba(0, 0, 0, 0.1)',
        '--shadow-lg': '0 10px 25px rgba(0, 0, 0, 0.12)'
    };

    function setTheme(theme) {
        const root = document.documentElement;
        const themeData = theme === 'dark' ? DARK_THEME : LIGHT_THEME;
        
        Object.entries(themeData).forEach(([key, value]) => {
            root.style.setProperty(key, value);
        });
        
        localStorage.setItem(THEME_KEY, theme);
        updateButton(theme);
    }

    function getTheme() {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved) return saved;
        return 'light';
    }

    function updateButton(theme) {
        const btn = document.getElementById('themeBtn');
        if (btn) {
            btn.textContent = theme === 'dark' ? '☀️' : '🌓';
        }
    }

    function toggleTheme() {
        const current = getTheme();
        const newTheme = current === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    }

    document.addEventListener('DOMContentLoaded', function() {
        const btn = document.getElementById('themeBtn');
        if (btn) {
            btn.addEventListener('click', toggleTheme);
        }
        
        // Aplicar tema salvo
        setTheme(getTheme());
    });
})();
