const HEADER_HTML = `<header class="header">
    <div class="container">
        <h1 class="logo">Projetos Dinâmicos</h1>
        <nav class="nav">
            <label for="page-dashboard" class="nav-link">Dashboard</label>
            <label for="page-mapa" class="nav-link">Mapa Visual</label>
            <label for="page-relatorio" class="nav-link">Relatórios</label>
            <a href="https://wa.me/5514981305888?text=Olá, preciso de suporte." target="_blank" class="nav-link" title="Suporte">Suporte</a>
            <button id="themeBtn" class="theme-btn" aria-label="Alternar tema" aria-pressed="false">🌓</button>
        </nav>
    </div>
</header>`;

const FOOTER_HTML = `<footer class="footer">
    <div class="container">
        <p style="font-size: 12px; color: var(--text-muted);">&copy; ${new Date().getFullYear()} Projetos Dinâmicos - Sistema de Gestão de Projetos. Todos os direitos reservados.</p>
    </div>
</footer>`;

function loadComponents() {
    document.getElementById('header-placeholder').innerHTML = HEADER_HTML;
    document.getElementById('footer-placeholder').innerHTML = FOOTER_HTML;
    document.dispatchEvent(new Event('componentsLoaded'));
}

loadComponents();

loadComponents();

// Configurar tema
const themeBtn = document.getElementById('themeBtn');
if (themeBtn) {
    const savedTheme = localStorage.getItem('theme');
    console.log('Tema salvo:', savedTheme);
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeBtn.innerHTML = '☀️';
        themeBtn.setAttribute('aria-pressed', 'true');
        console.log('Tema escuro aplicado');
    }
    
    themeBtn.onclick = function() {
        const isDark = document.body.classList.toggle('dark-theme');
        themeBtn.innerHTML = isDark ? '☀️' : '🌓';
        themeBtn.setAttribute('aria-pressed', isDark ? 'true' : 'false');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        console.log('Tema alternado:', isDark ? 'escuro' : 'claro');
    };
} else {
    console.log('Botão de tema não encontrado!');
}
