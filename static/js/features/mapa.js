const Mapa = {
    projetoAtual: null,
    atividadeAtual: null,
    dataCache: { projetos: [], atividades: [] },
    mlCorrelations: [],

    async init() {
        console.log('Iniciando Mapa...');
        await DB.init();
        console.log('DB inicializado');
        await this.loadData();
        console.log('Dados carregados:', this.dataCache);
        this.setupModal();
        this.setupEventListeners();
        this.render();
        
        // Recarregar ML
        if (window.recarregarML) window.recarregarML();
    },

    async loadData() {
        try {
            const projetos = await DB.getAllProjetos();
            console.log('Projetos do DB:', projetos);
            const atividades = [];
            
            for (const projeto of projetos) {
                const atks = await DB.getAtividadesByProjeto(projeto._id);
                atks.forEach(a => a.projeto_id = projeto._id);
                atividades.push(...atks);
            }
            
            this.dataCache = { projetos, atividades };
            console.log('DataCache atualizado:', this.dataCache);
        } catch (e) {
            console.error('Erro ao carregar dados:', e);
            this.dataCache = { projetos: [], atividades: [] };
        }
    },

    getData() {
        return this.dataCache;
    },

    async saveData(data) {
        this.dataCache = data;
        this.render();
        
        if (window.recarregarML) window.recarregarML();
    },

    setupModal() {
        // Botão Novo Projeto
        const openModalBtn = document.getElementById('openModalBtn');
        if (openModalBtn) {
            openModalBtn.addEventListener('click', () => {
                document.getElementById('projetoModal').classList.add('active');
            });
        }
        
        const modal = document.getElementById('projetoModal');
        const form = document.getElementById('formNovoProjeto');
        
        if (modal && form) {
            const closeBtn = modal.querySelector('.close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    modal.classList.remove('active');
                });
            }
            
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const nome = document.getElementById('nome').value;
                const descricao = document.getElementById('descricao').value;
                
                const novoProjeto = await DB.createProjeto({
                    nome,
                    descricao,
                    status: 'planejamento'
                });
                
                await this.loadData();
                
                modal.classList.remove('active');
                form.reset();
            });
        }
        
        const atividadeModal = document.getElementById('atividadeModal');
        if (atividadeModal) {
            const closeBtn = atividadeModal.querySelector('.close-btn');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => {
                    atividadeModal.classList.remove('active');
                });
            }
            
            const formAtividade = document.getElementById('formAtividade');
            if (formAtividade) {
                formAtividade.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    await this.salvarAtividade();
                });
            }
        }
    },

    async salvarAtividade() {
        const atividadeId = document.getElementById('atividadeId').value;
        const titulo = document.getElementById('nomeAtividade').value;
        const descricao = document.getElementById('descAtividade').value;
        const stack = document.getElementById('stackAtividade')?.value || 'outro';
        const prioridade = document.getElementById('prioridadeAtividade')?.value || 'media';
        const dependencia = document.getElementById('dependenciaAtividade')?.value || '';
        const equipe = document.getElementById('equipeAtividade')?.value || '';
        const responsavel = document.getElementById('responsavelAtividade')?.value || '';
        
        if (atividadeId) {
            // Atualizar
            const data = this.getData();
            const atividade = data.atividades.find(a => a._id === atividadeId || a.id == atividadeId);
            if (atividade) {
                await DB.updateAtividade({
                    _id: atividade._id,
                    _rev: atividade._rev,
                    titulo,
                    descricao,
                    stack,
                    prioridade,
                    dependencia,
                    equipe,
                    responsavel,
                    status: atividade.status,
                    projeto_id: atividade.projeto_id
                });
            }
        } else {
            // Criar nova
            if (!this.projetoAtual) {
                alert('Selecione um projeto primeiro!');
                return;
            }
            
            await DB.createAtividade({
                projeto_id: this.projetoAtual._id,
                titulo,
                descricao,
                stack,
                prioridade,
                dependencia,
                equipe,
                responsavel,
                status: 'pendente'
            });
        }
        
        await this.loadData();
        
        document.getElementById('atividadeModal').classList.remove('active');
        document.getElementById('formAtividade').reset();
    },

    setupEventListeners() {
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

    renderProjetos() {
        const data = this.getData();
        const grid = document.getElementById('projectsGrid');
        if (!grid) return;

        let html = '';
        data.projetos.forEach(p => {
            const atividades = data.atividades.filter(a => a.projeto_id === p._id);
            const concluidas = atividades.filter(a => a.status === 'concluido').length;
            const pct = atividades.length > 0 ? Math.round((concluidas / atividades.length) * 100) : 0;

            html += `
                <div class="project-card" onclick="Mapa.editarProjeto('${p._id}')" style="cursor:pointer">
                    <div class="card-header">
                        <h3>${this.escapeHtml(p.nome)}</h3>
                        <button onclick="event.stopPropagation();Mapa.excluirProjeto('${p._id}')" class="delete-btn" aria-label="Excluir projeto">🗑️</button>
                    </div>
                    <p>${this.escapeHtml(p.descricao || '')}</p>
                    <div class="card-meta">
                        <span class="badge badge-${p.status}">${this.getStatusLabel(p.status)}</span>
                        <span>${atividades.length} atividades</span>
                    </div>
                    <div class="progress-bar-container" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}">
                        <div class="progress-bar-fill" style="width: ${pct}%"></div>
                    </div>
                    <div class="card-actions" onclick="event.stopPropagation()">
                        <button onclick="Mapa.editarProjeto('${p._id}')" class="btn btn-sm">Editar</button>
                        <button onclick="Mapa.selecionarProjeto('${p._id}')" class="btn btn-sm btn-primary">Ver Detalhes</button>
                    </div>
                </div>
            `;
        });
        grid.innerHTML = html || '<p class="empty-state">Nenhum projeto. Clique em "+ Novo Projeto" para começar.</p>';
    },

    getStatusLabel(status) {
        const labels = {
            'planejamento': 'Planejamento',
            'andamento': 'Em Andamento',
            'concluido': 'Concluído',
            'pendente': 'Pendente'
        };
        return labels[status] || status;
    },

    async excluirProjeto(id) {
        if (!confirm('Excluir este projeto e todas as atividades?')) return;
        
        await DB.deleteProjeto(id);
        await this.loadData();
        
        if (this.projetoAtual?._id === id) {
            this.projetoAtual = null;
        }
    },

    editarProjeto(id) {
        const data = this.getData();
        const projeto = data.projetos.find(p => p._id === id);
        if (!projeto) return;

        document.getElementById('nome').value = projeto.nome;
        document.getElementById('descricao').value = projeto.descricao || '';
        
        document.getElementById('projetoModal').classList.add('active');
        
        const form = document.getElementById('formNovoProjeto');
        form.onsubmit = async (e) => {
            e.preventDefault();
            projeto.nome = document.getElementById('nome').value;
            projeto.descricao = document.getElementById('descricao').value;
            
            await DB.updateProjeto(projeto);
            await this.loadData();
            
            document.getElementById('projetoModal').classList.remove('active');
            form.reset();
        };
    },

    selecionarProjeto(id) {
        const data = this.getData();
        this.projetoAtual = data.projetos.find(p => p._id === id);
        document.getElementById('page-projeto').checked = true;
        this.render();
        this.renderAtividadesProjeto(this.projetoAtual);
    },

    renderAtividadesProjeto(projeto) {
        if (!projeto) return;
        
        document.getElementById('projetoTitulo').textContent = projeto.nome;
        
        // Renderizar fluxograma do projeto
        this.renderProjetoFluxo(projeto);
        
        const data = this.getData();
        const atividades = data.atividades.filter(a => a.projeto_id === projeto._id);
        
        const grid = document.getElementById('atividadesGrid');
        if (!grid) return;
        
        let html = '';
        atividades.forEach(a => {
            const statusClass = a.status === 'concluido' ? 'success' : a.status === 'andamento' ? 'warning' : 'secondary';
            html += `
                <div class="atividade-card" onclick="Mapa.abrirAtividade('${a._id}')">
                    <div class="atividade-header">
                        <span class="badge badge-${statusClass}">${this.getStatusLabel(a.status)}</span>
                        ${a.prioridade ? `<span class="prioridade prioridade-${a.prioridade}">⚡ ${a.prioridade}</span>` : ''}
                    </div>
                    <h4>${this.escapeHtml(a.titulo)}</h4>
                    <p>${this.escapeHtml(a.descricao || '').substring(0, 80)}${a.descricao?.length > 80 ? '...' : ''}</p>
                    <div class="atividade-meta">
                        ${a.stack ? `<span class="stack-badge">${a.stack}</span>` : ''}
                        ${a.responsavel ? `<span>👤 ${this.escapeHtml(a.responsavel)}</span>` : ''}
                    </div>
                </div>
            `;
        });
        
        grid.innerHTML = html || '<p class="empty-state">Nenhuma atividade. Clique em "+ Nova Atividade".</p>';
        
        const concluidas = atividades.filter(a => a.status === 'concluido').length;
        const total = atividades.length;
        const pct = total > 0 ? Math.round((concluidas / total) * 100) : 0;
        
        document.getElementById('projetoProgressoBar').style.width = pct + '%';
        document.getElementById('projetoProgressoText').textContent = `${concluidas} de ${total} atividades`;
    },

    abrirAtividade(id) {
        const data = this.getData();
        const atividade = data.atividades.find(a => a._id === id);
        if (!atividade) return;

        this.atividadeAtual = atividade;
        
        document.getElementById('atividadeId').value = atividade._id;
        document.getElementById('nomeAtividade').value = atividade.titulo;
        document.getElementById('descAtividade').value = atividade.descricao || '';
        
        const stackSelect = document.getElementById('stackAtividade');
        if (stackSelect) {
            stackSelect.value = atividade.stack || 'outro';
        }
        
        this.atualizarDependencias(atividade.dependencia);
        
        document.getElementById('atividadeModal').classList.add('active');
    },

    async excluirAtividade(id) {
        if (!confirm('Excluir esta atividade?')) return;
        
        await DB.deleteAtividade(id);
        await this.loadData();
    },

    atualizarDependencias(selectedId = '') {
        const data = this.getData();
        if (!this.projetoAtual) return;
        
        const select = document.getElementById('dependenciaAtividade');
        if (!select) return;
        
        const atividades = data.atividades.filter(a => a.projeto_id === this.projetoAtual._id);
        
        let html = '<option value="">Nenhuma</option>';
        atividades.forEach(a => {
            const selected = (a._id === selectedId || a.id == selectedId) ? 'selected' : '';
            html += `<option value="${a._id}" ${selected}>${this.escapeHtml(a.titulo)}</option>`;
        });
        
        select.innerHTML = html;
    },

    renderProgressoGlobal() {
        const data = this.getData();
        const total = data.atividades.length;
        const concluidas = data.atividades.filter(a => a.status === 'concluido').length;
        const pct = total > 0 ? Math.round((concluidas / total) * 100) : 0;
        
        document.getElementById('totalAtividades').textContent = total;
        document.getElementById('percentGlobal').textContent = pct + '% concluído';
        
        const progressBar = document.getElementById('progressGlobal');
        if (progressBar) {
            progressBar.style.width = pct + '%';
            progressBar.setAttribute('aria-valuenow', pct);
        }
    },

    renderSelectorProjetos() {
        const data = this.getData();
        const select = document.getElementById('projetoSelector');
        if (!select) return;
        
        let html = '<option value="">Selecione um projeto</option>';
        data.projetos.forEach(p => {
            html += `<option value="${p._id}">${this.escapeHtml(p.nome)}</option>`;
        });
        
        select.innerHTML = html;
        select.onchange = (e) => {
            const id = e.target.value;
            if (id) {
                const projeto = data.projetos.find(p => p._id === id);
                if (projeto) {
                    document.getElementById('page-mapa').checked = true;
                    this.renderMapaForProjeto(projeto);
                }
            }
        };
    },

    renderMapa() {
        const select = document.getElementById('projetoSelector');
        const currentValue = select?.value;
        
        if (currentValue) {
            const data = this.getData();
            const projeto = data.projetos.find(p => p._id === currentValue);
            if (projeto) {
                this.renderMapaForProjeto(projeto);
                return;
            }
        }
        
        const canvas = document.getElementById('mapaCanvas');
        if (canvas) {
            canvas.innerHTML = '<div class="mapa-vazio"><p>Selecione um projeto para visualizar o mapa</p></div>';
        }
    },

    renderMapaForProjeto(projeto) {
        const data = this.getData();
        const atividades = data.atividades.filter(a => a.projeto_id === projeto._id);
        
        const canvas = document.getElementById('mapaCanvas');
        if (!canvas) return;
        
        if (atividades.length === 0) {
            canvas.innerHTML = '<div class="mapa-vazio"><p>Este projeto ainda não tem atividades.</p></div>';
            return;
        }
        
        const showML = document.getElementById('mlCorrelations')?.checked;
        const threshold = parseInt(document.getElementById('mlThreshold')?.value || 50) / 100;
        
        let html = '<div class="nodes-grid" style="position: relative;">';
        
        // Draw ML correlation lines if enabled
        if (showML && this.mlCorrelations.length > 0) {
            html += '<svg id="mlCorrSvg" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1;"></svg>';
        }
        
        atividades.forEach((a, idx) => {
            const statusClass = a.status === 'concluido' ? 'success' : a.status === 'andamento' ? 'warning' : 'secondary';
            html += `
                <div class="node-item node-${statusClass}" onclick="Mapa.abrirAtividade('${a._id}')" data-atividade-id="${a._id}" style="position: relative; z-index: 2;">
                    <span class="node-title">${this.escapeHtml(a.titulo)}</span>
                    <span class="node-status">${this.getStatusLabel(a.status)}</span>
                </div>
            `;
        });
        html += '</div>';
        
        const nodesList = document.getElementById('nodesList');
        if (nodesList) {
            nodesList.innerHTML = html;
        }
        
        // Draw ML correlations after rendering nodes
        if (showML && this.mlCorrelations.length > 0) {
            setTimeout(() => this.desenharCorrelaoes(atividades, threshold), 100);
        }
        
        // Show ML legend
        const mlLegend = document.getElementById('mlLegend');
        if (mlLegend) {
            mlLegend.style.display = showML ? 'flex' : 'none';
        }
    },
    
    desenharCorrelaoes(atividades, threshold) {
        const svg = document.getElementById('mlCorrSvg');
        if (!svg) return;
        
        svg.innerHTML = '';
        
        const nodes = document.querySelectorAll('[data-atividade-id]');
        const nodeRects = {};
        nodes.forEach(node => {
            const id = node.dataset.atividadeId;
            const rect = node.getBoundingClientRect();
            const container = svg.getBoundingClientRect();
            nodeRects[id] = {
                x: rect.left - container.left + rect.width / 2,
                y: rect.top - container.top + rect.height / 2
            };
        });
        
        // Filter and draw correlations above threshold
        this.mlCorrelations.forEach(corr => {
            if (corr.similarity >= threshold) {
                const from = nodeRects[corr.from];
                const to = nodeRects[corr.to];
                
                if (from && to) {
                    const opacity = 0.3 + (corr.similarity * 0.7);
                    const lineWidth = 1 + (corr.similarity * 3);
                    
                    svg.innerHTML += `
                        <line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" 
                            stroke="#9333ea" stroke-width="${lineWidth}" stroke-opacity="${opacity}" 
                            stroke-dasharray="${corr.similarity < 0.7 ? '5,5' : ''}"/>
                        <text x="${(from.x + to.x)/2}" y="${(from.y + to.y)/2 - 5}" 
                            fill="#9333ea" font-size="10" text-anchor="middle">${Math.round(corr.similarity * 100)}%</text>
                    `;
                }
            }
        });
    },
    
    async calcularCorrelaes() {
        const loading = document.getElementById('mlLoading');
        const btn = document.getElementById('btnCalcularML');
        
        if (loading) loading.style.display = 'block';
        if (btn) btn.disabled = true;
        
        try {
            // Get all activities
            const atividades = this.dataCache.atividades;
            
            if (atividades.length < 2) {
                alert('Necesite pelo menos 2 atividades para calcular correlações.');
                return;
            }
            
            // Check if ML model is available
            if (typeof AtividadeML !== 'undefined' && AtividadeML.isReady && AtividadeML.useModel) {
                // Calculate embeddings for all activities
                const textos = atividades.map(a => `${a.titulo || ''} ${a.descricao || ''}`);
                const embeddings = await AtividadeML.useModel.embed(textos);
                
                this.mlCorrelations = [];
                
                // Calculate pairwise similarity
                for (let i = 0; i < atividades.length; i++) {
                    for (let j = i + 1; j < atividades.length; j++) {
                        const embI = embeddings.slice([i, 0], [1, embeddings.shape[1]]);
                        const embJ = embeddings.slice([j, 0], [1, embeddings.shape[1]]);
                        
                        const sim = this.calcularSimilaridade(embI, embJ);
                        
                        if (sim > 0.3) {
                            this.mlCorrelations.push({
                                from: atividades[i]._id,
                                to: atividades[j]._id,
                                similarity: sim
                            });
                        }
                    }
                }
                
                embeddings.dispose();
                console.log('Correlações calculadas:', this.mlCorrelations.length);
                
                // Show results
                const showML = document.getElementById('mlCorrelations');
                if (showML) showML.checked = true;
                
                this.renderMapa();
                
                alert(`Calculadas ${this.mlCorrelations.length} correlações entre atividades!`);
            } else {
                alert('Modelo de IA não está disponível. Continue adicionando atividades para treinar o modelo.');
            }
        } catch (e) {
            console.error('Erro ao calcular correlações:', e);
            alert('Erro ao calcular correlações: ' + e.message);
        } finally {
            if (loading) loading.style.display = 'none';
            if (btn) btn.disabled = false;
        }
    },
    
    calcularSimilaridade(a, b) {
        const aData = a.dataSync();
        const bData = b.dataSync();
        let dotProduct = 0;
        let normA = 0;
        let normB = 0;
        for (let i = 0; i < aData.length; i++) {
            dotProduct += aData[i] * bData[i];
            normA += aData[i] * aData[i];
            normB += bData[i] * bData[i];
        }
        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB) + 0.0001);
    },

    renderRelatorios() {
        const data = this.getData();
        
        const progressoContainer = document.getElementById('progressoProjetos');
        if (progressoContainer) {
            let html = '';
            data.projetos.forEach(p => {
                const atks = data.atividades.filter(a => a.projeto_id === p._id);
                const concluidas = atks.filter(a => a.status === 'concluido').length;
                const pct = atks.length > 0 ? Math.round((concluidas / atks.length) * 100) : 0;
                
                html += `
                    <div class="relatorio-item">
                        <div class="relatorio-item-header">
                            <span>${this.escapeHtml(p.nome)}</span>
                            <span>${pct}%</span>
                        </div>
                        <div class="progress-bar-container">
                            <div class="progress-bar-fill" style="width: ${pct}%"></div>
                        </div>
                    </div>
                `;
            });
            progressoContainer.innerHTML = html || '<p>Nenhum projeto</p>';
        }
        
        const statsGrid = document.getElementById('statsGrid');
        if (statsGrid) {
            const total = data.atividades.length;
            const concluidas = data.atividades.filter(a => a.status === 'concluido').length;
            const andamento = data.atividades.filter(a => a.status === 'andamento').length;
            const planejamento = data.atividades.filter(a => a.status === 'pendente').length;
            
            statsGrid.innerHTML = `
                <div class="stat-card"><span class="stat-value">${data.projetos.length}</span><span class="stat-label">Projetos</span></div>
                <div class="stat-card"><span class="stat-value">${total}</span><span class="stat-label">Atividades</span></div>
                <div class="stat-card"><span class="stat-value">${concluidas}</span><span class="stat-label">Concluídas</span></div>
                <div class="stat-card"><span class="stat-value">${andamento}</span><span class="stat-label">Em Andamento</span></div>
            `;
        }
    },

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // ========== FLUXOGRAMA DO PROJETO ==========
    renderProjetoFluxo(projeto) {
        const data = this.getData();
        const atividades = data.atividades.filter(a => a.projeto_id === projeto._id);
        
        // Definir estágios do projeto
        const stages = [
            { id: 'ideia', name: 'Ideia', icon: '💡', status: 'ideia' },
            { id: 'planejamento', name: 'Planejamento', icon: '📋', status: 'planejamento' },
            { id: 'desenvolvimento', name: 'Desenvolvimento', icon: '⚙️', status: 'andamento' },
            { id: 'testes', name: 'Testes', icon: '🧪', status: 'testes' },
            { id: 'conclusao', name: 'Conclusão', icon: '✅', status: 'conclusao' },
            { id: 'relatorio', name: 'Relatório', icon: '📄', status: 'concluido' }
        ];
        
        // Contar atividades por estágio
        const atividadePorStatus = {
            'ideia': atividades.filter(a => a.status === 'pendente').length,
            'planejamento': atividades.filter(a => a.status === 'planejamento').length,
            'andamento': atividades.filter(a => a.status === 'andamento').length,
            'testes': atividades.filter(a => a.status === 'testes').length,
            'conclusao': atividades.filter(a => a.status === 'concluido').length,
            'concluido': atividades.filter(a => a.status === 'relatorio').length
        };
        
        const total = atividades.length;
        const concluidas = atividades.filter(a => a.status === 'concluido').length;
        const progresso = total > 0 ? Math.round((concluidas / total) * 100) : 0;
        
        // Determinar estágio atual
        let currentStage = 0;
        if (progresso >= 100) currentStage = stages.length - 1;
        else if (progresso >= 80) currentStage = 4;
        else if (progresso >= 60) currentStage = 3;
        else if (progresso >= 40) currentStage = 2;
        else if (progresso >= 20) currentStage = 1;
        
        let html = '';
        stages.forEach((stage, idx) => {
            const isCompleted = idx < currentStage;
            const isActive = idx === currentStage;
            const count = atividadePorStatus[stage.status] || 0;
            
            html += `
                <div class="flow-stage">
                    <div class="flow-stage-node ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}" 
                         onclick="Mapa.filtrarPorEstagio('${stage.id}')">
                        <div class="stage-icon">${stage.icon}</div>
                        <div class="stage-name">${stage.name}</div>
                        <div class="stage-count">${count} atividade${count !== 1 ? 's' : ''}</div>
                    </div>
                </div>
            `;
        });
        
        const container = document.getElementById('flowStages');
        if (container) {
            container.innerHTML = html;
        }
        
        // Renderizar atividades filtradas por estágio
        this.renderAtividadesPorEstagio(projeto, atividades);
    },
    
    renderAtividadesPorEstagio(projeto, todasAtividades) {
        const grid = document.getElementById('atividadesGrid');
        if (!grid) return;
        
        // Agrupar atividades por status
        const porStatus = {
            'pendente': todasAtividades.filter(a => a.status === 'pendente'),
            'planejamento': todasAtividades.filter(a => a.status === 'planejamento'),
            'andamento': todasAtividades.filter(a => a.status === 'andamento'),
            'testes': todasAtividades.filter(a => a.status === 'testes'),
            'concluido': todasAtividades.filter(a => a.status === 'concluido')
        };
        
        let html = '<div class="atividades-por-estagio">';
        
        // Mostrar atividades de cada estágio
        Object.entries(porStatus).forEach(([status, atks]) => {
            if (atks.length > 0) {
                const statusLabel = {
                    'pendente': '💡 Ideia',
                    'planejamento': '📋 Planejamento', 
                    'andamento': '⚙️ Desenvolvimento',
                    'testes': '🧪 Testes',
                    'concluido': '✅ Concluído'
                }[status];
                
                const statusClass = status === 'concluido' ? 'success' : status === 'andamento' ? 'warning' : 'secondary';
                
                html += `
                    <div class="estagio-grupo" style="margin-bottom: 20px;">
                        <h4 style="margin-bottom: 8px; color: var(--text-secondary);">${statusLabel}</h4>
                        <div class="atividades-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 12px;">
                `;
                
                atks.forEach(a => {
                    html += `
                        <div class="atividade-card" onclick="Mapa.abrirAtividade('${a._id}')">
                            <div class="atividade-header">
                                <span class="badge badge-${statusClass}">${this.getStatusLabel(a.status)}</span>
                                ${a.prioridade ? `<span class="prioridade prioridade-${a.prioridade}">⚡ ${a.prioridade}</span>` : ''}
                            </div>
                            <h4>${this.escapeHtml(a.titulo)}</h4>
                            <p>${this.escapeHtml(a.descricao || '').substring(0, 60)}${a.descricao?.length > 60 ? '...' : ''}</p>
                            <div class="atividade-meta">
                                ${a.stack ? `<span class="stack-badge">${a.stack}</span>` : ''}
                            </div>
                        </div>
                    `;
                });
                
                html += '</div></div>';
            }
        });
        
        html += '</div>';
        grid.innerHTML = html || '<p class="empty-state">Nenhuma atividade. Clique em "+ Nova Atividade".</p>';
    },
    
    filtrarPorEstagio(estagioId) {
        // O filtro já é feito automaticamente pelo renderProjetoFluxo
        console.log('Filtrar por estágio:', estagioId);
    },

    abrirPainel(atividade) {
        const panel = document.getElementById('nodePanel');
        if (!panel || !atividade) return;

        panel.classList.add('active');
        document.getElementById('panelTitulo').textContent = atividade.titulo;
        document.getElementById('panelDescricao').textContent = atividade.descricao || 'Sem descrição';
        
        const statusBadge = document.getElementById('panelStatus');
        statusBadge.textContent = this.getStatusLabel(atividade.status);
        statusBadge.className = 'badge badge-' + (atividade.status === 'concluido' ? 'success' : atividade.status === 'andamento' ? 'warning' : 'secondary');
        
        document.getElementById('panelStack').textContent = atividade.stack || '-';
        document.getElementById('panelData').textContent = atividade.created_at ? new Date(atividade.created_at).toLocaleDateString('pt-BR') : '-';
        document.getElementById('panelPrioridade').textContent = atividade.prioridade || '-';
    },

    fecharPainel() {
        document.getElementById('nodePanel').classList.remove('active');
    },

    async atualizarStatus(id, status) {
        const data = this.getData();
        const atividade = data.atividades.find(a => a._id === id);
        if (!atividade) return;

        await DB.updateAtividade({ ...atividade, status });
        await this.loadData();
        this.fecharPainel();
    },

    excluirAtividadePainel() {
        if (this.atividadeAtual) {
            this.excluirAtividade(this.atividadeAtual._id);
            this.fecharPainel();
        }
    },

    fecharModal() {
        document.getElementById('atividadeModal').classList.remove('active');
    },

    exportarPDF() {
        alert('Exportar PDF em desenvolvimento!');
    }
};

document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM carregado, iniciando...');
    await Mapa.init();
    console.log('Mapa iniciado com sucesso');
});
