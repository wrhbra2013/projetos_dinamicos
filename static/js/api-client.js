/**
 * API Client - Projetos Dinâmicos
 * Suporta PHP API (SQLite) + Fallback LocalStorage
 */

const ApiClient = {
    API_URL: 'api.php',
    USE_API: false,
    SYNC_ENABLED: true,
    lastSync: null,

    async init() {
        try {
            const response = await fetch(`${this.API_URL}?action=health`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    this.USE_API = true;
                    console.log('✓ API SQLite conectada:', data.data.db);
                    await this.syncFromServer();
                }
            }
        } catch (e) {
            console.log('⚠ API não disponível, usando localStorage');
            this.USE_API = false;
        }
    },

    async request(action, method = 'GET', data = null) {
        const options = {
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        
        if (data && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
            options.body = JSON.stringify(data);
        }
        
        const url = method === 'GET' && data ? `${this.API_URL}?action=${action}&${new URLSearchParams(data)}` : `${this.API_URL}?action=${action}`;
        
        try {
            const response = await fetch(url, options);
            return await response.json();
        } catch (e) {
            console.error('API request failed:', e);
            return { success: false, error: e.message };
        }
    },

    async syncFromServer() {
        try {
            const response = await this.request('sync', 'GET');
            if (response.success && response.data) {
                if (response.data.projetos) {
                    localStorage.setItem('pd_projetos', JSON.stringify(response.data.projetos));
                }
                if (response.data.atividades) {
                    localStorage.setItem('pd_atividades', JSON.stringify(response.data.atividades));
                }
                this.lastSync = Date.now();
                console.log('✓ Dados sincronizados do servidor');
            }
        } catch (e) {
            console.error('Sync failed:', e);
        }
    },

    async syncToServer() {
        if (!this.USE_API || !this.SYNC_ENABLED) return;
        
        try {
            const projetos = JSON.parse(localStorage.getItem('pd_projetos') || '[]');
            const atividades = JSON.parse(localStorage.getItem('pd_atividades') || '[]');
            
            await this.request('sync', 'POST', { projetos, atividades });
            this.lastSync = Date.now();
            console.log('✓ Dados sincronizados para o servidor');
        } catch (e) {
            console.error('Sync to server failed:', e);
        }
    },

    clearCache() {},

    // Projetos
    async getProjetos() {
        if (this.USE_API) {
            const response = await this.request('projetos', 'GET');
            if (response.success) {
                localStorage.setItem('pd_projetos', JSON.stringify(response.data));
                return response.data;
            }
        }
        return JSON.parse(localStorage.getItem('pd_projetos') || '[]');
    },

    async createProjeto(data) {
        const projeto = {
            id: 'proj_' + Date.now(),
            nome: data.nome || 'Novo Projeto',
            descricao: data.descricao || '',
            status: data.status || 'planejamento',
            template: data.template || null,
            stakeholders: data.stakeholders || [],
            objetivos: data.objetivos || [],
            escopo: data.escopo || { inclui: [], nao_inclui: [] },
            data_inicio: data.data_inicio || new Date().toISOString().split('T')[0],
            data_fim: data.data_fim || null,
            orcamento: data.orcamento || 0,
            equipe: data.equipe || [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        if (this.USE_API) {
            const response = await this.request('projetos', 'POST', projeto);
            if (response.success) {
                await this.syncToServer();
                return response.data;
            }
        }

        const projetos = await this.getProjetos();
        projetos.push(projeto);
        localStorage.setItem('pd_projetos', JSON.stringify(projetos));
        return projeto;
    },

    async updateProjeto(data) {
        if (this.USE_API) {
            const response = await this.request('projetos', 'PUT', data);
            if (response.success) {
                await this.syncToServer();
                return response.data;
            }
        }

        const projetos = await this.getProjetos();
        const index = projetos.findIndex(p => p.id === data.id);
        if (index !== -1) {
            projetos[index] = { ...projetos[index], ...data, updated_at: new Date().toISOString() };
            localStorage.setItem('pd_projetos', JSON.stringify(projetos));
            return projetos[index];
        }
        return null;
    },

    async deleteProjeto(id) {
        if (this.USE_API) {
            const response = await this.request('projetos', 'DELETE', { id });
            if (response.success) {
                await this.syncToServer();
                return true;
            }
        }

        let projetos = await this.getProjetos();
        projetos = projetos.filter(p => p.id !== id);
        localStorage.setItem('pd_projetos', JSON.stringify(projetos));

        let atividades = await this.getAtividades();
        atividades = atividades.filter(a => a.projeto_id !== id);
        localStorage.setItem('pd_atividades', JSON.stringify(atividades));

        return true;
    },

    // Atividades
    async getAtividades(projeto_id = null) {
        if (this.USE_API) {
            const response = await this.request('atividades', 'GET', projeto_id ? { projeto_id } : {});
            if (response.success) {
                localStorage.setItem('pd_atividades', JSON.stringify(response.data));
                return response.data;
            }
        }
        
        let atividades = JSON.parse(localStorage.getItem('pd_atividades') || '[]');
        if (projeto_id) {
            atividades = atividades.filter(a => a.projeto_id === projeto_id);
        }
        return atividades;
    },

    async createAtividade(data) {
        const atividade = {
            id: 'atk_' + Date.now(),
            projeto_id: data.projeto_id || '',
            titulo: data.titulo || 'Nova Atividade',
            descricao: data.descricao || '',
            status: data.status || 'pendente',
            stack: data.stack || 'outro',
            prioridade: data.prioridade || 'media',
            dependencia: data.dependencia || '',
            equipe: data.equipe || '',
            responsavel: data.responsavel || '',
            data_inicio: data.data_inicio || new Date().toISOString().split('T')[0],
            data_fim: data.data_fim || null,
            horas_estimadas: data.horas_estimadas || 0,
            horas_realizadas: data.horas_realizadas || 0,
            tags: data.tags || [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        if (this.USE_API) {
            const response = await this.request('atividades', 'POST', atividade);
            if (response.success) {
                await this.syncToServer();
                return response.data;
            }
        }

        const atividades = await this.getAtividades();
        atividades.push(atividade);
        localStorage.setItem('pd_atividades', JSON.stringify(atividades));
        return atividade;
    },

    async updateAtividade(data) {
        if (this.USE_API) {
            const response = await this.request('atividades', 'PUT', data);
            if (response.success) {
                await this.syncToServer();
                return response.data;
            }
        }

        let atividades = await this.getAtividades();
        const index = atividades.findIndex(a => a.id === data.id);
        if (index !== -1) {
            atividades[index] = { ...atividades[index], ...data, updated_at: new Date().toISOString() };
            localStorage.setItem('pd_atividades', JSON.stringify(atividades));
            return atividades[index];
        }
        return null;
    },

    async deleteAtividade(id) {
        if (this.USE_API) {
            const response = await this.request('atividades', 'DELETE', { id });
            if (response.success) {
                await this.syncToServer();
                return true;
            }
        }

        let atividades = await this.getAtividades();
        atividades = atividades.filter(a => a.id !== id);
        localStorage.setItem('pd_atividades', JSON.stringify(atividades));
        return true;
    },

    // Templates
    async getTemplates() {
        if (this.USE_API) {
            const response = await this.request('templates', 'GET');
            if (response.success) {
                localStorage.setItem('pd_templates', JSON.stringify(response.data));
                return response.data;
            }
        }
        return JSON.parse(localStorage.getItem('pd_templates') || '[]');
    },

    // Lições
    async getLicoes(projeto_id = null) {
        if (this.USE_API) {
            const response = await this.request('licoes', 'GET', projeto_id ? { projeto_id } : {});
            return response.success ? response.data : [];
        }
        let licoes = JSON.parse(localStorage.getItem('pd_licoes') || '[]');
        if (projeto_id) {
            licoes = licoes.filter(l => l.projeto_id === projeto_id);
        }
        return licoes;
    },

    async createLicao(data) {
        const licao = {
            id: 'lic_' + Date.now(),
            projeto_id: data.projeto_id || '',
            tipo: data.tipo || 'positiva',
            categoria: data.categoria || 'processo',
            descricao: data.descricao || '',
            acao: data.acao || '',
            impacto: data.impacto || 'medio',
            autor: data.autor || '',
            created_at: new Date().toISOString()
        };

        if (this.USE_API) {
            const response = await this.request('licoes', 'POST', licao);
            if (response.success) return response.data;
        }

        const licoes = JSON.parse(localStorage.getItem('pd_licoes') || '[]');
        licoes.push(licao);
        localStorage.setItem('pd_licoes', JSON.stringify(licoes));
        return licao;
    },

    async deleteLicao(id) {
        if (this.USE_API) {
            const response = await this.request('licoes', 'DELETE', { id });
            if (response.success) return true;
        }

        let licoes = JSON.parse(localStorage.getItem('pd_licoes') || '[]');
        licoes = licoes.filter(l => l.id !== id);
        localStorage.setItem('pd_licoes', JSON.stringify(licoes));
        return true;
    },

    // Backup/Restore
    exportAll() {
        return {
            projetos: JSON.parse(localStorage.getItem('pd_projetos') || '[]'),
            atividades: JSON.parse(localStorage.getItem('pd_atividades') || '[]'),
            templates: JSON.parse(localStorage.getItem('pd_templates') || '[]'),
            licoes: JSON.parse(localStorage.getItem('pd_licoes') || '[]'),
            exportedAt: new Date().toISOString()
        };
    },

    importAll(data) {
        if (data.projetos) {
            localStorage.setItem('pd_projetos', JSON.stringify(data.projetos));
        }
        if (data.atividades) {
            localStorage.setItem('pd_atividades', JSON.stringify(data.atividades));
        }
        if (data.templates) {
            localStorage.setItem('pd_templates', JSON.stringify(data.templates));
        }
        if (data.licoes) {
            localStorage.setItem('pd_licoes', JSON.stringify(data.licoes));
        }
        if (this.USE_API) {
            this.syncToServer();
        }
    },

    clearAll() {
        localStorage.removeItem('pd_projetos');
        localStorage.removeItem('pd_atividades');
        localStorage.removeItem('pd_templates');
        localStorage.removeItem('pd_licoes');
    }
};

// Initialize on load
ApiClient.init();

// Legacy compatibility
window.ApiClient = ApiClient;
window.API = ApiClient;

// ========== DB Layer ==========
const DB = {
    async init() {
        console.log('DB initialized with API + localStorage fallback');
        return true;
    },

    async getAllProjetos() {
        return await ApiClient.getProjetos();
    },

    async createProjeto(projeto) {
        return await ApiClient.createProjeto(projeto);
    },

    async updateProjeto(projeto) {
        return await ApiClient.updateProjeto(projeto);
    },

    async deleteProjeto(id) {
        return await ApiClient.deleteProjeto(id);
    },

    async getAtividadesByProjeto(projetoId) {
        return await ApiClient.getAtividades(projetoId);
    },

    async createAtividade(atividade) {
        return await ApiClient.createAtividade(atividade);
    },

    async updateAtividade(atividade) {
        return await ApiClient.updateAtividade(atividade);
    },

    async deleteAtividade(id) {
        return await ApiClient.deleteAtividade(id);
    },

    async getAllAtividades() {
        return await ApiClient.getAtividades();
    },

    async getAllData() {
        return {
            projetos: await ApiClient.getProjetos(),
            atividades: await ApiClient.getAtividades(),
            exportedAt: new Date().toISOString()
        };
    },

    async getAllLicoes(projetoId = null) {
        return await ApiClient.getLicoes(projetoId);
    },

    async createLicao(licao) {
        return await ApiClient.createLicao(licao);
    },

    async deleteLicao(id) {
        return await ApiClient.deleteLicao(id);
    }
};

window.DB = DB;

// ========== Analysis Module ==========
const Analysis = {
    calculateStats(projetos, atividades) {
        const total = projetos.length;
        const totalAtk = atividades.length;
        const concluidas = atividades.filter(a => a.status === 'concluido').length;
        const emAndamento = atividades.filter(a => a.status === 'andamento').length;

        const porStatus = {};
        atividades.forEach(atk => {
            const status = atk.status || 'pendente';
            porStatus[status] = (porStatus[status] || 0) + 1;
        });

        const porPrioridade = {};
        atividades.forEach(atk => {
            const prioridade = atk.prioridade || 'media';
            porPrioridade[prioridade] = (porPrioridade[prioridade] || 0) + 1;
        });

        return {
            total_projetos: total,
            total_atividades: totalAtk,
            concluidas,
            em_andamento: emAndamento,
            pendentes: totalAtk - concluidas - emAndamento,
            por_status: porStatus,
            por_prioridade: porPrioridade,
            taxa_conclusao: totalAtk > 0 ? Math.round((concluidas / totalAtk) * 100) : 0
        };
    },

    calculateTrends(atividades) {
        const hoje = new Date();
        const semanaPassada = new Date(hoje);
        semanaPassada.setDate(semanaPassada.getDate() - 7);

        let concluidasSemana = 0;
        atividades.forEach(atk => {
            if (atk.status === 'concluido' && atk.updated_at) {
                const data = new Date(atk.updated_at);
                if (data >= semanaPassada) concluidasSemana++;
            }
        });

        return { concluidas_semana: concluidasSemana, tendencia: 'positiva' };
    },

    identifyBottlenecks(atividades) {
        const bloqueios = [];
        atividades.forEach(atk => {
            if (atk.dependencia) {
                const dep = atividades.find(a => a.id === atk.dependencia);
                if (dep && dep.status !== 'concluido' && atk.status === 'pendente') {
                    bloqueios.push({ atividade: atk.titulo, bloqueada_por: dep.titulo, status_bloqueio: dep.status });
                }
            }
        });
        return bloqueios;
    },

    generateRecommendations(projetos, atividades) {
        const recomendacoes = [];
        
        const atrasadas = atividades.filter(a => a.data_fim && a.status !== 'concluido' && new Date(a.data_fim) < new Date());
        if (atrasadas.length > 0) {
            recomendacoes.push({ tipo: 'atencao', mensagem: `${atrasadas.length} atividade(s) atrasada(s)`, acao: 'Revisar prazos e repriorizar' });
        }
        
        const altaPrioridade = atividades.filter(a => a.prioridade === 'alta' && a.status !== 'concluido');
        if (altaPrioridade.length > 5) {
            recomendacoes.push({ tipo: 'acao', mensagem: `${altaPrioridade.length} atividades alta prioridade`, acao: 'Redistribuir responsabilidades' });
        }
        
        if (atividades.length > 0 && recomendacoes.length === 0) {
            recomendacoes.push({ tipo: 'sucesso', mensagem: 'Projeto está no caminho certo!', acao: 'Manter o ritmo atual' });
        }
        
        return recomendacoes;
    },

    calculateVelocity(atividades) {
        const concluidas = atividades.filter(a => a.status === 'concluido');
        const horas = concluidas.reduce((sum, a) => sum + (a.horas_realizadas || 0), 0);
        return { horas_concluidas: horas, atividades_concluidas: concluidas.length };
    },

    calculateBurndown(atividades) {
        const total = atividades.length;
        const concluidas = atividades.filter(a => a.status === 'concluido').length;
        return { total, concluidas, restantes: total - concluidas, percentual: total > 0 ? Math.round((concluidas / total) * 100) : 0 };
    },

    assessRiscos(projetos, atividades) {
        const riscos = [];
        
        const atrasadas = atividades.filter(a => a.data_fim && a.status !== 'concluido' && new Date(a.data_fim) < new Date());
        if (atrasadas.length > 0) {
            riscos.push({ nome: 'Atraso no cronograma', probabilidade: 'alta', impacto: 'alto', mitigacao: 'Revisar dependências' });
        }
        
        return riscos;
    },

    predictCompletion(atividades) {
        const total = atividades.length;
        const concluidas = atividades.filter(a => a.status === 'concluido').length;
        
        return { total_atividades: total, concluidas, restantes: total - concluidas, confianca: total > 5 ? 'alta' : 'baixa' };
    },

    async getInsights(projetoId = null) {
        const projetos = await ApiClient.getProjetos();
        const atividades = await ApiClient.getAtividades(projetoId);
        
        return {
            estatisticas: this.calculateStats(projetos, atividades),
            tendencias: this.calculateTrends(atividades),
            gargalos: this.identifyBottlenecks(atividades),
            recomendacoes: this.generateRecommendations(projetos, atividades),
            velocity: this.calculateVelocity(atividades),
            burndown: this.calculateBurndown(atividades),
            riscos: this.assessRiscos(projetos, atividades)
        };
    }
};

window.Analysis = Analysis;