let data = {
    projetos: [],
    tarefas: [],
    processos: [],
    mapaNodes: []
};

let mapaZoom = 1;
let draggedTask = null;

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initNavigation();
    initKanban();
    initMapa();
    updateDashboard();
    updateEstatisticas();
    renderFluxograma();
    renderProcessos();
});

function loadData() {
    const saved = localStorage.getItem('gestao_projetos_data');
    if (saved) {
        data = JSON.parse(saved);
    } else {
        data = {
            projetos: [
                { id: 1, nome: 'Sistema Web ERP', desc: 'Sistema de gestão empresarial', inicio: '2024-01-15', fim: '2024-06-30', status: 'execucao' },
                { id: 2, nome: 'App Mobile Delivery', desc: 'Aplicativo de entregas', inicio: '2024-03-01', fim: '2024-08-15', status: 'planejamento' },
                { id: 3, nome: 'Dashboard Analytics', desc: 'Painel de métricas', inicio: '2024-02-01', fim: '2024-04-30', status: 'entrega' }
            ],
            tarefas: [
                { id: 1, titulo: 'Definir requisitos', projeto: 1, status: 'entrega', prioridade: 'alta', desc: 'Levantamento de requisitos com stakeholders' },
                { id: 2, titulo: 'Criar wireframes', projeto: 1, status: 'entrega', prioridade: 'media', desc: 'Design de interfaces' },
                { id: 3, titulo: 'Implementar API', projeto: 1, status: 'execucao', prioridade: 'alta', desc: 'Desenvolvimento do backend' },
                { id: 4, titulo: 'Desenvolver frontend', projeto: 1, status: 'execucao', prioridade: 'alta', desc: 'Interface do usuário' },
                { id: 5, titulo: 'Testes unitários', projeto: 1, status: 'planejamento', prioridade: 'media', desc: 'Automação de testes' },
                { id: 6, titulo: 'Deploy produção', projeto: 1, status: 'planejamento', prioridade: 'alta', desc: 'Publicação do sistema' },
                { id: 7, titulo: 'Pesquisa de mercado', projeto: 2, status: 'execucao', prioridade: 'alta', desc: 'Análise de concorrência' },
                { id: 8, titulo: 'UI/UX Design', projeto: 2, status: 'planejamento', prioridade: 'alta', desc: 'Design do app' }
            ],
            processos: [
                { id: 1, nome: 'Desenvolvimento', tipo: 'desenvolvimento', desc: 'Ciclo de desenvolvimento de software', atividades: ['Análise', 'Design', 'Codificação', 'Testes', 'Deploy'] },
                { id: 2, nome: 'Gestão de Projetos', tipo: 'operacional', desc: 'Processos de planejamento e controle', atividades: ['Planejamento', 'Execução', 'Monitoramento', 'Encerramento'] },
                { id: 3, nome: 'Marketing Digital', tipo: 'marketing', desc: 'Estratégias de marketing online', atividades: ['Pesquisa', 'Estratégia', 'Conteúdo', 'Análise'] }
            ],
            mapaNodes: [
                { id: 1, titulo: 'Início', tipo: 'planejamento', x: 100, y: 200 },
                { id: 2, titulo: 'Planejamento', tipo: 'planejamento', x: 300, y: 200 },
                { id: 3, titulo: 'Análise', tipo: 'planejamento', x: 500, y: 200 },
                { id: 4, titulo: 'Execução', tipo: 'execucao', x: 700, y: 200 },
                { id: 5, titulo: 'Testes', tipo: 'execucao', x: 900, y: 200 },
                { id: 6, titulo: 'Entrega', tipo: 'entrega', x: 1100, y: 200 }
            ]
        };
        saveData();
    }
}

function saveData() {
    localStorage.setItem('gestao_projetos_data', JSON.stringify(data));
}

function initNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const view = btn.dataset.view;
            document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
            document.getElementById(`view-${view}`).classList.add('active');
            
            if (view === 'kanban') updateKanban();
            if (view === 'mapa') renderMapa();
            if (view === 'estatisticas') updateEstatisticas();
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            }
        }
        if (e.key === 'F11') {
            e.preventDefault();
        }
    });
}

function toggleFullscreen() {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        document.exitFullscreen();
    }
}

function updateDashboard() {
    document.getElementById('total-projetos').textContent = data.projetos.length;
    document.getElementById('total-tarefas').textContent = data.tarefas.length;
    document.getElementById('tarefas-concluidas').textContent = data.tarefas.filter(t => t.status === 'entrega').length;
    document.getElementById('em-andamento').textContent = data.tarefas.filter(t => t.status === 'execucao').length;

    const projetosLista = document.getElementById('projetos-lista');
    projetosLista.innerHTML = data.projetos.slice(0, 5).map(p => `
        <div class="projeto-item" onclick="showProjetoDetalhes(${p.id})">
            <h4>${p.nome}</h4>
            <span>${p.status.charAt(0).toUpperCase() + p.status.slice(1)} • ${data.tarefas.filter(t => t.projeto === p.id).length} tarefas</span>
        </div>
    `).join('') || '<p style="color: var(--text-secondary); font-size: 14px;">Nenhum projeto ainda</p>';

    const atividadesLista = document.getElementById('atividades-recentes');
    atividadesLista.innerHTML = data.tarefas.slice(0, 5).map(t => `
        <div class="atividade-item">
            <span>${t.titulo}</span>
            <span class="hora ${t.status}">${t.status === 'entrega' ? '✅' : t.status === 'execucao' ? '🚀' : '📝'}</span>
        </div>
    `).join('') || '<p style="color: var(--text-secondary); font-size: 14px;">Nenhuma atividade</p>';

    const selectProjeto = document.getElementById('tarefa-projeto');
    if (selectProjeto) {
        selectProjeto.innerHTML = data.projetos.map(p => `<option value="${p.id}">${p.nome}</option>`).join('');
    }
}

function showProjetoDetalhes(id) {
    const projeto = data.projetos.find(p => p.id === id);
    if (!projeto) return;
    
    const tarefas = data.tarefas.filter(t => t.projeto === id);
    
    document.getElementById('modal-titulo').textContent = projeto.nome;
    document.getElementById('modal-conteudo').innerHTML = `
        <p style="color: var(--text-secondary); margin-bottom: 16px;">${projeto.desc || 'Sem descrição'}</p>
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px;">
            <div style="background: var(--bg-card); padding: 12px; border-radius: 8px; text-align: center;">
                <div style="font-size: 24px; font-weight: 700;">${tarefas.length}</div>
                <div style="font-size: 12px; color: var(--text-secondary);">Total</div>
            </div>
            <div style="background: var(--bg-card); padding: 12px; border-radius: 8px; text-align: center;">
                <div style="font-size: 24px; font-weight: 700;">${tarefas.filter(t => t.status === 'entrega').length}</div>
                <div style="font-size: 12px; color: var(--text-secondary);">Concluídas</div>
            </div>
            <div style="background: var(--bg-card); padding: 12px; border-radius: 8px; text-align: center;">
                <div style="font-size: 24px; font-weight: 700;">${tarefas.filter(t => t.status !== 'entrega').length}</div>
                <div style="font-size: 12px; color: var(--text-secondary);">Pendentes</div>
            </div>
        </div>
        <h4 style="margin-bottom: 12px; font-size: 14px;">Tarefas</h4>
        ${tarefas.map(t => `
            <div style="padding: 12px; background: var(--bg-card); border-radius: 8px; margin-bottom: 8px;">
                <div style="font-weight: 500;">${t.titulo}</div>
                <div style="font-size: 12px; color: var(--text-secondary);">${t.status}</div>
            </div>
        `).join('')}
    `;
    
    showModal('detalhes');
}

function initKanban() {
    const columns = document.querySelectorAll('.column-tasks');
    columns.forEach(col => {
        col.addEventListener('dragover', e => {
            e.preventDefault();
            col.style.background = 'var(--bg-hover)';
        });
        
        col.addEventListener('dragleave', () => {
            col.style.background = '';
        });
        
        col.addEventListener('drop', e => {
            e.preventDefault();
            col.style.background = '';
            if (draggedTask) {
                const newStatus = col.closest('.kanban-column').dataset.status;
                const tarefa = data.tarefas.find(t => t.id === draggedTask.id);
                if (tarefa) {
                    tarefa.status = newStatus;
                    saveData();
                    updateKanban();
                    updateDashboard();
                }
            }
        });
    });
}

function updateKanban() {
    const statuses = ['planejamento', 'execucao', 'entrega'];
    statuses.forEach(status => {
        const col = document.getElementById(`kanban-${status}`);
        const count = document.getElementById(`count-${status}`);
        const tarefas = data.tarefas.filter(t => t.status === status);
        
        count.textContent = tarefas.length;
        col.innerHTML = tarefas.map(t => `
            <div class="task-card" draggable="true" data-id="${t.id}">
                <h4>${t.titulo}</h4>
                <div class="task-meta">
                    <span class="prioridade ${t.prioridade}">${t.prioridade}</span>
                    <span>${getProjetoNome(t.projeto)}</span>
                </div>
            </div>
        `).join('') || '<p style="color: var(--text-secondary); font-size: 13px; text-align: center; padding: 20px;">Sem tarefas</p>';
        
        col.querySelectorAll('.task-card').forEach(card => {
            card.addEventListener('dragstart', e => {
                draggedTask = { id: parseInt(card.dataset.id) };
                card.classList.add('dragging');
            });
            card.addEventListener('dragend', () => {
                card.classList.remove('dragging');
                draggedTask = null;
            });
        });
    });
}

function getProjetoNome(id) {
    const p = data.projetos.find(proj => proj.id === id);
    return p ? p.nome.substring(0, 15) + '...' : '';
}

function initMapa() {
    const workspace = document.getElementById('mapa-workspace');
    let isDragging = false;
    let startX, startY, scrollLeft, scrollTop;

    workspace.addEventListener('mousedown', e => {
        if (e.target === workspace) {
            isDragging = true;
            startX = e.pageX - workspace.offsetLeft;
            startY = e.pageY - workspace.offsetTop;
            scrollLeft = workspace.scrollLeft;
            scrollTop = workspace.scrollTop;
        }
    });

    workspace.addEventListener('mousemove', e => {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - workspace.offsetLeft;
        const y = e.pageY - workspace.offsetTop;
        workspace.scrollLeft = scrollLeft - (x - startX);
        workspace.scrollTop = scrollTop - (y - startY);
    });

    workspace.addEventListener('mouseup', () => isDragging = false);
    workspace.addEventListener('mouseleave', () => isDragging = false);
}

function zoomMapa(direction) {
    if (direction === 'in') {
        mapaZoom = Math.min(mapaZoom + 0.1, 2);
    } else {
        mapaZoom = Math.max(mapaZoom - 0.1, 0.5);
    }
    document.getElementById('mapa-workspace').style.transform = `scale(${mapaZoom})`;
}

function renderMapa() {
    const workspace = document.getElementById('mapa-workspace');
    workspace.innerHTML = data.mapaNodes.map(node => `
        <div class="mapa-node ${node.tipo}" 
             style="left: ${node.x}px; top: ${node.y}px;"
             draggable="true"
             data-id="${node.id}">
            <h4>${node.titulo}</h4>
            <span>${node.tipo}</span>
        </div>
    `).join('');

    workspace.querySelectorAll('.mapa-node').forEach(node => {
        let isDragging = false;
        let startX, startY, nodeX, nodeY;

        node.addEventListener('mousedown', e => {
            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;
            nodeX = parseInt(node.style.left);
            nodeY = parseInt(node.style.top);
            e.stopPropagation();
        });

        document.addEventListener('mousemove', e => {
            if (!isDragging) return;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            node.style.left = (nodeX + dx) + 'px';
            node.style.top = (nodeY + dy) + 'px';
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                const id = parseInt(node.dataset.id);
                const n = data.mapaNodes.find(m => m.id === id);
                if (n) {
                    n.x = parseInt(node.style.left);
                    n.y = parseInt(node.style.top);
                    saveData();
                }
            }
            isDragging = false;
        });
    });

    for (let i = 0; i < data.mapaNodes.length - 1; i++) {
        const from = data.mapaNodes[i];
        const to = data.mapaNodes[i + 1];
        
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.style.position = 'absolute';
        svg.style.left = '0';
        svg.style.top = '0';
        svg.style.width = '100%';
        svg.style.height = '100%';
        svg.style.pointerEvents = 'none';
        svg.style.zIndex = '0';
        
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', from.x + 75);
        line.setAttribute('y1', from.y + 30);
        line.setAttribute('x2', to.x + 75);
        line.setAttribute('y2', to.y + 30);
        line.setAttribute('stroke', 'var(--accent)');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('stroke-dasharray', '5,5');
        
        svg.appendChild(line);
        workspace.appendChild(svg);
    }
}

function renderFluxograma() {
    const container = document.getElementById('fluxograma-container');
    const fluxo = [
        { texto: 'Início', tipo: 'start' },
        { texto: 'Planejamento', tipo: 'process' },
        { texto: 'Análise de Requisitos', tipo: 'process' },
        { texto: 'Design', tipo: 'process' },
        { texto: 'Aprovado?', tipo: 'decision' },
        { texto: 'Implementação', tipo: 'process' },
        { texto: 'Testes', tipo: 'process' },
        { texto: 'Correções', tipo: 'process' },
        { texto: 'Deploy', tipo: 'process' },
        { texto: 'Fim', tipo: 'end' }
    ];

    container.innerHTML = fluxo.map((item, i) => `
        <div class="fluxo-etapa">
            <div class="fluxo-box ${item.tipo}">${item.texto}</div>
            ${i < fluxo.length - 1 ? (item.tipo === 'decision' ? '<span class="fluxo-arrow">→ Não</span>' : '<span class="fluxo-arrow">↓</span>') : ''}
        </div>
        ${item.tipo === 'decision' ? '<div class="fluxo-etapa"><span class="fluxo-arrow">→ Sim</span></div>' : ''}
    `).join('');
}

function renderProcessos() {
    const grid = document.getElementById('processos-grid');
    const icons = { desenvolvimento: '💻', design: '🎨', marketing: '📢', operacional: '⚙️' };
    
    grid.innerHTML = data.processos.map(p => `
        <div class="processo-card">
            <h3>${icons[p.tipo] || '📋'} ${p.nome}</h3>
            <p>${p.desc}</p>
            <div class="processo-atividades">
                ${p.atividades.map((a, i) => `
                    <div class="atividade-row ${i < 2 ? 'done' : ''}">
                        <span class="check"></span>
                        <span>${a}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

function updateEstatisticas() {
    const statusChart = document.getElementById('chart-status');
    const planej = data.tarefas.filter(t => t.status === 'planejamento').length;
    const exec = data.tarefas.filter(t => t.status === 'execucao').length;
    const entr = data.tarefas.filter(t => t.status === 'entrega').length;
    const total = data.tarefas.length || 1;

    statusChart.innerHTML = `
        <div style="display: flex; gap: 24px; justify-content: center; height: 150px; align-items: flex-end;">
            <div style="text-align: center;">
                <div style="height: ${(planej/total)*120}px; width: 60px; background: var(--planejamento); border-radius: 8px 8px 0 0; margin-bottom: 8px;"></div>
                <span style="font-size: 12px;">${planej}</span>
                <div style="font-size: 11px; color: var(--text-secondary);">Planejamento</div>
            </div>
            <div style="text-align: center;">
                <div style="height: ${(exec/total)*120}px; width: 60px; background: var(--execucao); border-radius: 8px 8px 0 0; margin-bottom: 8px;"></div>
                <span style="font-size: 12px;">${exec}</span>
                <div style="font-size: 11px; color: var(--text-secondary);">Execução</div>
            </div>
            <div style="text-align: center;">
                <div style="height: ${(entr/total)*120}px; width: 60px; background: var(--entrega); border-radius: 8px 8px 0 0; margin-bottom: 8px;"></div>
                <span style="font-size: 12px;">${entr}</span>
                <div style="font-size: 11px; color: var(--text-secondary);">Entrega</div>
            </div>
        </div>
    `;

    const prodChart = document.getElementById('chart-produtividade');
    prodChart.innerHTML = `
        <div style="display: flex; justify-content: center; align-items: center; height: 150px;">
            <div style="position: relative; width: 120px; height: 120px;">
                <svg viewBox="0 0 100 100" style="transform: rotate(-90deg);">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--border)" stroke-width="10"/>
                    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--success)" stroke-width="10"
                            stroke-dasharray="${(entr/total)*251} 251" stroke-linecap="round"/>
                </svg>
                <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); text-align: center;">
                    <div style="font-size: 24px; font-weight: 700;">${Math.round((entr/total)*100)}%</div>
                    <div style="font-size: 10px; color: var(--text-secondary);">Completo</div>
                </div>
            </div>
        </div>
    `;

    const timeline = document.getElementById('chart-timeline');
    timeline.innerHTML = data.projetos.map(p => {
        const progress = p.status === 'entrega' ? 100 : p.status === 'execucao' ? 50 : 20;
        return `
            <div style="margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 6px;">
                    <span style="font-size: 13px;">${p.nome}</span>
                    <span style="font-size: 12px; color: var(--text-secondary);">${p.status}</span>
                </div>
                <div style="height: 8px; background: var(--border); border-radius: 4px; overflow: hidden;">
                    <div style="height: 100%; width: ${progress}%; background: ${p.status === 'entrega' ? 'var(--success)' : p.status === 'execucao' ? 'var(--warning)' : 'var(--planejamento)'}; border-radius: 4px;"></div>
                </div>
            </div>
        `;
    }).join('') || '<p style="color: var(--text-secondary); text-align: center;">Nenhum projeto</p>';
}

function showModal(id) {
    document.getElementById(`modal-${id}`).classList.add('active');
}

function closeModal(id) {
    document.getElementById(`modal-${id}`).classList.remove('active');
}

function createProject(e) {
    e.preventDefault();
    const nome = document.getElementById('projeto-nome').value;
    const desc = document.getElementById('projeto-desc').value;
    const inicio = document.getElementById('projeto-inicio').value;
    const fim = document.getElementById('projeto-fim').value;

    data.projetos.push({
        id: Date.now(),
        nome,
        desc,
        inicio,
        fim,
        status: 'planejamento'
    });

    saveData();
    updateDashboard();
    closeModal('novo-projeto');
    showToast('Projeto criado com sucesso!');
    e.target.reset();
}

function createTarefa(e) {
    e.preventDefault();
    const titulo = document.getElementById('tarefa-titulo').value;
    const projeto = parseInt(document.getElementById('tarefa-projeto').value);
    const status = document.getElementById('tarefa-status').value;
    const prioridade = document.getElementById('tarefa-prioridade').value;
    const desc = document.getElementById('tarefa-desc').value;

    data.tarefas.push({
        id: Date.now(),
        titulo,
        projeto,
        status,
        prioridade,
        desc
    });

    saveData();
    updateKanban();
    updateDashboard();
    closeModal('nova-tarefa');
    showToast('Tarefa criada com sucesso!');
    e.target.reset();
}

function createProcesso(e) {
    e.preventDefault();
    const nome = document.getElementById('processo-nome').value;
    const tipo = document.getElementById('processo-tipo').value;
    const desc = document.getElementById('processo-desc').value;

    data.processos.push({
        id: Date.now(),
        nome,
        tipo,
        desc,
        atividades: ['Análise', 'Planejamento', 'Execução', 'Revisão']
    });

    saveData();
    renderProcessos();
    closeModal('novo-processo');
    showToast('Processo criado com sucesso!');
    e.target.reset();
}

function showToast(msg) {
    const toast = document.getElementById('toast');
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
}

document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', e => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});
