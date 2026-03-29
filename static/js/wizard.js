// ========== Wizard de Criação de Projetos ==========
const Wizard = {
    currentStep: 1,
    totalSteps: 5,
    selectedTemplate: null,
    templates: [],
    data: {
        nome: '',
        descricao: '',
        data_inicio: '',
        data_fim: '',
        orcamento: 0,
        escopo: { inclui: [], nao_inclui: [] },
        stakeholders: '',
        equipe: '',
        responsavel: ''
    },

    async init() {
        await this.loadTemplates();
        this.setupEventListeners();
        this.updateUI();
    },

    async loadTemplates() {
        try {
            this.templates = await ApiClient.getTemplates();
            this.renderTemplates();
        } catch (error) {
            console.error('Erro ao carregar templates:', error);
        }
    },

    setupEventListeners() {
        document.getElementById('wizardNome')?.addEventListener('input', (e) => {
            this.data.nome = e.target.value;
            this.updateViabilidade();
        });

        document.getElementById('wizardDescricao')?.addEventListener('input', (e) => {
            this.data.descricao = e.target.value;
        });

        document.getElementById('wizardDataInicio')?.addEventListener('change', (e) => {
            this.data.data_inicio = e.target.value;
        });

        document.getElementById('wizardDataFim')?.addEventListener('change', (e) => {
            this.data.data_fim = e.target.value;
        });

        document.getElementById('wizardOrcamento')?.addEventListener('input', (e) => {
            this.data.orcamento = parseFloat(e.target.value) || 0;
        });

        document.getElementById('wizardEscopoInclui')?.addEventListener('input', (e) => {
            this.data.escopo.inclui = e.target.value.split('\n').filter(s => s.trim());
        });

        document.getElementById('wizardEscopoNaoInclui')?.addEventListener('input', (e) => {
            this.data.escopo.nao_inclui = e.target.value.split('\n').filter(s => s.trim());
        });

        document.getElementById('wizardStakeholders')?.addEventListener('input', (e) => {
            this.data.stakeholders = e.target.value;
        });

        document.getElementById('wizardEquipe')?.addEventListener('input', (e) => {
            this.data.equipe = e.target.value;
        });

        document.getElementById('wizardResponsavel')?.addEventListener('input', (e) => {
            this.data.responsavel = e.target.value;
        });
    },

    renderTemplates() {
        const container = document.getElementById('templatesGrid');
        if (!container) return;

        const icons = {
            'desenvolvimento': '💻',
            'produto': '📦',
            'infra': '☁️',
            'personalizado': '⚙️'
        };

        container.innerHTML = this.templates.map(tpl => `
            <div class="template-card ${this.selectedTemplate === tpl.id ? 'selected' : ''}" 
                 data-id="${tpl.id}" onclick="Wizard.selectTemplate('${tpl.id}')">
                <div class="template-icon">${icons[tpl.categoria] || '📋'}</div>
                <div class="template-nome">${tpl.nome}</div>
                <div class="template-desc">${tpl.descricao}</div>
            </div>
        `).join('');
    },

    selectTemplate(id) {
        this.selectedTemplate = id;
        
        document.querySelectorAll('.template-card').forEach(card => {
            card.classList.toggle('selected', card.dataset.id === id);
        });

        const template = this.templates.find(t => t.id === id);
        if (template) {
            this.renderAtividadesPreview(template.atividades || []);
        }
    },

    renderAtividadesPreview(atividades) {
        const container = document.getElementById('atividadesPreview');
        if (!container) return;

        container.innerHTML = atividades.map(atk => `
            <div class="atividade-preview-item">
                <span class="atividade-preview-nome">${atk.titulo}</span>
                <span class="atividade-preview-meta">${atk.stack || 'gestao'} • ${atk.horas_estimadas || 0}h</span>
            </div>
        `).join('');
    },

    updateViabilidade() {
        const container = document.getElementById('viabilidadeContent');
        if (!container) return;

        const nome = this.data.nome.toLowerCase();
        const template = this.templates.find(t => t.id === this.selectedTemplate);
        
        let complexidade = 'baixa';
        let risco = 'baixa';
        let estimacao = 0;

        if (template && template.atividades) {
            estimacao = template.atividades.reduce((sum, atk) => sum + (atk.horas_estimadas || 0), 0);
            complexidade = estimacao > 100 ? 'alta' : (estimacao > 40 ? 'media' : 'baixa');
            risco = complexidade === 'alta' ? 'media' : 'baixa';
        }

        if (nome.includes('api') || nome.includes('sistema')) {
            risco = risco === 'baixa' ? 'media' : 'alta';
            complexidade = complexidade === 'baixa' ? 'media' : 'alta';
        }

        container.innerHTML = `
            <div class="viabilidade-item">
                <span class="viabilidade-label">Complexidade</span>
                <span class="viabilidade-value ${complexidade}">${complexidade.toUpperCase()}</span>
            </div>
            <div class="viabilidade-item">
                <span class="viabilidade-label">Risco</span>
                <span class="viabilidade-value ${risco}">${risco.toUpperCase()}</span>
            </div>
            <div class="viabilidade-item">
                <span class="viabilidade-label">Horas Estimadas</span>
                <span class="viabilidade-value">${estimacao}h</span>
            </div>
        `;
    },

    updateUI() {
        // Update steps
        document.querySelectorAll('.wizard-step').forEach(step => {
            const stepNum = parseInt(step.dataset.step);
            step.classList.toggle('active', stepNum === this.currentStep);
            step.classList.toggle('completed', stepNum < this.currentStep);
        });

        // Update panels
        document.querySelectorAll('.wizard-panel').forEach(panel => {
            const panelNum = parseInt(panel.dataset.panel);
            panel.classList.toggle('active', panelNum === this.currentStep);
        });

        // Update buttons
        const prevBtn = document.getElementById('wizardPrev');
        const nextBtn = document.getElementById('wizardNext');
        
        if (prevBtn) prevBtn.disabled = this.currentStep === 1;
        if (nextBtn) {
            nextBtn.disabled = this.currentStep === this.totalSteps;
            nextBtn.textContent = this.currentStep === this.totalSteps ? 'Criar Projeto' : 'Próximo →';
        }

        // Update resumo on step 5
        if (this.currentStep === 5) {
            this.renderResumo();
        }
    },

    renderResumo() {
        const container = document.getElementById('resumoProjeto');
        if (!container) return;

        const template = this.templates.find(t => t.id === this.selectedTemplate);
        const numAtividades = template?.atividades?.length || 0;
        
        const duracao = this.data.data_inicio && this.data.data_fim 
            ? Math.ceil((new Date(this.data.data_fim) - new Date(this.data.data_inicio)) / (1000 * 60 * 60 * 24))
            : '-';

        container.innerHTML = `
            <div class="resumo-item">
                <span class="resumo-label">Template</span>
                <span class="resumo-value">${template?.nome || 'Nenhum'}</span>
            </div>
            <div class="resumo-item">
                <span class="resumo-label">Nome</span>
                <span class="resumo-value">${this.data.nome || '-'}</span>
            </div>
            <div class="resumo-item">
                <span class="resumo-label">Descrição</span>
                <span class="resumo-value">${this.data.descricao || '-'}</span>
            </div>
            <div class="resumo-item">
                <span class="resumo-label">Período</span>
                <span class="resumo-value">${this.formatDate(this.data.data_inicio)} - ${this.formatDate(this.data.data_fim)} (${duracao} dias)</span>
            </div>
            <div class="resumo-item">
                <span class="resumo-label">Orçamento</span>
                <span class="resumo-value">R$ ${this.formatMoney(this.data.orcamento)}</span>
            </div>
            <div class="resumo-item">
                <span class="resumo-label">Atividades</span>
                <span class="resumo-value">${numAtividades} atividades do template</span>
            </div>
            <div class="resumo-item">
                <span class="resumo-label">Equipe</span>
                <span class="resumo-value">${this.data.equipe || '-'}</span>
            </div>
            <div class="resumo-item">
                <span class="resumo-label">Responsável</span>
                <span class="resumo-value">${this.data.responsavel || '-'}</span>
            </div>
        `;
    },

    async validarStep(step) {
        switch(step) {
            case 1:
                if (!this.selectedTemplate) {
                    alert('Por favor, selecione um template');
                    return false;
                }
                return true;
            case 2:
                if (!this.data.nome.trim()) {
                    alert('Por favor, insira o nome do projeto');
                    return false;
                }
                return true;
            case 3:
                return true;
            case 4:
                return true;
            default:
                return true;
        }
    },

    async proximo() {
        if (!(await this.validarStep(this.currentStep))) return;

        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.updateUI();
        } else {
            await this.criarProjeto();
        }
    },

    voltar() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateUI();
        }
    },

    async criarProjeto() {
        try {
            const template = this.templates.find(t => t.id === this.selectedTemplate);
            
            const projeto = {
                nome: this.data.nome,
                descricao: this.data.descricao,
                status: 'planejamento',
                template: this.selectedTemplate,
                data_inicio: this.data.data_inicio,
                data_fim: this.data.data_fim,
                orcamento: this.data.orcamento,
                escopo: this.data.escopo,
                stakeholders: this.data.stakeholders.split(',').map(s => s.trim()).filter(s => s),
                equipe: this.data.equipe.split(',').map(s => s.trim()).filter(s => s),
                responsavel: this.data.responsavel
            };

            const novoProjeto = await ApiClient.createProjeto(projeto);
            
            // Criar atividades do template
            if (template && template.atividades) {
                let dependenciaAnterior = '';
                
                for (const atk of template.atividades) {
                    const atividade = {
                        projeto_id: novoProjeto.id,
                        titulo: atk.titulo,
                        descricao: '',
                        status: 'pendente',
                        stack: atk.stack || 'outro',
                        prioridade: atk.prioridade || 'media',
                        dependencia: dependenciaAnterior,
                        horas_estimadas: atk.horas_estimadas || 0,
                        equipe: '',
                        responsavel: ''
                    };
                    
                    const novaAtividade = await ApiClient.createAtividade(atividade);
                    dependenciaAnterior = novaAtividade.id;
                }
            }

            alert('Projeto criado com sucesso!');
            this.reset();
            
            // Navigate to dashboard
            document.getElementById('page-dashboard').checked = true;
            
            // Recarregar dados
            if (window.Mapa && typeof Mapa.loadData === 'function') {
                await Mapa.loadData();
            }

        } catch (error) {
            console.error('Erro ao criar projeto:', error);
            alert('Erro ao criar projeto: ' + error.message);
        }
    },

    reset() {
        this.currentStep = 1;
        this.selectedTemplate = null;
        this.data = {
            nome: '',
            descricao: '',
            data_inicio: '',
            data_fim: '',
            orcamento: 0,
            escopo: { inclui: [], nao_inclui: [] },
            stakeholders: '',
            equipe: '',
            responsavel: ''
        };

        // Clear form fields
        document.getElementById('wizardNome').value = '';
        document.getElementById('wizardDescricao').value = '';
        document.getElementById('wizardDataInicio').value = '';
        document.getElementById('wizardDataFim').value = '';
        document.getElementById('wizardOrcamento').value = '';
        document.getElementById('wizardEscopoInclui').value = '';
        document.getElementById('wizardEscopoNaoInclui').value = '';
        document.getElementById('wizardStakeholders').value = '';
        document.getElementById('wizardEquipe').value = '';
        document.getElementById('wizardResponsavel').value = '';

        this.renderTemplates();
        this.updateUI();
    },

    formatDate(dateStr) {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR');
    },

    formatMoney(value) {
        return new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(value);
    }
};

window.Wizard = Wizard;
