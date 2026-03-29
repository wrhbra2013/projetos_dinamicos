// ========== Insights & Analytics Module ==========
const Insights = {
    currentData: null,
    selectedProjeto: null,

    async init() {
        await this.load();
    },

    async load() {
        try {
            this.showLoading();
            
            const data = await Analysis.getInsights(this.selectedProjeto);
            this.currentData = data;
            
            this.renderStats(data.estatisticas);
            this.renderVelocity(data.velocity);
            this.renderBurndown(data.burndown);
            this.renderRiscos(data.riscos);
            this.renderRecomendacoes(data.recomendacoes);
            await this.loadPrediction();
            
        } catch (error) {
            console.error('Erro ao carregar insights:', error);
            this.showError();
        }
    },

    async loadPrediction() {
        try {
            const predict = await Analysis.getPrediction(this.selectedProjeto);
            this.renderPrediction(predict);
        } catch (error) {
            console.error('Erro ao carregar predição:', error);
        }
    },

    showLoading() {
        const container = document.querySelector('.insights-grid');
        if (container) {
            container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">Carregando insights...</div>';
        }
    },

    showError() {
        const container = document.querySelector('.insights-grid');
        if (container) {
            container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--danger);">Erro ao carregar dados. Verifique a API.</div>';
        }
    },

    renderStats(stats) {
        const container = document.getElementById('insightStats');
        if (!container) return;
        
        container.innerHTML = `
            <div class="stat-item">
                <div class="stat-value">${stats.total_projetos}</div>
                <div class="stat-label">Projetos</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${stats.total_atividades}</div>
                <div class="stat-label">Atividades</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${stats.concluidas}</div>
                <div class="stat-label">Concluídas</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${stats.taxa_conclusao}%</div>
                <div class="stat-label">Taxa Conclusão</div>
            </div>
        `;
    },

    renderVelocity(velocity) {
        const container = document.getElementById('insightVelocity');
        if (!container) return;
        
        container.innerHTML = `
            <div class="stat-item">
                <div class="stat-value">${velocity.horas_concluidas}</div>
                <div class="stat-label">Horas Concluídas</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${velocity.atividades_concluidas}</div>
                <div class="stat-label">Atividades</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${velocity.media_por_atividade}h</div>
                <div class="stat-label">Média/Atividade</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${velocity.atividades_concluidas > 0 ? '🚀' : '⏳'}</div>
                <div class="stat-label">Status</div>
            </div>
        `;
    },

    renderBurndown(burndown) {
        const container = document.getElementById('burndownChart');
        if (!container) return;
        
        const total = burndown.total || 1;
        const restantes = burndown.restantes;
        const concluidas = burndown.concluidas;
        
        const heightConcluidas = (concluidas / total) * 100;
        const heightRestantes = (restantes / total) * 100;
        
        container.innerHTML = `
            <div class="burndown-bar" style="height: ${heightConcluidas}%" title="Concluídas: ${concluidas}"></div>
            <div class="burndown-bar remaining" style="height: ${heightRestantes}%" title="Restantes: ${restantes}"></div>
        `;
    },

    renderRiscos(riscos) {
        const container = document.getElementById('riscosList');
        if (!container) return;
        
        if (!riscos || riscos.length === 0) {
            container.innerHTML = '<div class="risco-item" style="border-left-color:var(--success)"><span class="risco-nome">Nenhum risco identificado</span></div>';
            return;
        }
        
        container.innerHTML = riscos.map(risco => `
            <div class="risco-item ${risco.probabilidade}">
                <div class="risco-header">
                    <span class="risco-nome">${risco.nome}</span>
                    <span class="risco-badge ${risco.probabilidade}">${risco.probabilidade}</span>
                </div>
                <div class="risco-mitigacao">
                    <strong>Mitigação:</strong> ${risco.mitigacao}
                </div>
            </div>
        `).join('');
    },

    renderRecomendacoes(recomendacoes) {
        const container = document.getElementById('recomendacoesList');
        if (!container) return;
        
        if (!recomendacoes || recomendacoes.length === 0) {
            container.innerHTML = '<div class="recomendacao-item"><span class="recomendacao-msg">Nenhuma recomendação no momento</span></div>';
            return;
        }
        
        container.innerHTML = recomendacoes.map(rec => `
            <div class="recomendacao-item ${rec.tipo}">
                <div class="recomendacao-msg">${rec.mensagem}</div>
                <div class="recomendacao-acao">${rec.acao}</div>
            </div>
        `).join('');
    },

    renderPrediction(predict) {
        const container = document.getElementById('predictContent');
        if (!container) return;
        
        if (!predict || predict.total_atividades === 0) {
            container.innerHTML = '<div style="text-align:center;color:var(--text-muted)">Sem dados suficientes para previsão</div>';
            return;
        }
        
        container.innerHTML = `
            <div class="predict-stats">
                <div class="predict-item">
                    <div class="predict-value">${predict.concluidas}</div>
                    <div class="predict-label">Concluídas</div>
                </div>
                <div class="predict-item">
                    <div class="predict-value">${predict.restantes}</div>
                    <div class="predict-label">Restantes</div>
                </div>
                <div class="predict-item">
                    <div class="predict-value">${predict.dias_estimados}</div>
                    <div class="predict-label">Dias Estimados</div>
                </div>
            </div>
            <div class="predict-date">
                <div class="predict-date-label">Data Prevista de Conclusão</div>
                <div class="predict-date-value">${this.formatDate(predict.data_prevista)}</div>
            </div>
            <div class="predict-confianca ${predict.confianca}">
                Confiança da previsão: ${predict.confianca.toUpperCase()}
            </div>
        `;
    },

    formatDate(dateStr) {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
    }
};

window.Insights = Insights;
