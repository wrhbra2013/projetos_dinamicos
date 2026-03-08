const App = {
    STORAGE_KEY: 'projetos_dinamicos_db',
    
    init() {
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
        
        this.setupTheme();
        this.setupModal();
    },
    
    getData() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY));
    },
    
    saveData(data) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    },
    
    setupTheme() {
        const themeBtn = document.getElementById('themeBtn');
        if (themeBtn) {
            themeBtn.addEventListener('click', () => {
                document.body.classList.toggle('light-theme');
                const isLight = document.body.classList.contains('light-theme');
                themeBtn.innerHTML = isLight ? '🌙' : '🌓';
                localStorage.setItem('theme', isLight ? 'light' : 'dark');
            });
            
            if (localStorage.getItem('theme') === 'light') {
                document.body.classList.add('light-theme');
                themeBtn.innerHTML = '🌙';
            }
        }
    },
    
    setupModal() {
        const modal = document.getElementById('projetoModal');
        const closeBtn = document.querySelector('#projetoModal .close-btn');
        const openBtn = document.getElementById('openModalBtn');
        const openCard = document.getElementById('openModalCard');
        
        if (modal && closeBtn) {
            closeBtn.onclick = () => modal.classList.remove('active');
            window.onclick = (event) => {
                if (event.target == modal) modal.classList.remove('active');
            };
        }
        
        if (openBtn) openBtn.onclick = () => modal.classList.add('active');
        if (openCard) openCard.onclick = () => modal.classList.add('active');
        
        const form = document.getElementById('formNovoProjeto');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.criarProjeto();
            });
        }
    },
    
    getProjetos() {
        return this.getData().projetos;
    },
    
    getProjeto(id) {
        return this.getProjetos().find(p => p.id === parseInt(id));
    },
    
    criarProjeto() {
        const nome = document.getElementById('nome').value;
        const descricao = document.getElementById('descricao').value;
        
        if (!nome) return;
        
        const data = this.getData();
        const projeto = {
            id: data.next_projeto_id,
            nome: nome,
            descricao: descricao,
            data_criacao: new Date().toISOString()
        };
        
        data.projetos.push(projeto);
        data.next_projeto_id++;
        this.saveData(data);
        
        document.getElementById('nome').value = '';
        document.getElementById('descricao').value = '';
        document.getElementById('projetoModal').classList.remove('active');
        
        this.renderDashboard();
    },
    
    excluirProjeto(id) {
        if (!confirm('Tem certeza que deseja excluir este projeto?')) return;
        
        const data = this.getData();
        data.projetos = data.projetos.filter(p => p.id !== parseInt(id));
        data.atividades = data.atividades.filter(a => a.projeto_id !== parseInt(id));
        this.saveData(data);
        
        this.renderDashboard();
    },
    
    getAtividades(filtros = {}) {
        let atividades = this.getData().atividades;
        
        if (filtros.projeto_id) {
            atividades = atividades.filter(a => a.projeto_id === parseInt(filtros.projeto_id));
        }
        if (filtros.prioridade) {
            atividades = atividades.filter(a => a.prioridade === filtros.prioridade);
        }
        if (filtros.status) {
            atividades = atividades.filter(a => a.status === filtros.status);
        }
        
        return atividades.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    },
    
    getNomeProjeto(projetoId) {
        const projeto = this.getProjeto(projetoId);
        return projeto ? projeto.nome : 'Sem Projeto';
    },
    
    renderDashboard() {
        const projetos = this.getProjetos();
        const grid = document.getElementById('projectsGrid');
        
        if (!grid) return;
        
        let html = '';
        
        projetos.forEach(p => {
            const dataCriacao = p.data_criacao ? new Date(p.data_criacao).toLocaleDateString('pt-BR') : '--/--/----';
            html += `
                <div class="project-card">
                    <div class="card-header">
                        <h3>${this.escapeHtml(p.nome)}</h3>
                        <form onsubmit="event.preventDefault(); App.excluirProjeto(${p.id})" class="delete-form">
                            <button type="submit" class="delete-btn" title="Excluir Projeto">🗑️</button>
                        </form>
                    </div>
                    <div class="card-body">
                        <p class="descricao">${this.escapeHtml(p.descricao || '')}</p>
                        <p class="data">Criado em: ${dataCriacao}</p>
                    </div>
                    <div class="card-footer">
                        <a href="projeto.html?id=${p.id}" class="btn btn-secondary">Ver Atividades</a>
                    </div>
                </div>
            `;
        });
        
        html += `
            <div class="project-card add-card" id="openModalCard">
                <div class="add-icon">+</div>
                <p>Novo Projeto</p>
            </div>
        `;
        
        grid.innerHTML = html;
        
        const openCard = document.getElementById('openModalCard');
        const modal = document.getElementById('projetoModal');
        if (openCard && modal) {
            openCard.onclick = () => modal.classList.add('active');
        }
        
        this.renderStatusBoard();
    },
    
    renderStatusBoard() {
        const atividades = this.getAtividades();
        const projetos = this.getProjetos();
        const projetosMap = {};
        projetos.forEach(p => projetosMap[p.id] = p.nome);
        
        const planejamentos = atividades.filter(a => a.status === 'planejamento');
        const andamentos = atividades.filter(a => a.status === 'andamento');
        const concluidos = atividades.filter(a => a.status === 'concluido');
        
        this.renderStatusColumn('planejamentoCards', planejamentos, projetosMap);
        this.renderStatusColumn('andamentoCards', andamentos, projetosMap);
        this.renderStatusColumn('concluidoCards', concluidos, projetosMap);
    },
    
    renderStatusColumn(elementId, atividades, projetosMap) {
        const el = document.getElementById(elementId);
        if (!el) return;
        
        let html = '';
        atividades.forEach(a => {
            const prioridadeClass = (a.prioridade || 'baixa').toLowerCase().split(' ')[0];
            html += `
                <div class="status-card">
                    <div class="status-card-header">
                        <strong>${this.escapeHtml(a.nome)}</strong>
                    </div>
                    <p class="status-projeto">${this.escapeHtml(projetosMap[a.projeto_id] || 'Sem Projeto')}</p>
                    <div class="status-meta">
                        <span class="badge badge-${prioridadeClass}">${this.escapeHtml(a.prioridade || 'Baixa')}</span>
                        <span class="stack-badge">${this.escapeHtml(a.stack)}</span>
                    </div>
                    <a href="projeto.html?id=${a.projeto_id}" class="btn btn-sm">Ver</a>
                </div>
            `;
        });
        
        el.innerHTML = html;
    },
    
    adicionarAtividade(projetoId) {
        const nome = document.getElementById('nomeAtividade').value;
        const stackSelect = document.getElementById('stackSelect');
        let stack = stackSelect.value;
        if (stack === 'outro') {
            stack = document.getElementById('newStackInput').value || 'Outro';
        }
        const prioridade = document.getElementById('prioridadeSelect').value;
        const relatorio = document.getElementById('relatorioInput').value;
        
        if (!nome) return;
        
        const data = this.getData();
        const atividade = {
            id: data.next_atividade_id,
            projeto_id: parseInt(projetoId),
            nome: nome,
            stack: stack,
            data_hora: new Date().toISOString(),
            prioridade: prioridade,
            relatorio: relatorio,
            status: 'planejamento',
            created_at: new Date().toISOString()
        };
        
        data.atividades.push(atividade);
        data.next_atividade_id++;
        this.saveData(data);
        
        document.getElementById('nomeAtividade').value = '';
        document.getElementById('newStackInput').value = '';
        document.getElementById('relatorioInput').value = '';
        stackSelect.value = 'frontend';
        
        this.renderAtividades(projetoId);
    },
    
    renderAtividades(projetoId) {
        const atividades = this.getAtividades({ projeto_id: projetoId });
        const grid = document.getElementById('atividadesGrid');
        
        if (!grid) return;
        
        if (atividades.length === 0) {
            grid.innerHTML = '<p class="empty-msg">Nenhuma atividade para este projeto.</p>';
            return;
        }
        
        let html = '';
        atividades.forEach(a => {
            const dataFormatada = a.data_hora ? new Date(a.data_hora).toLocaleString('pt-BR') : '-';
            const prioridadeClass = (a.prioridade || 'baixa').toLowerCase();
            html += `
                <div class="activity-card">
                    <div class="activity-content">
                        <div class="activity-header">
                            <strong>${this.escapeHtml(a.nome)}</strong>
                            <span class="badge badge-${prioridadeClass}">${this.escapeHtml(a.prioridade)}</span>
                        </div>
                        <p class="meta">🛠️ ${this.escapeHtml(a.stack)} | 📅 ${dataFormatada}</p>
                        <p class="desc">${this.escapeHtml(a.relatorio)}</p>
                    </div>
                    <div class="activity-actions">
                        <select onchange="App.atualizarStatus(${a.id}, this.value, ${projetoId})" class="select-sm">
                            <option value="planejamento" ${a.status === 'planejamento' ? 'selected' : ''}>Planejamento</option>
                            <option value="andamento" ${a.status === 'andamento' ? 'selected' : ''}>Em Andamento</option>
                            <option value="concluido" ${a.status === 'concluido' ? 'selected' : ''}>Concluído</option>
                        </select>
                        <button onclick="App.excluirAtividade(${a.id}, ${projetoId})" class="btn-delete" title="Excluir">🗑️</button>
                    </div>
                </div>
            `;
        });
        
        grid.innerHTML = html;
    },
    
    atualizarStatus(atividadeId, novoStatus, projetoId) {
        const data = this.getData();
        const atividade = data.atividades.find(a => a.id === atividadeId);
        if (atividade) {
            atividade.status = novoStatus;
            this.saveData(data);
            this.renderAtividades(projetoId);
        }
    },
    
    excluirAtividade(atividadeId, projetoId) {
        if (!confirm('Excluir esta atividade?')) return;
        
        const data = this.getData();
        data.atividades = data.atividades.filter(a => a.id !== atividadeId);
        this.saveData(data);
        
        this.renderAtividades(projetoId);
    },
    
    popularSelectProjetos() {
        const select = document.getElementById('projeto_id');
        if (!select) return;
        
        const projetos = this.getProjetos();
        let html = '<option value="">Todos</option>';
        projetos.forEach(p => {
            html += `<option value="${p.id}">${this.escapeHtml(p.nome)}</option>`;
        });
        select.innerHTML = html;
    },
    
    renderRelatorio() {
        const params = new URLSearchParams(window.location.search);
        const filtros = {
            projeto_id: params.get('projeto_id') || null,
            prioridade: params.get('prioridade') || null,
            status: params.get('status') || null
        };
        
        const atividades = this.getAtividades(filtros);
        const projetos = this.getProjetos();
        const projetosMap = {};
        projetos.forEach(p => projetosMap[p.id] = p.nome);
        
        const tbody = document.getElementById('tabelaRelatorio');
        if (!tbody) return;
        
        let html = '';
        atividades.forEach(a => {
            const dataFormatada = a.data_hora ? new Date(a.data_hora).toLocaleString('pt-BR') : '-';
            const prioridadeClass = (a.prioridade || 'baixa').toLowerCase();
            const statusClass = (a.status || 'planejamento');
            html += `
                <tr>
                    <td><strong>${this.escapeHtml(projetosMap[a.projeto_id] || 'Sem Projeto')}</strong></td>
                    <td>${this.escapeHtml(a.nome)}</td>
                    <td><span class="badge" style="background: rgba(99, 102, 241, 0.1); border: 1px solid var(--accent);">${this.escapeHtml(a.stack)}</span></td>
                    <td>${dataFormatada}</td>
                    <td><span class="badge badge-${prioridadeClass}">${this.escapeHtml(a.prioridade)}</span></td>
                    <td><span class="status-dot status-${statusClass}"></span> ${this.capitalize(a.status)}</td>
                    <td>
                        <button onclick="App.excluirAtividadeRelatorio(${a.id})" class="btn-delete" title="Excluir Atividade">🗑️</button>
                    </td>
                </tr>
            `;
        });
        
        if (atividades.length === 0) {
            html = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: var(--text-secondary);">Nenhuma atividade encontrada para os filtros aplicados.</td></tr>';
        }
        
        tbody.innerHTML = html;
        
        const totalEl = document.getElementById('totalRegistros');
        if (totalEl) totalEl.textContent = atividades.length;
    },
    
    excluirAtividadeRelatorio(atividadeId) {
        if (!confirm('Excluir esta atividade permanentemente?')) return;
        
        const data = this.getData();
        data.atividades = data.atividades.filter(a => a.id !== atividadeId);
        this.saveData(data);
        
        this.renderRelatorio();
    },
    
    renderFluxograma() {
        const atividades = this.getAtividades();
        const projetos = this.getProjetos();
        
        const projetosAgrupados = {};
        projetos.forEach(p => {
            projetosAgrupados[p.id] = {
                nome: p.nome,
                atividades: [],
                total: 0,
                concluidas: 0
            };
        });
        
        atividades.forEach(a => {
            if (!projetosAgrupados[a.projeto_id]) {
                projetosAgrupados[a.projeto_id] = {
                    nome: 'Sem Projeto',
                    atividades: [],
                    total: 0,
                    concluidas: 0
                };
            }
            projetosAgrupados[a.projeto_id].atividades.push(a);
            projetosAgrupados[a.projeto_id].total++;
            if (a.status === 'concluido') {
                projetosAgrupados[a.projeto_id].concluidas++;
            }
        });
        
        const summaryEl = document.getElementById('projectsSummary');
        let summaryHtml = '';
        
        const mermaidLines = ['graph LR'];
        mermaidLines.push('classDef concluido fill:#cfe8cf,stroke:#2d8a2d;');
        mermaidLines.push('classDef andamento fill:#fff3b0,stroke:#e6b800;');
        mermaidLines.push('classDef planejamento fill:#f0f0f0,stroke:#888888;');
        
        Object.values(projetosAgrupados).forEach(p => {
            if (p.total === 0) return;
            
            const pct = Math.round((p.concluidas / p.total) * 100);
            summaryHtml += `
                <div class="project-card-sm">
                    <strong>${this.escapeHtml(p.nome)}</strong>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${pct}%"></div>
                    </div>
                    <small>${p.concluidas} / ${p.total} concluídas (${pct}%)</small>
                </div>
            `;
            
            mermaidLines.push(`subgraph "${p.nome} (${pct}%)"`);
            p.atividades.forEach(a => {
                const statusTxt = a.status || 'planejamento';
                const anome = (a.nome || '').replace(/"/g, '');
                mermaidLines.push(`A${a.id}["${anome}\\n(${statusTxt})"]`);
                
                let cls = 'planejamento';
                if (statusTxt === 'concluido') cls = 'concluido';
                else if (statusTxt === 'andamento') cls = 'andamento';
                mermaidLines.push(`class A${a.id} ${cls};`);
            });
            mermaidLines.push('end');
        });
        
        if (summaryEl) summaryEl.innerHTML = summaryHtml;
        
        const mermaidEl = document.getElementById('mermaidChart');
        if (mermaidEl) {
            mermaidEl.innerHTML = mermaidLines.join('\n');
            mermaid.run({ nodes: [mermaidEl] });
        }
    },
    
    gerarPDF() {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        
        const params = new URLSearchParams(window.location.search);
        const filtros = {
            projeto_id: params.get('projeto_id') || null,
            prioridade: params.get('prioridade') || null,
            status: params.get('status') || null
        };
        
        const atividades = this.getAtividades(filtros);
        const projetos = this.getProjetos();
        
        const projetosStats = {};
        projetos.forEach(p => {
            projetosStats[p.id] = {
                nome: p.nome,
                total: 0,
                concluidas: 0,
                atividades: []
            };
        });
        
        atividades.forEach(a => {
            if (!projetosStats[a.projeto_id]) {
                projetosStats[a.projeto_id] = {
                    nome: 'Sem Projeto',
                    total: 0,
                    concluidas: 0,
                    atividades: []
                };
            }
            projetosStats[a.projeto_id].total++;
            projetosStats[a.projeto_id].atividades.push(a);
            if (a.status === 'concluido') {
                projetosStats[a.projeto_id].concluidas++;
            }
        });
        
        doc.setFontSize(16);
        doc.text('Relatório de Atividades - Resumo', 105, 20, { align: 'center' });
        
        doc.setFontSize(11);
        let y = 35;
        
        Object.values(projetosStats).forEach(p => {
            if (p.total === 0) return;
            
            const pct = Math.round((p.concluidas / p.total) * 100);
            
            doc.setFontSize(12);
            doc.setFont(undefined, 'bold');
            doc.text(`Projeto: ${p.nome} — ${p.concluidas}/${p.total} concluídas (${p.pct || pct}%)`, 15, y);
            y += 7;
            
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            const barLen = 30;
            const filled = Math.round((pct * barLen) / 100);
            const bar = '[' + ('#'.repeat(filled)) + ('-'.repeat(barLen - filled)) + `] ${pct}%`;
            doc.text(bar, 15, y);
            y += 6;
            
            p.atividades.slice(0, 10).forEach(a => {
                const dataStr = a.data_hora ? new Date(a.data_hora).toLocaleDateString('pt-BR') : '-';
                const line = `- ${a.nome} | Data: ${dataStr} | Prioridade: ${a.prioridade} | Status: ${a.status}`;
                doc.text(line.substring(0, 80), 15, y);
                y += 5;
            });
            
            if (p.atividades.length > 10) {
                doc.text('... (mais atividades não listadas)', 15, y);
                y += 5;
            }
            
            y += 4;
        });
        
        doc.setFontSize(12);
        doc.setFont(undefined, 'bold');
        doc.text('Auditoria Rápida e Recomendações', 15, y);
        y += 7;
        
        doc.setFontSize(9);
        doc.setFont(undefined, 'normal');
        const recomendacoes = [
            '- Verificar validação de entradas no frontend.',
            '- Habilitar backups regulares dos dados (exportar JSON).',
            '- Considerar usar serviço externo para persistência.',
            '- Adicionar testes automatizados.'
        ];
        recomendacoes.forEach(r => {
            doc.text(r, 15, y);
            y += 5;
        });
        
        doc.save('relatorio_resumo.pdf');
    },
    
    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    capitalize(str) {
        if (!str) return '';
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
};
