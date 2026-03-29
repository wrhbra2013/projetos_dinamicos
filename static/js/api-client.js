// ========== API Client para comunicação com PHP ==========
const ApiClient = {
    baseUrl: 'api.php',
    useApi: true,
    cache: {},
    cacheTime: 5000,
    lastFetch: {},

    async request(action, method = 'GET', data = null) {
        const url = `${this.baseUrl}?action=${action}`;
        
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'DELETE')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            const result = await response.json();
            
            if (!result.success) {
                console.error('API Error:', result.error);
                throw new Error(result.error || 'Erro na API');
            }
            
            return result.data;
        } catch (error) {
            console.error('Erro na requisição:', error);
            throw error;
        }
    },

    async getCached(action, data = null) {
        const key = JSON.stringify({ action, data });
        const now = Date.now();
        
        if (this.cache[key] && (now - this.lastFetch[key]) < this.cacheTime) {
            return this.cache[key];
        }
        
        const result = await this.request(action, 'GET', data);
        this.cache[key] = result;
        this.lastFetch[key] = now;
        
        return result;
    },

    clearCache() {
        this.cache = {};
        this.lastFetch = {};
    },

    // ========== PROJETOS ==========
    async getProjetos() {
        return await this.request('projetos', 'GET');
    },

    async createProjeto(projeto) {
        return await this.request('projetos', 'POST', projeto);
    },

    async updateProjeto(projeto) {
        return await this.request('projetos', 'PUT', projeto);
    },

    async deleteProjeto(id) {
        return await this.request('projetos', 'DELETE', { id });
    },

    // ========== ATIVIDADES ==========
    async getAtividades(projetoId = null) {
        const url = projetoId ? `atividades&projeto_id=${projetoId}` : 'atividades';
        return await this.request(url, 'GET');
    },

    async createAtividade(atividade) {
        return await this.request('atividades', 'POST', atividade);
    },

    async updateAtividade(atividade) {
        return await this.request('atividades', 'PUT', atividade);
    },

    async deleteAtividade(id) {
        return await this.request('atividades', 'DELETE', { id });
    },

    // ========== TEMPLATES ==========
    async getTemplates() {
        return await this.request('templates', 'GET');
    },

    async createTemplate(template) {
        return await this.request('templates', 'POST', template);
    },

    // ========== LIÇÕES APRENDIDAS ==========
    async getLicoes(projetoId = null) {
        const url = projetoId ? `licoes&projeto_id=${projetoId}` : 'licoes';
        return await this.request(url, 'GET');
    },

    async createLicao(licao) {
        return await this.request('licoes', 'POST', licao);
    },

    async deleteLicao(id) {
        return await this.request('licoes', 'DELETE', { id });
    }
};

window.ApiClient = ApiClient;

// ========== Analysis Module (lógica no frontend) ==========
const Analysis = {
    calculateStats(projetos, atividades) {
        const totalProjetos = projetos.length;
        const totalAtividades = atividades.length;
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
            total_projetos: totalProjetos,
            total_atividades: totalAtividades,
            concluidas,
            em_andamento: emAndamento,
            pendentes: totalAtividades - concluidas - emAndamento,
            por_status: porStatus,
            por_prioridade: porPrioridade,
            taxa_conclusao: totalAtividades > 0 ? Math.round((concluidas / totalAtividades) * 100) : 0
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

        return {
            concluidas_semana: concluidasSemana,
            tendencia: 'positiva'
        };
    },

    identifyBottlenecks(atividades) {
        const bloqueios = [];
        
        atividades.forEach(atk => {
            if (atk.dependencia) {
                const dep = atividades.find(a => a.id === atk.dependencia);
                if (dep && dep.status !== 'concluido' && atk.status === 'pendente') {
                    bloqueios.push({
                        atividade: atk.titulo,
                        bloqueada_por: dep.titulo,
                        status_bloqueio: dep.status
                    });
                }
            }
        });
        
        return bloqueios;
    },

    generateRecommendations(projetos, atividades) {
        const recomendacoes = [];
        
        const atrasadas = atividades.filter(a => {
            if (a.data_fim && a.status !== 'concluido') {
                return new Date(a.data_fim) < new Date();
            }
            return false;
        });
        
        if (atrasadas.length > 0) {
            recomendacoes.push({
                tipo: 'atencao',
                mensagem: `${atrasadas.length} atividade(s) atrasada(s)`,
                acao: 'Revisar prazos e repriorizar atividades'
            });
        }
        
        const altaPrioridade = atividades.filter(a => a.prioridade === 'alta' && a.status !== 'concluido');
        if (altaPrioridade.length > 5) {
            recomendacoes.push({
                tipo: 'acao',
                mensagem: `${altaPrioridade.length} atividades de alta prioridade pendentes`,
                acao: 'Considerar redistribuir responsabilidades'
            });
        }
        
        const bloqueadas = atividades.filter(a => a.status === 'bloqueado');
        if (bloqueadas.length > 0) {
            recomendacoes.push({
                tipo: 'urgente',
                mensagem: `${bloqueadas.length} atividade(s) bloqueada(s)`,
                acao: 'Remover bloqueios para continuar o fluxo'
            });
        }
        
        if (atividades.length > 0 && recomendacoes.length === 0) {
            recomendacoes.push({
                tipo: 'sucesso',
                mensagem: 'Projeto está no caminho certo!',
                acao: 'Manter o ritmo atual'
            });
        }
        
        return recomendacoes;
    },

    calculateVelocity(atividades) {
        const concluidas = atividades.filter(a => a.status === 'concluido');
        const horas = concluidas.reduce((sum, a) => sum + (a.horas_realizadas || 0), 0);
        
        return {
            horas_concluidas: horas,
            atividades_concluidas: concluidas.length,
            media_por_atividade: concluidas.length > 0 ? Math.round(horas / concluidas.length * 10) / 10 : 0
        };
    },

    calculateBurndown(atividades) {
        const total = atividades.length;
        const concluidas = atividades.filter(a => a.status === 'concluido').length;
        
        return {
            total,
            concluidas,
            restantes: total - concluidas,
            percentual: total > 0 ? Math.round((concluidas / total) * 100) : 0
        };
    },

    assessRiscos(projetos, atividades) {
        const riscos = [];
        
        const atrasadas = atividades.filter(a => {
            if (a.data_fim && a.status !== 'concluido') {
                return new Date(a.data_fim) < new Date();
            }
            return false;
        });
        
        if (atrasadas.length > 0) {
            riscos.push({
                nome: 'Atraso no cronograma',
                probabilidade: 'alta',
                impacto: 'alto',
                mitigacao: 'Revisar dependências e priorizar atividades críticas'
            });
        }
        
        const semResponsavel = atividades.filter(a => !a.responsavel && a.status !== 'concluido');
        if (semResponsavel.length > atividades.length * 0.3 && atividades.length > 0) {
            riscos.push({
                nome: 'Atividades sem responsável',
                probabilidade: 'media',
                impacto: 'medio',
                mitigacao: 'Atribuir responsáveis para todas atividades'
            });
        }
        
        const bloqueadas = atividades.filter(a => a.status === 'bloqueado');
        if (bloqueadas.length > 0) {
            riscos.push({
                nome: 'Atividades bloqueadas',
                probabilidade: 'alta',
                impacto: 'alto',
                mitigacao: 'Identificar e remover bloqueios'
            });
        }
        
        return riscos;
    },

    predictCompletion(atividades) {
        const total = atividades.length;
        const concluidas = atividades.filter(a => a.status === 'concluido').length;
        const restantes = total - concluidas;
        
        const horasConcluidas = atividades
            .filter(a => a.status === 'concluido')
            .reduce((sum, a) => sum + (a.horas_realizadas || 0), 0);
            
        const horasRestantes = atividades
            .filter(a => a.status !== 'concluido')
            .reduce((sum, a) => sum + (a.horas_estimadas || 0), 0);
        
        const mediaHoras = concluidas > 0 ? horasConcluidas / concluidas : 0;
        const diasEstimados = mediaHoras > 0 ? Math.ceil(horasRestantes / (mediaHoras * 8)) : 0;
        
        const dataPrevista = new Date();
        dataPrevista.setDate(dataPrevista.getDate() + diasEstimados);
        
        return {
            total_atividades: total,
            concluidas,
            restantes,
            horas_concluidas: horasConcluidas,
            horas_restantes: horasRestantes,
            dias_estimados: diasEstimados,
            data_prevista: dataPrevista.toISOString().split('T')[0],
            confianca: concluidas > 5 ? 'alta' : (concluidas > 2 ? 'media' : 'baixa')
        };
    },

    analyzeWorkflow(atividades) {
        const statusCount = { pendente: 0, andamento: 0, concluido: 0, bloqueado: 0 };
        
        atividades.forEach(atk => {
            const status = atk.status || 'pendente';
            if (statusCount.hasOwnProperty(status)) {
                statusCount[status]++;
            }
        });
        
        const bloqueadas = [];
        atividades.forEach(atk => {
            if (atk.dependencia) {
                const dep = atividades.find(a => a.id === atk.dependencia);
                if (dep && dep.status !== 'concluido' && atk.status === 'pendente') {
                    bloqueadas.push(atk.id);
                }
            }
        });
        
        const total = atividades.length;
        const progresso = total > 0 ? Math.round((statusCount.concluido / total) * 100) : 0;
        
        return {
            status_count: statusCount,
            bloqueadas,
            progresso,
            saude: progresso >= 75 ? 'boa' : (progresso >= 50 ? 'regular' : 'atencao')
        };
    },

    runWorkflow(atividades, projetoId) {
        let updated = false;
        const updatedAtividades = atividades.map(atk => {
            if (!empty(atk.dependencia)) {
                const dep = atividades.find(a => a.id === atk.dependencia);
                if (dep && dep.status === 'concluido' && atk.status === 'pendente') {
                    updated = true;
                    return { ...atk, status: 'andamento', updated_at: new Date().toISOString() };
                }
            }
            return atk;
        });
        
        return { atividades: updatedAtividades, updated };
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
    },

    async getPrediction(projetoId = null) {
        const atividades = await ApiClient.getAtividades(projetoId);
        return this.predictCompletion(atividades);
    },

    async getWorkflow(projetoId) {
        const atividades = await ApiClient.getAtividades(projetoId);
        return this.analyzeWorkflow(atividades);
    }
};

function empty(value) {
    return value === null || value === undefined || value === '';
}

window.Analysis = Analysis;

// ========== DB Layer que usa API ==========
const DB = {
    useApi: true,
    localDb: null,

    async init() {
        try {
            if (typeof PouchDB !== 'undefined') {
                this.localDb = new PouchDB('projetos_dinamicos_cache');
            }
            console.log('DB API Mode initialized');
            return true;
        } catch (e) {
            console.error('Erro ao inicializar DB:', e);
            return false;
        }
    },

    async getAllProjetos() {
        try {
            return await ApiClient.getProjetos();
        } catch (e) {
            console.error('Erro ao buscar projetos:', e);
            return [];
        }
    },

    async createProjeto(projeto) {
        try {
            const result = await ApiClient.createProjeto(projeto);
            ApiClient.clearCache();
            return result;
        } catch (e) {
            console.error('Erro ao criar projeto:', e);
            throw e;
        }
    },

    async updateProjeto(projeto) {
        try {
            const result = await ApiClient.updateProjeto(projeto);
            ApiClient.clearCache();
            return result;
        } catch (e) {
            console.error('Erro ao atualizar projeto:', e);
            throw e;
        }
    },

    async deleteProjeto(id) {
        try {
            await ApiClient.deleteProjeto(id);
            ApiClient.clearCache();
        } catch (e) {
            console.error('Erro ao excluir projeto:', e);
        }
    },

    async getAtividadesByProjeto(projetoId) {
        try {
            return await ApiClient.getAtividades(projetoId);
        } catch (e) {
            console.error('Erro ao buscar atividades:', e);
            return [];
        }
    },

    async createAtividade(atividade) {
        try {
            const result = await ApiClient.createAtividade(atividade);
            ApiClient.clearCache();
            return result;
        } catch (e) {
            console.error('Erro ao criar atividade:', e);
            throw e;
        }
    },

    async updateAtividade(atividade) {
        try {
            const result = await ApiClient.updateAtividade(atividade);
            ApiClient.clearCache();
            return result;
        } catch (e) {
            console.error('Erro ao atualizar atividade:', e);
            throw e;
        }
    },

    async deleteAtividade(id) {
        try {
            await ApiClient.deleteAtividade(id);
            ApiClient.clearCache();
        } catch (e) {
            console.error('Erro ao excluir atividade:', e);
        }
    },

    async getAllAtividades() {
        try {
            return await ApiClient.getAtividades();
        } catch (e) {
            console.error('Erro ao buscar todas atividades:', e);
            return [];
        }
    },

    async getAllData() {
        try {
            const projetos = await this.getAllProjetos();
            const atividades = await this.getAllAtividades();
            return { projetos, atividades, exportedAt: new Date().toISOString() };
        } catch (e) {
            console.error('Erro ao buscar dados:', e);
            return { projetos: [], atividades: [], exportedAt: new Date().toISOString() };
        }
    }
};

window.DB = DB;
