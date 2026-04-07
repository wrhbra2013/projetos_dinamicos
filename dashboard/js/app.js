console.log('Projetos Dinâmicos - JS Carregado');

let projects = [];
let deleteTarget = null;
let openTarget = null;

const projectTemplates = {
    gestao: {
        id: 'gestao',
        nome: 'Gestão de Projetos',
        desc: 'Sistema completo de gerenciamento visual com mapa interativo, fluxogramas, processos e quadro Kanban.',
        icon: '📊',
        url: 'projeto1/index.html',
        status: 'ativo'
    },
    treinamento: {
        id: 'treinamento',
        nome: 'Plataforma de Treinamento',
        desc: 'Aprenda e pratique programação com exercícios interativos em Python, JavaScript, Java, C++ e Go.',
        icon: '💻',
        url: 'projeto2/index.html',
        status: 'ativo'
    },
    finances: {
        id: 'finances',
        nome: 'Organizador Financeiro',
        desc: 'Controle suas finanças pessoais, metas de economia, receitas e despesas.',
        icon: '💰',
        url: 'projeto3/index.html',
        status: 'ativo'
    }
};

document.addEventListener('DOMContentLoaded', () => {
    loadProjects();
    renderProjectSelect();
    initDefaultProject();
    renderAll();
});

function initDefaultProject() {
    const defaultProjectId = localStorage.getItem('pd_default_project');
    const select = document.getElementById('project-select');
    if (defaultProjectId) {
        select.value = defaultProjectId;
        navigateToDefaultProject(defaultProjectId);
    }
}

function renderProjectSelect() {
    const select = document.getElementById('project-select');
    select.innerHTML = '<option value="">Selecione um projeto padrão</option>' + 
        projects.map(p => `<option value="${p.id}">${p.icon} ${p.nome}</option>`).join('');
}

function setDefaultProject(projectId) {
    if (projectId) {
        localStorage.setItem('pd_default_project', projectId);
        navigateToDefaultProject(projectId);
    } else {
        localStorage.removeItem('pd_default_project');
    }
}

function navigateToDefaultProject(projectId) {
    const project = projects.find(p => p.id == projectId);
    if (project && project.url) {
        window.location.href = project.url;
    }
}

function backToDashboard() {
    localStorage.removeItem('pd_default_project');
    document.getElementById('project-select').value = '';
    switchView('dashboard');
}

function loadProjects() {
    const saved = localStorage.getItem('pd_projects');
    if (saved) {
        projects = JSON.parse(saved);
    } else {
        projects = [
            { id: Date.now() + 1, ...projectTemplates.gestao, created: Date.now() },
            { id: Date.now() + 2, ...projectTemplates.treinamento, created: Date.now() }
        ];
        saveProjects();
    }
}

function saveProjects() {
    localStorage.setItem('pd_projects', JSON.stringify(projects));
}

function renderAll() {
    renderCards();
    renderTable();
    renderDashboard();
    renderStats();
}

function switchView(view) {
    document.querySelectorAll('.nav-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.view === view);
    });
    document.querySelectorAll('.view').forEach(v => {
        v.classList.toggle('active', v.id === 'view-' + view);
    });
}

function showDashboard() {
    switchView('dashboard');
}

function renderDashboard() {
    const container = document.getElementById('dashboard-cards');
    const recentProjects = projects.slice(0, 6);

    container.innerHTML = recentProjects.map(p => `
        <div class="card" onclick="openProjectFullscreen('${p.url}', '${p.nome}')">
            <div class="card-header">
                <span class="card-icon">${p.icon}</span>
                <span class="card-badge ${p.status === 'ativo' ? 'badge-active' : 'badge-inactive'}">${p.status}</span>
            </div>
            <h3>${p.nome}</h3>
            <p>${p.desc}</p>
        </div>
    `).join('') || '<p style="color: var(--text2)">Nenhum projeto</p>';

    updateStats();
}

function renderCards() {
    const container = document.getElementById('cards-grid');
    container.innerHTML = projects.map(p => `
        <div class="card">
            <div class="card-header">
                <span class="card-icon">${p.icon}</span>
                <span class="card-badge ${p.status === 'ativo' ? 'badge-active' : 'badge-inactive'}">${p.status}</span>
            </div>
            <h3>${p.nome}</h3>
            <p>${p.desc}</p>
            <div class="card-actions">
                <button class="btn btn-sm ${p.status === 'ativo' ? 'btn-outline' : 'btn-primary'}" onclick="toggleStatus('${p.id}')">
                    ${p.status === 'ativo' ? 'Desativar' : 'Ativar'}
                </button>
                <button class="btn btn-sm btn-primary" onclick="openProjectFullscreen('${p.url}', '${p.nome}')">🚀 Abrir</button>
                <button class="btn btn-sm btn-danger" onclick="deleteProject('${p.id}')">🗑️</button>
            </div>
        </div>
    `).join('') || '<p style="color: var(--text2)">Nenhum projeto</p>';
}

function renderTable() {
    const tbody = document.getElementById('table-body');
    tbody.innerHTML = projects.map(p => `
        <tr>
            <td><strong>${p.icon} ${p.nome}</strong></td>
            <td style="max-width: 300px; color: var(--text2)">${p.desc}</td>
            <td>${formatDate(p.created)}</td>
            <td>
                <span class="status-badge ${p.status === 'ativo' ? 'badge-active' : 'badge-inactive'}">${p.status}</span>
            </td>
            <td>
                <button class="btn btn-sm btn-primary" onclick="openProjectFullscreen('${p.url}', '${p.nome}')">🚀</button>
                <button class="btn btn-sm btn-danger" onclick="deleteProject('${p.id}')">🗑️</button>
            </td>
        </tr>
    `).join('') || '<tr><td colspan="5" style="text-align: center; color: var(--text2)">Nenhum projeto</td></tr>';
}

function renderStats() {
    const total = projects.length;
    const ativos = projects.filter(p => p.status === 'ativo').length;
    const inativos = projects.filter(p => p.status === 'inativo').length;
    const recent = projects.filter(p => Date.now() - p.created < 30 * 24 * 60 * 60 * 1000).length;

    document.getElementById('estat-total').textContent = total;
    document.getElementById('estat-ativos').textContent = ativos;
    document.getElementById('estat-inativos').textContent = inativos;
    document.getElementById('estat-recentes').textContent = recent;

    const chart = document.getElementById('chart-status');
    const max = Math.max(ativos, inativos, 1);
    chart.innerHTML = `
        <div class="bar-item">
            <div class="bar" style="height: ${(ativos / max) * 120}px; background: var(--success);"></div>
            <span class="bar-label">Ativos (${ativos})</span>
        </div>
        <div class="bar-item">
            <div class="bar" style="height: ${(inativos / max) * 120}px; background: var(--danger);"></div>
            <span class="bar-label">Inativos (${inativos})</span>
        </div>
    `;

    const timeline = document.getElementById('chart-timeline');
    timeline.innerHTML = projects.map(p => `
        <div style="margin-bottom: 16px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                <span>${p.icon} ${p.nome}</span>
                <span style="color: var(--text2); font-size: 12px">${formatDate(p.created)}</span>
            </div>
            <div style="height: 8px; background: var(--bg3); border-radius: 4px;">
                <div style="height: 100%; width: ${p.status === 'ativo' ? '100' : '40'}%; background: ${p.status === 'ativo' ? 'var(--success)' : 'var(--warning)'}; border-radius: 4px;"></div>
            </div>
        </div>
    `).join('') || '<p style="color: var(--text2)">Nenhum projeto</p>';
}

function updateStats() {
    const total = projects.length;
    const ativos = projects.filter(p => p.status === 'ativo').length;
    const inativos = projects.filter(p => p.status === 'inativo').length;

    document.getElementById('stat-projetos').textContent = total;
    document.getElementById('stat-ativos').textContent = ativos;
    document.getElementById('stat-inativos').textContent = inativos;
}

function openModal(type) {
    document.getElementById('modal-' + type).classList.add('active');
}

function closeModal(type) {
    document.getElementById('modal-' + type).classList.remove('active');
}

function createProject(e) {
    e.preventDefault();
    const nome = document.getElementById('proj-nome').value;
    const desc = document.getElementById('proj-desc').value;
    const status = document.getElementById('proj-status').value;

    projects.push({
        id: Date.now(),
        nome,
        desc,
        icon: '📁',
        url: '',
        status,
        created: Date.now()
    });

    saveProjects();
    renderAll();
    closeModal('novo');
    e.target.reset();
}

function deleteProject(id) {
    const p = projects.find(pr => pr.id == id);
    if (p) {
        deleteTarget = id;
        document.getElementById('exclude-name').textContent = p.nome;
        openModal('excluir');
    }
}

function confirmDelete() {
    if (deleteTarget) {
        projects = projects.filter(p => p.id != deleteTarget);
        saveProjects();
        renderAll();
        closeModal('excluir');
        deleteTarget = null;
    }
}

function toggleStatus(id) {
    const p = projects.find(pr => pr.id == id);
    if (p) {
        p.status = p.status === 'ativo' ? 'inativo' : 'ativo';
        saveProjects();
        renderAll();
    }
}

function openProjectConfirm(id) {
    const p = projects.find(pr => pr.id == id);
    if (p && p.url) {
        openTarget = p;
        document.getElementById('abrir-name').textContent = p.nome;
        openModal('abrir');
    } else if (p) {
        alert('Este projeto não tem URL configurada.');
    }
}

function confirmOpen() {
    if (openTarget && openTarget.url) {
        const win = window.open(openTarget.url, '_blank');
        if (win) {
            win.focus();
            win.document.documentElement.requestFullscreen?.();
        }
        closeModal('abrir');
        openTarget = null;
    }
}

function openProjectFullscreen(url, name) {
    const win = window.open(url, '_blank');
    if (win) {
        win.focus();
        setTimeout(() => {
            try {
                win.document.documentElement.requestFullscreen?.();
            } catch(e) {}
        }, 1000);
    }
}

function formatDate(timestamp) {
    return new Date(timestamp).toLocaleDateString('pt-BR');
}

document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', e => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});

function resetProjects() {
    localStorage.removeItem('pd_projects');
    loadProjects();
    renderAll();
    alert('Projetos resetados!');
}