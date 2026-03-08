const HEADER_HTML = `<header class="header">
    <div class="container">
        <h1 class="logo">Projetos Dinâmicos</h1>
        <nav class="nav">
            <label for="page-dashboard" class="nav-link">Dashboard</label>
            <label for="page-mapa" class="nav-link">Mapa Visual</label>
            <label for="page-comentarios" class="nav-link">Feedbacks</label>
            <label for="page-relatorio" class="nav-link">Relatórios</label>
            <a href="https://wa.me/5514981305888?text=Olá, preciso de suporte." target="_blank" class="nav-link" title="Suporte">Suporte</a>
          <!--  <label for="page-planos" class="nav-link" title="Planos Premium">Planos</label> -->
            <button id="themeBtn" class="theme-btn" title="Alternar tema">🌓</button>
        </nav>
    </div>
</header>`;

const FOOTER_HTML = `<footer class="footer">
    <div class="container">
        <p>Projetos Dinâmicos - Sistema de Gestão de Projetos</p>
    </div>
</footer>`;

function loadComponents() {
    document.getElementById('header-placeholder').innerHTML = HEADER_HTML;
    document.getElementById('footer-placeholder').innerHTML = FOOTER_HTML;
    document.dispatchEvent(new Event('componentsLoaded'));
}

loadComponents();
