const HEADER_HTML = `<header class="header">
    <div class="header-container">
        <div class="header-left">
            <div class="logo-area">
                <h1 class="logo">Projetos Dinâmicos</h1>
                <span class="logo-tagline">Gestão de Projetos</span>
            </div>
        </div>
        
        <div class="header-center">
            <nav class="nav-menu" id="navMenu">
                <div class="nav-scroll">
                    <label for="page-dashboard" class="nav-link">Dashboard</label>
                    <label for="page-projeto" class="nav-link">Projetos</label>
                    <label for="page-kanban" class="nav-link">Kanban</label>
                    <label for="page-mapa" class="nav-link">Mapa Visual</label>
                    <label for="page-timeline" class="nav-link">Timeline</label>
                    <label for="page-insights" class="nav-link" onclick="Insights.init()">Insights</label>
                    <label for="page-relatorio" class="nav-link">Relatórios</label>
                    <label for="page-downloads" class="nav-link">Downloads</label>
                    <label for="page-planos" class="nav-link">Planos</label>
                    <label for="page-wizard" class="nav-link" onclick="Wizard.init()">Novo Projeto</label>
                    <button class="nav-link nav-icon" onclick="ProjectDashboard.init()" title="Gerenciamento do Projeto">GP</button>
                </div>
            </nav>
        </div>
        
        <div class="header-right">
            <button class="menu-dots-btn" id="menuDotsBtn" onclick="toggleMenuDropdown()" aria-label="Menu">
                <span class="dots-icon">
                    <span></span>
                    <span></span>
                    <span></span>
                </span>
            </button>
            
            <div class="menu-dropdown" id="menuDropdown">
                <a href="https://wa.me/5514981305888?text=Olá, preciso de suporte no Projetos Dinamicos." target="_blank" class="dropdown-item">
                    Suporte
                </a>
                <button class="dropdown-item" onclick="document.getElementById('importFile').click()">
                    Importar
                </button>
                <button class="dropdown-item" onclick="exportData()">
                    Exportar
                </button>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item" onclick="toggleTheme()">
                    Tema
                </button>
                <button class="dropdown-item" onclick="showAbout()">
                    Sobre
                </button>
                <div class="dropdown-divider"></div>
                <button class="dropdown-item" onclick="clearAllData()">
                    Limpar Dados
                </button>
            </div>
            
            <button class="theme-btn" onclick="toggleTheme()" title="Alternar tema"></button>
            <input type="file" id="importFile" accept=".json" style="display:none">
        </div>
    </div>
</header>

<style>
.header-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
    width: 100%;
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 16px;
}

.header-left { flex-shrink: 0; }

.logo-area {
    display: flex;
    flex-direction: column;
    line-height: 1.2;
}

.logo {
    font-size: 1.25rem;
    font-weight: 700;
    color: var(--accent);
    letter-spacing: -0.5px;
    margin: 0;
}

.logo-tagline {
    font-size: 0.7rem;
    color: var(--text-muted);
    text-transform: uppercase;
    letter-spacing: 1px;
}

.header-center { flex: 1; min-width: 0; }

.header-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.nav-menu {
    overflow-x: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--accent-light) transparent;
}

.nav-menu::-webkit-scrollbar { height: 4px; }
.nav-menu::-webkit-scrollbar-track { background: transparent; }
.nav-menu::-webkit-scrollbar-thumb { background: var(--accent-light); border-radius: 2px; }

.nav-scroll {
    display: flex;
    gap: 4px;
    padding: 4px 0;
}

.nav-link {
    color: var(--text-secondary);
    text-decoration: none;
    font-weight: 500;
    font-size: 0.85rem;
    padding: 8px 12px;
    border-radius: 8px;
    transition: all 0.2s ease;
    cursor: pointer;
    border: none;
    background: none;
    white-space: nowrap;
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.nav-link:hover, .nav-link.active {
    color: var(--accent);
    background-color: rgba(79, 70, 229, 0.1);
}

.nav-icon { font-size: 1rem; }

.menu-dots-btn {
    display: none;
    background: none;
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 8px 10px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.menu-dots-btn:hover {
    background: var(--accent);
    border-color: var(--accent);
}

.dots-icon {
    display: flex;
    flex-direction: column;
    gap: 3px;
    width: 18px;
}

.dots-icon span {
    display: block;
    width: 100%;
    height: 2px;
    background: var(--text-secondary);
    border-radius: 1px;
    transition: all 0.2s ease;
}

.menu-dots-btn:hover .dots-icon span { background: white; }

.menu-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background: var(--secondary);
    border: 1px solid var(--border);
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
    min-width: 200px;
    padding: 8px;
    z-index: 1000;
    display: none;
    animation: slideDown 0.2s ease;
}

.menu-dropdown.active { display: block; }

@keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}

.dropdown-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    color: var(--text-primary);
    text-decoration: none;
    font-size: 0.9rem;
    border-radius: 8px;
    cursor: pointer;
    border: none;
    background: none;
    width: 100%;
    text-align: left;
    transition: all 0.15s ease;
}

.dropdown-item:hover {
    background: var(--accent-light);
    color: var(--accent);
}

.dropdown-icon { font-size: 1.1rem; width: 24px; text-align: center; }
.dropdown-divider { height: 1px; background: var(--border); margin: 8px 0; }

@media (max-width: 1024px) {
    .header-container { flex-wrap: wrap; }
    .nav-menu { order: 3; width: 100%; margin-top: 8px; }
    .nav-scroll { justify-content: flex-start; }
}

@media (max-width: 768px) {
    .menu-dots-btn { display: block; }
    .nav-menu { display: none; }
    .nav-menu.mobile-open { display: block; order: 2; width: 100%; margin-top: 12px; }
    .nav-scroll { flex-direction: column; gap: 4px; }
    .nav-link { width: 100%; justify-content: flex-start; padding: 12px 16px; }
    .header-container { padding: 0 12px; }
}
</style>

<script>
function toggleMenuDropdown() {
    const dropdown = document.getElementById('menuDropdown');
    dropdown.classList.toggle('active');
}

document.addEventListener('click', function(e) {
    const btn = document.getElementById('menuDotsBtn');
    const dropdown = document.getElementById('menuDropdown');
    if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});

function toggleTheme() {
    const body = document.body;
    const current = body.getAttribute('data-theme') || 'light';
    const next = current === 'light' ? 'dark' : 'light';
    body.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
}

function showAbout() {
    alert('Projetos Dinâmicos v2.0\\nGerencie seus projetos com eficiência!');
}

function clearAllData() {
    if (confirm('Tem certeza que deseja limpar todos os dados? Esta ação não pode ser desfeita.')) {
        localStorage.clear();
        location.reload();
    }
}

document.getElementById('importFile').addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;
    try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.projetos) localStorage.setItem('pd_projetos', JSON.stringify(data.projetos));
        if (data.atividades) localStorage.setItem('pd_atividades', JSON.stringify(data.atividades));
        alert('Dados importados com sucesso!');
        location.reload();
    } catch (err) {
        alert('Erro ao importar: ' + err.message);
    }
});

function exportData() {
    const projetos = JSON.parse(localStorage.getItem('pd_projetos') || '[]');
    const atividades = JSON.parse(localStorage.getItem('pd_atividades') || '[]');
    const data = { projetos, atividades, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'projetos-dinamicos-' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
}

const savedTheme = localStorage.getItem('theme') || 'light';
document.body.setAttribute('data-theme', savedTheme);
</script>`;

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