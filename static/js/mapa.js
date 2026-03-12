const Mapa = {
    STORAGE_KEY: 'projetos_dinamicos_db',
    projetoAtual: null,
    atividadeAtual: null,

    init() {
        this.initData();
        this.setupTheme();
        this.setupModal();
        this.setupEventListeners();
        this.render();
    },

    initData() {
        const stored = localStorage.getItem(this.STORAGE_KEY);
        if (!stored) {
            const initialData = {
                projetos: [],
                atividades: [],
                next_projeto_id: 1,
                next_atividade_id: 1
            };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(initialData));
        }
    },

    getData() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY));
    },

    saveData(data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
        this.render();
    },

    setupTheme() {
        const themeBtn = document.getElementById('themeBtn');
        if (themeBtn) {
            const savedTheme = localStorage.getItem('theme');
            if (savedTheme === 'dark') {
                document.body.classList.remove('light-theme');
                themeBtn.innerHTML = '🌓';
            } else {
                document.body.classList.add('light-theme');
                themeBtn.innerHTML = '🌙';
            }
            themeBtn.addEventListener('click', () => {
                document.body.classList.toggle('light-theme');
                const isLight = document.body.classList.contains('light-theme');
                themeBtn.innerHTML = isLight ? '🌙' : '🌓';
                localStorage.setItem('theme', isLight ? 'light' : 'dark');
            });
        }
    },

    setupModal() {
        const modal = document.getElementById('projetoModal');
        const closeBtn = document.querySelector('#projetoModal .close-btn');
        const openBtn = document.getElementById('openModalBtn');

        if (modal && closeBtn) {
            closeBtn.onclick = () => modal.classList.remove('active');
            window.onclick = (e) => {
                if (e.target == modal) modal.classList.remove('active');
            };
        }
        if (openBtn) openBtn.onclick = () => modal.classList.add('active');

        const form = document.getElementById('formNovoProjeto');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.criarProjeto();
            });
        }

        const formAtividade = document.getElementById('formAtividade');
        if (formAtividade) {
            formAtividade.addEventListener('submit', (e) => {
                e.preventDefault();
                this.salvarAtividade();
            });
        }
    },

    setupEventListeners() {
        const selector = document.getElementById('projetoSelector');
        if (selector) {
            selector.addEventListener('change', (e) => {
                this.projetoAtual = e.target.value ? parseInt(e.target.value) : null;
                this.renderMapa();
            });
        }

        const btnNovaAtividade = document.getElementById('btnNovaAtividade');
        if (btnNovaAtividade) {
            btnNovaAtividade.addEventListener('click', () => {
                document.getElementById('atividadeId').value = '';
                document.getElementById('formAtividade').reset();
                this.atualizarDependencias();
                document.getElementById('atividadeModal').classList.add('active');
            });
        }
    },

    render() {
        this.renderProjetos();
        this.renderProgressoGlobal();
        this.renderSelectorProjetos();
        this.renderMapa();
        this.renderRelatorios();
        
        if (this.projetoAtual) {
            this.renderAtividadesProjeto(this.projetoAtual);
        }
    },

    /* ========== PROJETOS ========== */
    renderProjetos() {
        const data = this.getData();
        const grid = document.getElementById('projectsGrid');
        if (!grid) return;

        let html = '';
        data.projetos.forEach(p => {
            const atividades = data.atividades.filter(a => a.projeto_id === p.id);
            const concluidas = atividades.filter(a => a.status === 'concluido').length;
            const pct = atividades.length > 0 ? Math.round((concluidas / atividades.length) * 100) : 0;

            html += `
                <div class="project-card">
                    <div class="card-header">
                        <h3>${this.escapeHtml(p.nome)}</h3>
                        <button onclick="Mapa.excluirProjeto(${p.id})" class="delete-btn" title="Excluir">🗑️</button>
                    </div>
                    <div class="card-body">
                        <p class="descricao">${this.escapeHtml(p.descricao || '')}</p>
                        <div class="mini-progress">
                            <div class="mini-progress-bar" style="width: ${pct}%"></div>
                        </div>
                        <small>${concluidas}/${atividades.length} atividades (${pct}%)</small>
                    </div>
                    <div class="card-footer" style="display:flex;gap:8px">
                        <button onclick="Mapa.abriAtividades(${p.id})" class="btn btn-secondary" style="flex:1">+ Atividades</button>
                        <button onclick="Mapa.mostrarFluxograma(${p.id})" class="btn btn-primary" style="flex:1">Ver Fluxograma</button>
                    </div>
                </div>
            `;
        });

        html += `
            <div class="project-card add-card" onclick="document.getElementById('projetoModal').classList.add('active')">
                <div class="add-icon">+</div>
                <p>Novo Projeto</p>
            </div>
        `;

        grid.innerHTML = html;
    },

    mostrarFluxograma(projetoId) {
        // expõe para o script do dashboard renderizar o fluxograma para este projeto
        if (typeof window.renderFlowForProjectId === 'function') {
            window.renderFlowForProjectId(projetoId);
            document.getElementById('page-dashboard').checked = true;
        }
    },

    criarProjeto() {
        const nome = document.getElementById('nome').value;
        const descricao = document.getElementById('descricao').value;
        if (!nome) return;

        const data = this.getData();
        const projeto = {
            id: data.next_projeto_id++,
            nome,
            descricao,
            data_criacao: new Date().toISOString()
        };

        // cria o projeto
        data.projetos.push(projeto);

        // Cria atividades iniciais automaticamente: cada conexão do fluxograma vira uma atividade
        const defaultSteps = ['Backlog','Planejamento','Desenvolvimento','Testes','Concluído'];
        let prevAtividadeId = null;
        for (let i = 0; i < defaultSteps.length - 1; i++) {
            const nomeAtividade = `${defaultSteps[i]} → ${defaultSteps[i+1]}`;
            const atividade = {
                id: data.next_atividade_id++,
                projeto_id: projeto.id,
                nome: nomeAtividade,
                descricao: 'Atividade gerada a partir do fluxo do projeto',
                stack: 'outro',
                prioridade: 'media',
                dependencia: prevAtividadeId,
                equipe: '',
                responsavel: '',
                status: 'planejamento',
                created_at: new Date().toISOString()
            };
            data.atividades.push(atividade);
            prevAtividadeId = atividade.id;
        }

        this.saveData(data);

        document.getElementById('nome').value = '';
        document.getElementById('descricao').value = '';
        document.getElementById('projetoModal').classList.remove('active');
    },

    excluirProjeto(id) {
        if (!confirm('Excluir projeto e todas as atividades?')) return;
        const data = this.getData();
        data.projetos = data.projetos.filter(p => p.id !== id);
        data.atividades = data.atividades.filter(a => a.projeto_id !== id);
        this.saveData(data);
    },

    /* ========== ATIVIDADES ========== */
    abriAtividades(projetoId) {
        this.projetoAtual = projetoId;
        
        const data = this.getData();
        const projeto = data.projetos.find(p => p.id === projetoId);
        
        if (projeto) {
            document.getElementById('projetoTitulo').textContent = projeto.nome;
            this.renderAtividadesProjeto(projetoId);
        }
        
        document.getElementById('page-projeto').checked = true;
    },

    renderAtividadesProjeto(projetoId) {
        const data = this.getData();
        const atividades = data.atividades.filter(a => a.projeto_id === projetoId);
        const concluidas = atividades.filter(a => a.status === 'concluido').length;
        const pct = atividades.length > 0 ? Math.round((concluidas / atividades.length) * 100) : 0;

        document.getElementById('projetoProgresso').textContent = pct + '%';
        document.getElementById('projetoProgressoBar').style.width = pct + '%';
        document.getElementById('projetoProgressoText').textContent = `${concluidas} de ${atividades.length} atividades`;

        const grid = document.getElementById('atividadesGrid');
        
        if (atividades.length === 0) {
            grid.innerHTML = '<div class="empty-atividades">Nenhuma atividade ainda. Clique em "+ Nova Atividade" para adicionar.</div>';
            return;
        }

        let html = '';
        atividades.forEach(a => {
            const prioridadeLabel = { alta: 'Alta', media: 'Média', baixa: 'Baixa' };
            const stackLabel = { frontend: 'Frontend', backend: 'Backend', database: 'Database', cloud: 'Cloud', outro: 'Outro' };
            
            html += `
                <div class="atividade-card">
                    <div class="atividade-card-header">
                        <h4>${this.escapeHtml(a.nome)}</h4>
                        <span class="badge badge-${a.status}">${a.status === 'planejamento' ? 'Planejamento' : a.status === 'andamento' ? 'Em Andamento' : 'Concluído'}</span>
                    </div>
                    <div class="atividade-card-body">
                        ${this.escapeHtml(a.descricao || 'Sem descrição')}
                    </div>
                    <div class="atividade-card-meta">
                        <span>🛠️ ${stackLabel[a.stack] || a.stack}</span>
                        <span>⚡ ${prioridadeLabel[a.prioridade] || a.prioridade}</span>
                    </div>
                    <div class="atividade-card-meta">
                        <span>👥 ${this.escapeHtml(a.equipe || '-')}</span>
                        <span>👤 ${this.escapeHtml(a.responsavel || '-')}</span>
                    </div>
                    <div class="atividade-card-actions">
                        <select onchange="Mapa.alterarStatusAtividade(${a.id}, this.value)">
                            <option value="planejamento" ${a.status === 'planejamento' ? 'selected' : ''}>Planejamento</option>
                            <option value="andamento" ${a.status === 'andamento' ? 'selected' : ''}>Em Andamento</option>
                            <option value="concluido" ${a.status === 'concluido' ? 'selected' : ''}>Concluído</option>
                        </select>
                        <button onclick="Mapa.editarAtividade(${a.id})" class="btn btn-outline" style="padding: 6px 12px;">Editar</button>
                        <button onclick="Mapa.excluirAtividade(${a.id})" class="btn btn-danger" style="padding: 6px 12px;">Excluir</button>
                    </div>
                </div>
            `;
        });

        grid.innerHTML = html;
    },

    alterarStatusAtividade(atividadeId, novoStatus) {
        const data = this.getData();
        const atividade = data.atividades.find(a => a.id === atividadeId);
        if (atividade) {
            atividade.status = novoStatus;
            this.saveData(data);
        }
    },

    editarAtividade(atividadeId) {
        const data = this.getData();
        const atividade = data.atividades.find(a => a.id === atividadeId);
        if (!atividade) return;

        document.getElementById('atividadeId').value = atividade.id;
        document.getElementById('nomeAtividade').value = atividade.nome;
        document.getElementById('descAtividade').value = atividade.descricao || '';
        document.getElementById('stackAtividade').value = atividade.stack || 'frontend';
        document.getElementById('prioridadeAtividade').value = atividade.prioridade || 'media';
        
        this.atualizarDependencias();
        
        const depSelect = document.getElementById('dependenciaAtividade');
        if (atividade.dependencia) {
            depSelect.value = atividade.dependencia;
        }

        document.getElementById('equipeAtividade').value = atividade.equipe || '';
        document.getElementById('responsavelAtividade').value = atividade.responsavel || '';

        document.getElementById('atividadeModal').classList.add('active');
    },

    excluirAtividade(atividadeId) {
        if (!confirm('Tem certeza que deseja excluir esta atividade?')) return;
        
        const data = this.getData();
        
        data.atividades.forEach(a => {
            if (a.dependencia === atividadeId) {
                a.dependencia = null;
            }
        });
        
        data.atividades = data.atividades.filter(a => a.id !== atividadeId);
        this.saveData(data);
        this.renderAtividadesProjeto(this.projetoAtual);
        this.renderProgressoGlobal();
        this.renderProjetos();
    },

    atualizarDependencias() {
        if (!this.projetoAtual) return;
        
        const data = this.getData();
        const atividades = data.atividades.filter(a => a.projeto_id === this.projetoAtual);
        
        const select = document.getElementById('dependenciaAtividade');
        let html = '<option value="">Nenhuma</option>';
        atividades.forEach(a => {
            html += `<option value="${a.id}">${this.escapeHtml(a.nome)}</option>`;
        });
        select.innerHTML = html;
    },

    salvarAtividade() {
        const nome = document.getElementById('nomeAtividade').value;
        const descricao = document.getElementById('descAtividade').value;
        const stack = document.getElementById('stackAtividade').value;
        const prioridade = document.getElementById('prioridadeAtividade').value;
        const dependencia = document.getElementById('dependenciaAtividade').value;
        const equipe = document.getElementById('equipeAtividade').value;
        const responsavel = document.getElementById('responsavelAtividade').value;
        const atividadeId = document.getElementById('atividadeId').value;

        if (!nome || !this.projetoAtual) return;

        const data = this.getData();

        if (atividadeId) {
            const atividade = data.atividades.find(a => a.id === parseInt(atividadeId));
            if (atividade) {
                atividade.nome = nome;
                atividade.descricao = descricao;
                atividade.stack = stack;
                atividade.prioridade = prioridade;
                atividade.dependencia = dependencia ? parseInt(dependencia) : null;
                atividade.equipe = equipe;
                atividade.responsavel = responsavel;
            }
        } else {
            const atividade = {
                id: data.next_atividade_id++,
                projeto_id: this.projetoAtual,
                nome,
                descricao,
                stack,
                prioridade,
                dependencia: dependencia ? parseInt(dependencia) : null,
                equipe,
                responsavel,
                status: 'planejamento',
                created_at: new Date().toISOString()
            };
            data.atividades.push(atividade);
        }

        this.saveData(data);
        this.fecharModal();
    },

    abrirAtividade(atividadeId) {
        const data = this.getData();
        const atividade = data.atividades.find(a => a.id === atividadeId);
        if (!atividade) return;

        this.atividadeAtual = atividadeId;

        document.getElementById('panelTitulo').textContent = atividade.nome;
        document.getElementById('panelDescricao').textContent = atividade.descricao || 'Sem descrição';
        document.getElementById('panelStack').textContent = atividade.stack || 'Não definido';
        document.getElementById('panelPrioridade').textContent = atividade.prioridade || 'Média';
        
        const dataFormatada = atividade.created_at ? new Date(atividade.created_at).toLocaleDateString('pt-BR') : '-';
        document.getElementById('panelData').textContent = dataFormatada;

        const statusBadge = document.getElementById('panelStatus');
        statusBadge.textContent = atividade.status === 'concluido' ? 'Concluído' : 
                                   atividade.status === 'andamento' ? 'Em Andamento' : 'Planejamento';
        statusBadge.className = 'badge badge-' + atividade.status;

        document.getElementById('panelStatusSelect').value = atividade.status;

        const depsContainer = document.getElementById('panelDependencias');
        if (atividade.dependencia) {
            const dep = data.atividades.find(a => a.id === atividade.dependencia);
            if (dep) {
                depsContainer.innerHTML = `
                    <div class="panel-dependencia-item ${dep.status === 'concluido' ? 'concluida' : ''}">
                        ${this.escapeHtml(dep.nome)} - ${dep.status}
                    </div>
                `;
            }
        } else {
            depsContainer.innerHTML = '<small style="color:var(--text-secondary)">Sem dependências</small>';
        }

        document.getElementById('nodePanel').classList.add('active');
    },

    alterarStatus(novoStatus) {
        if (!this.atividadeAtual) return;
        
        const data = this.getData();
        const atividade = data.atividades.find(a => a.id === this.atividadeAtual);
        if (atividade) {
            atividade.status = novoStatus;
            this.saveData(data);
            
            document.getElementById('panelStatus').textContent = 
                novoStatus === 'concluido' ? 'Concluído' : 
                novoStatus === 'andamento' ? 'Em Andamento' : 'Planejamento';
            document.getElementById('panelStatus').className = 'badge badge-' + novoStatus;
        }
    },

    excluirAtividadePainel() {
        if (!this.atividadeAtual) return;
        if (!confirm('Excluir esta atividade?')) return;

        const data = this.getData();
        data.atividades = data.atividades.filter(a => a.id !== this.atividadeAtual);
        
        data.atividades.forEach(a => {
            if (a.dependencia === this.atividadeAtual) {
                a.dependencia = null;
            }
        });

        this.saveData(data);
        this.fecharPainel();
        this.render();
    },

    fecharModal() {
        document.getElementById('atividadeModal').classList.remove('active');
        document.getElementById('formAtividade').reset();
        document.getElementById('atividadeId').value = '';
        
        if (this.projetoAtual) {
            this.renderAtividadesProjeto(this.projetoAtual);
            this.renderProgressoGlobal();
            this.renderProjetos();
        }
    },

    fecharPainel() {
        document.getElementById('nodePanel').classList.remove('active');
        this.atividadeAtual = null;
    },

    /* ========== MAPA VISUAL ========== */
    renderSelectorProjetos() {
        const data = this.getData();
        const selector = document.getElementById('projetoSelector');
        if (!selector) return;

        let html = '<option value="">Selecione um projeto</option>';
        data.projetos.forEach(p => {
            html += `<option value="${p.id}">${this.escapeHtml(p.nome)}</option>`;
        });
        selector.innerHTML = html;

        if (this.projetoAtual) {
            selector.value = this.projetoAtual;
        }
    },

    renderMapa() {
        const canvas = document.getElementById('mapaCanvas');
        const list = document.getElementById('nodesList');
        
        if (!this.projetoAtual) {
            canvas.innerHTML = '<div class="mapa-vazio"><p>Selecione um projeto para visualizar o mapa</p></div>';
            list.innerHTML = '';
            return;
        }

        const data = this.getData();
        const atividades = data.atividades
            .filter(a => a.projeto_id === this.projetoAtual)
            .sort((a, b) => a.id - b.id);

        if (atividades.length === 0) {
            canvas.innerHTML = '<div class="mapa-vazio"><p>Nenhuma atividade neste projeto</p></div>';
            list.innerHTML = '';
            return;
        }

        this.renderNodes(atividades, canvas);
        this.renderNodesList(atividades, list);
    },

    renderNodes(atividades, container) {
        let html = '<div class="mapa-connections"><svg>';
        
        const nodePositions = this.calcularPosicoes(atividades);
        
        atividades.forEach(a => {
            const pos = nodePositions[a.id];
            const icon = this.getIconForStack(a.stack);
            const priorityClass = a.prioridade || 'baixa';
            const blocked = a.dependencia && !this.isDependenciaConcluida(a.dependencia);

            html += `
                <div class="node ${a.status} ${blocked ? 'bloqueado' : ''}" 
                     style="left: ${pos.x}px; top: ${pos.y}px"
                     onclick="Mapa.abrirAtividade(${a.id})">
                    <span class="node-priority ${priorityClass}"></span>
                    <div class="node-icon">${icon}</div>
                    <div class="node-title">${this.escapeHtml(a.nome)}</div>
                    <div class="node-meta">${a.stack}</div>
                </div>
            `;

            if (a.dependencia) {
                const depPos = nodePositions[a.dependencia];
                if (depPos) {
                    const depAtividade = atividades.find(act => act.id === a.dependencia);
                    const lineClass = depAtividade && depAtividade.status === 'concluido' ? 'concluido' : '';
                    html += `<line x1="${depPos.x + 80}" y1="${depPos.y + 40}" x2="${pos.x + 80}" y2="${pos.y + 40}" class="${lineClass}" />`;
                }
            }
        });

        html += '</svg></div>';
        container.innerHTML = html;
    },

    calcularPosicoes(atividades) {
        const positions = {};
        const cols = 4;
        const nodeWidth = 160;
        const nodeHeight = 100;
        const gapX = 60;
        const gapY = 80;

        atividades.forEach((a, index) => {
            const col = index % cols;
            const row = Math.floor(index / cols);
            positions[a.id] = {
                x: col * (nodeWidth + gapX) + 40,
                y: row * (nodeHeight + gapY) + 20
            };
        });

        return positions;
    },

    isDependenciaConcluida(dependenciaId) {
        const data = this.getData();
        const dep = data.atividades.find(a => a.id === dependenciaId);
        return dep && dep.status === 'concluido';
    },

    getIconForStack(stack) {
        const icons = {
            frontend: '🎨',
            backend: '⚙️',
            database: '💾',
            cloud: '☁️',
            outro: '📦'
        };
        return icons[stack] || '📦';
    },

    renderNodesList(atividades, container) {
        let html = '';
        atividades.forEach(a => {
            const icon = this.getIconForStack(a.stack);
            html += `
                <div class="node-card ${a.status}" onclick="Mapa.abrirAtividade(${a.id})">
                    <div class="node-card-title">${icon} ${this.escapeHtml(a.nome)}</div>
                    <div class="node-card-meta">
                        <span>${a.prioridade}</span>
                        <span>${a.status}</span>
                    </div>
                </div>
            `;
        });
        container.innerHTML = html;
    },

    /* ========== PROGRESSO ========== */
    renderProgressoGlobal() {
        const data = this.getData();
        const total = data.atividades.length;
        const concluidas = data.atividades.filter(a => a.status === 'concluido').length;
        const pct = total > 0 ? Math.round((concluidas / total) * 100) : 0;

        document.getElementById('totalAtividades').textContent = total;
        document.getElementById('progressGlobal').style.width = pct + '%';
        document.getElementById('percentGlobal').textContent = pct + '% concluído';
    },

    renderRelatorios() {
        this.renderProgressoProjetos();
        this.renderStats();
    },

    renderProgressoProjetos() {
        const container = document.getElementById('progressoProjetos');
        const data = this.getData();

        let html = '';
        data.projetos.forEach(p => {
            const atividades = data.atividades.filter(a => a.projeto_id === p.id);
            const concluidas = atividades.filter(a => a.status === 'concluido').length;
            const pct = atividades.length > 0 ? Math.round((concluidas / atividades.length) * 100) : 0;

            html += `
                <div class="projeto-progress">
                    <div class="projeto-progress-header">
                        <span class="projeto-progress-name">${this.escapeHtml(p.nome)}</span>
                        <span class="projeto-progress-percent">${pct}%</span>
                    </div>
                    <div class="projeto-progress-bar">
                        <div class="projeto-progress-fill" style="width: ${pct}%"></div>
                    </div>
                    <small style="color: var(--text-secondary)">${concluidas}/${atividades.length} atividades</small>
                </div>
            `;
        });

        container.innerHTML = html || '<p style="color:var(--text-secondary)">Nenhum projeto cadastrado</p>';
    },

    renderStats() {
        const data = this.getData();
        const total = data.atividades.length;
        const concluidas = data.atividades.filter(a => a.status === 'concluido').length;
        const andamento = data.atividades.filter(a => a.status === 'andamento').length;
        const planejamento = data.atividades.filter(a => a.status === 'planejamento').length;

        const container = document.getElementById('statsGrid');
        container.innerHTML = `
            <div class="stat-item">
                <div class="stat-value">${data.projetos.length}</div>
                <div class="stat-label">Projetos</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${total}</div>
                <div class="stat-label">Total Atividades</div>
            </div>
            <div class="stat-item">
                <div class="stat-value" style="color:var(--success)">${concluidas}</div>
                <div class="stat-label">Concluídas</div>
            </div>
            <div class="stat-item">
                <div class="stat-value" style="color:var(--andamento)">${andamento}</div>
                <div class="stat-label">Em Andamento</div>
            </div>
        `;
    },

    exportarPDF() {
        const data = this.getData();
        const now = new Date().toLocaleDateString('pt-BR');
        
        let html = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Relatório de Projetos</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
                h1 { color: #4f46e5; border-bottom: 2px solid #4f46e5; padding-bottom: 10px; }
                h2 { color: #333; margin-top: 30px; }
                table { width: 100%; border-collapse: collapse; margin: 15px 0; }
                th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                th { background: #4f46e5; color: white; }
                .resumo { display: flex; gap: 20px; margin: 20px 0; }
                .resumo-item { background: #f3f4f6; padding: 15px; border-radius: 8px; }
                .resumo-item strong { display: block; font-size: 24px; color: #4f46e5; }
                .projeto { margin-bottom: 30px; page-break-inside: avoid; }
                .projeto-header { background: #e0e7ff; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
                .badge { padding: 4px 8px; border-radius: 4px; font-size: 12px; }
                .badge-planejamento { background: #ede9fe; color: #7c3aed; }
                .badge-andamento { background: #e0f2fe; color: #0284c7; }
                .badge-concluido { background: #dcfce7; color: #16a34a; }
                .progress-bar { background: #e5e7eb; height: 20px; border-radius: 10px; overflow: hidden; }
                .progress-fill { height: 100%; background: linear-gradient(90deg, #4f46e5, #22c55e); }
                @media print { body { padding: 0; } }
            </style>
        </head>
        <body>
            <h1>📊 Relatório de Projetos</h1>
            <p><strong>Data:</strong> ${now}</p>
            
            <div class="resumo">
                <div class="resumo-item"><strong>${data.projetos.length}</strong>Projetos</div>
                <div class="resumo-item"><strong>${data.atividades.length}</strong>Atividades</div>
                <div class="resumo-item"><strong>${data.atividades.filter(a => a.status === 'concluido').length}</strong>Concluídas</div>
                <div class="resumo-item"><strong>${data.atividades.filter(a => a.status === 'andamento').length}</strong>Em Andamento</div>
            </div>
`;

        data.projetos.forEach(p => {
            const atividades = data.atividades.filter(a => a.projeto_id === p.id);
            const concluidas = atividades.filter(a => a.status === 'concluido').length;
            const pct = atividades.length > 0 ? Math.round((concluidas / atividades.length) * 100) : 0;

            html += `
            <div class="projeto">
                <div class="projeto-header">
                    <h2>${p.nome}</h2>
                    <p>${p.descricao || 'Sem descrição'}</p>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${pct}%"></div>
                    </div>
                    <p><strong>Progresso:</strong> ${pct}% (${concluidas}/${atividades.length} atividades)</p>
                </div>
`;

            if (atividades.length > 0) {
                html += `<table>
                    <thead>
                        <tr>
                            <th>Atividade</th>
                            <th>Status</th>
                            <th>Prioridade</th>
                            <th>Stack</th>
                            <th>Equipe</th>
                            <th>Responsável</th>
                        </tr>
                    </thead>
                    <tbody>
`;
                atividades.forEach(a => {
                    html += `<tr>
                        <td>${a.nome}</td>
                        <td><span class="badge badge-${a.status}">${a.status === 'planejamento' ? 'Planejamento' : a.status === 'andamento' ? 'Em Andamento' : 'Concluído'}</span></td>
                        <td>${a.prioridade || '-'}</td>
                        <td>${a.stack || '-'}</td>
                        <td>${a.equipe || '-'}</td>
                        <td>${a.responsavel || '-'}</td>
                    </tr>`;
                });
                html += `</tbody></table>`;
            } else {
                html += `<p style="color:#666">Nenhuma atividade neste projeto.</p>`;
            }

            html += `</div>`;
        });

        html += `
        <p style="margin-top:40px;color:#666;font-size:12px">Gerado por Projetos Dinâmicos</p>
        </body></html>`;

        const janela = window.open('', '_blank');
        janela.document.write(html);
        janela.document.close();
        janela.print();
    },

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

document.addEventListener('DOMContentLoaded', function() {
    function initApp() {
        Mapa.init();
    }

    if (document.getElementById('header-placeholder')) {
        document.addEventListener('componentsLoaded', initApp);
    } else {
        initApp();
    }
});
