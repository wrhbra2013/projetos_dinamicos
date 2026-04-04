// Dashboard de Métricas de Gerenciamento de Projetos
// Exibe KPIs, EV (Earned Value), marcos, riscos e progresso

const ProjectDashboard = {
  data: null,

  async init() {
    await this.loadData();
    this.render();
  },

  async loadData() {
    try {
      const response = await fetch('./data/project-management.json');
      this.data = await response.json();
    } catch (e) {
      console.warn('Dados de gerenciamento não disponíveis:', e);
      this.data = null;
    }
  },

  getStatusColor(status) {
    const colors = {
      concluido: '#22c55e',
      em_andamento: '#f59e0b',
      pendente: '#6b7280',
      ativo: '#ef4444',
      em_tratamento: '#3b82f6'
    };
    return colors[status] || '#6b7280';
  },

  getPriorityColor(prioridade) {
    const colors = {
      alta: '#ef4444',
      media: '#f59e0b',
      baixa: '#22c55e'
    };
    return colors[prioridade] || '#6b7280';
  },

  render() {
    if (!this.data) return;
    this.renderHeader();
    this.renderCharter();
    this.renderEAP();
    this.renderCronograma();
    this.renderRiscos();
    this.renderMarcos();
    this.renderMetricasy();
    this.renderLicoes();
  },

  renderHeader() {
    let section = document.getElementById('project-dashboard');
    if (!section) {
      section = document.createElement('section');
      section.id = 'project-dashboard';
      section.className = 'dashboard-section';
      document.querySelector('.main-content').appendChild(section);
    }
    section.innerHTML = `
      <div class="dashboard-header">
        <h2>📊 Dashboard de Gerenciamento do Projeto</h2>
        <button class="btn-close" onclick="ProjectDashboard.toggleAll()">Ocultar Tudo</button>
      </div>
      <div class="dashboard-tabs">
        <button class="tab-btn active" data-tab="charter">Charter</button>
        <button class="tab-btn" data-tab="eap">EAP</button>
        <button class="tab-btn" data-tab="cronograma">Cronograma</button>
        <button class="tab-btn" data-tab="riscos">Riscos</button>
        <button class="tab-btn" data-tab="metricas">Métricas</button>
        <button class="tab-btn" data-tab="marcos">Marcos</button>
        <button class="tab-btn" data-tab="licoes">Lições</button>
      </div>
    `;
    
    section.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });
  },

  switchTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    const container = document.getElementById('dashboard-content');
    if (!container) return;

    switch(tab) {
      case 'charter': this.renderCharterContent(container); break;
      case 'eap': this.renderEAPContent(container); break;
      case 'cronograma': this.renderCronogramaContent(container); break;
      case 'riscos': this.renderRiscosContent(container); break;
      case 'metricas': this.renderMetricasContent(container); break;
      case 'marcos': this.renderMarcosContent(container); break;
      case 'licoes': this.renderLicoesContent(container); break;
    }
  },

  render() {
    this.renderCharter();
  },

  renderCharter() {
    if (!this.data?.charter) return;
    
    const container = document.getElementById('dashboard-content') || this.createDashboardContent();
    this.renderCharterContent(container);
  },

  createDashboardContent() {
    const section = document.getElementById('project-dashboard');
    const container = document.createElement('div');
    container.id = 'dashboard-content';
    section.appendChild(container);
    return container;
  },

  renderCharterContent(container) {
    const c = this.data.charter;
    container.innerHTML = `
      <div class="dashboard-card">
        <h3>📋 Termo de Abertura do Projeto</h3>
        <div class="info-grid">
          <div class="info-item">
            <label> Nome do Projeto:</label>
            <span>${c.nome}</span>
          </div>
          <div class="info-item">
            <label>Patrocinador:</label>
            <span>${c.patrocinador}</span>
          </div>
          <div class="info-item">
            <label>Gerente:</label>
            <span>${c.gerente_projeto}</span>
          </div>
          <div class="info-item">
            <label>Início:</label>
            <span>${this.formatDate(c.data_inicio)}</span>
          </div>
          <div class="info-item">
            <label>Previsão Fim:</label>
            <span>${this.formatDate(c.data_fim_estimada)}</span>
          </div>
          <div class="info-item">
            <label>Orçamento:</label>
            <span>${c.orcamento_estimado}</span>
          </div>
        </div>
        
        <h4>Descrição</h4>
        <p>${c.descricao}</p>
        
        <h4>🎯 Objetivos</h4>
        <ul>${c.objetivos.map(o => `<li>${o}</li>`).join('')}</ul>
        
        <h4>⚠️ Restrições</h4>
        <ul>${c.restricoes.map(r => `<li>${r}</li>`).join('')}</ul>
        
        <h4>👥 Stakeholders</h4>
        <table class="data-table">
          <tr><th>Nome</th><th>Papel</th><th>Interesse</th></tr>
          ${c.stakeholders.map(s => `<tr><td>${s.nome}</td><td>${s.papel}</td><td>${s.interesse}</td></tr>`).join('')}
        </table>
      </div>
    `;
  },

  renderEAPContent(container) {
    const eap = this.data.eap;
    let html = '<div class="dashboard-card"><h3>🌳 Estrutura Analítica do Projeto (EAP)</h3>';
    
    for (const [key, fase] of Object.entries(eap)) {
      html += `
        <div class="eap-fase">
          <h4>${fase.nome}</h4>
          <table class="data-table">
            <tr><th>ID</th><th>Pacote</th><th>Resp</th><th>Horas</th><th>Status</th></tr>
            ${fase.pacotes.map(p => `
              <tr>
                <td>${p.id}</td>
                <td>${p.nome}</td>
                <td>${p.responsavel}</td>
                <td>${p.horas_estimadas}h</td>
                <td><span class="status-badge" style="background:${this.getStatusColor(p.status)}">${p.status}</span></td>
              </tr>
            `).join('')}
          </table>
        </div>
      `;
    }
    html += '</div>';
    container.innerHTML = html;
  },

  renderCronogramaContent(container) {
    const cron = this.data.cronograma;
    container.innerHTML = `
      <div class="dashboard-card">
        <h3>📅 Cronograma com Caminho Crítico</h3>
        <div class="metric-highlight">
          <div class="metric">
            <span class="metric-value">${cron.duracao_total_dias}</span>
            <span class="metric-label">Dias Totais</span>
          </div>
          <div class="metric">
            <span class="metric-value">${cron.caminho_critico.length}</span>
            <span class="metric-label">Tarefas Críticas</span>
          </div>
          <div class="metric">
            <span class="metric-value">${this.formatDate(cron.data_inicio_projeto)}</span>
            <span class="metric-label">Início</span>
          </div>
          <div class="metric">
            <span class="metric-value">${this.formatDate(cron.data_fim_projeto)}</span>
            <span class="metric-label">Fim</span>
          </div>
        </div>
        
        <h4>Caminho Crítico</h4>
        <div class="critical-path">
          ${cron.caminho_critico.map((id, i) => {
            const task = cron.tarefas.find(t => t.id === id);
            return `<span class="cp-task">${id}${i < cron.caminho_critico.length - 1 ? ' →' : ''}</span>`;
          }).join('')}
        </div>
        
        <h4>Todas as Tarefas</h4>
        <table class="data-table">
          <tr><th>ID</th><th>Tarefa</th><th>Início</th><th>Fim</th><th>Dias</th><th>Progresso</th><th>Crítico</th></tr>
          ${cron.tarefas.map(t => `
            <tr>
              <td>${t.id}</td>
              <td>${t.nome}</td>
              <td>${this.formatDate(t.inicio)}</td>
              <td>${this.formatDate(t.fim)}</td>
              <td>${t.duracao_dias}</td>
              <td>
                <div class="progress-bar">
                  <div class="progress-fill" style="width:${t.progresso}%">${t.progresso}%</div>
                </div>
              </td>
              <td>${t.critico ? '🔴' : ''}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    `;
  },

  renderRiscosContent(container) {
    const riscos = this.data.riscos;
    const matrix = this.buildRiskMatrix(riscos);
    
    container.innerHTML = `
      <div class="dashboard-card">
        <h3>⚠️ Registro de Riscos</h3>
        
        <h4>Matriz de Riscos</h4>
        <table class="risk-matrix">
          <tr>
            <th></th>
            <th>Impacto Baixo</th>
            <th>Impacto Médio</th>
            <th>Impacto Alto</th>
          </tr>
          <tr>
            <th>Prob Alta</th>
            <td style="background:#fef3c7">Médio</td>
            <td style="background:#fecaca">Alto</td>
            <td style="background:#fca5a5">Crítico</td>
          </tr>
          <tr>
            <th>Prob Média</th>
            <td style="background:#d1fae5">Baixo</td>
            <td style="background:#fef3c7">Médio</td>
            <td style="background:#fecaca">Alto</td>
          </tr>
          <tr>
            <th>Prob Baixa</th>
            <td style="background:#d1fae5">Baixo</td>
            <td style="background:#d1fae5">Baixo</td>
            <td style="background:#fef3c7">Médio</td>
          </tr>
        </table>
        
        <h4>Riscos Identificados</h4>
        <table class="data-table">
          <tr><th>ID</th><th>Descrição</th><th>Categoria</th><th>Prob</th><th>Impacto</th><th>Estratégia</th><th>Status</th></tr>
          ${riscos.map(r => `
            <tr>
              <td>${r.id}</td>
              <td>${r.descricao}</td>
              <td>${r.categoria}</td>
              <td>${r.probabilidade}</td>
              <td>${r.impacto}</td>
              <td>${r.estrategia}</td>
              <td><span class="status-badge" style="background:${this.getStatusColor(r.status)}">${r.status}</span></td>
            </tr>
          `).join('')}
        </table>
      </div>
    `;
  },

  buildRiskMatrix(riscos) {
    const map = {};
    riscos.forEach(r => {
      const key = `${r.probabilidade}-${r.impacto}`;
      if (!map[key]) map[key] = [];
      map[key].push(r.id);
    });
    return map;
  },

  renderMetricasContent(container) {
    const m = this.data.metricas;
    const ev = this.calculateEV(m);
    
    container.innerHTML = `
      <div class="dashboard-card">
        <h3>📈 Métricas e Indicadores de Desempenho</h3>
        
        <div class="metrics-grid">
          <div class="metric-box">
            <h5>Tempo</h5>
            <div class="metric-row">
              <span>Decorrido:</span>
              <strong>${m.tempo_decorrido_meses} meses</strong>
            </div>
            <div class="metric-row">
              <span>Restante:</span>
              <strong>${m.tempo_restante_meses} meses</strong>
            </div>
          </div>
          
          <div class="metric-box">
            <h5>Horas</h5>
            <div class="metric-row">
              <span>Estimadas:</span>
              <strong>${m.horas_estimadas_total}h</strong>
            </div>
            <div class="metric-row">
              <span>Gastas:</span>
              <strong>${m.horas_gastas}h</strong>
            </div>
            <div class="metric-row">
              <span>Restantes:</span>
              <strong>${m.horas_restantes}h</strong>
            </div>
          </div>
          
          <div class="metric-box">
            <h5>Earned Value (EVM)</h5>
            <div class="metric-row">
              <span>PV (Planejado):</span>
              <strong>${ev.PV}</strong>
            </div>
            <div class="metric-row">
              <span>EV (Ganho):</span>
              <strong>${ev.EV}</strong>
            </div>
            <div class="metric-row">
              <span>AC (Real):</span>
              <strong>${ev.AC}</strong>
            </div>
          </div>
          
          <div class="metric-box">
            <h5>Índices de Desempenho</h5>
            <div class="metric-row">
              <span>SPI (Prazo):</span>
              <strong class="${m.indice_desempenho_prazo_spi >= 1 ? 'positive' : 'negative'}">${m.indice_desempenho_prazo_spi.toFixed(2)}</strong>
            </div>
            <div class="metric-row">
              <span>CPI (Custo):</span>
              <strong class="${m.indice_desempenho_custo_cpi >= 1 ? 'positive' : 'negative'}">${m.indice_desempenho_custo_cpi.toFixed(2)}</strong>
            </div>
            <div class="metric-row">
              <span>% Concluído:</span>
              <strong>${m.percentual_concluido}%</strong>
            </div>
          </div>
        </div>
        
        <h4>Resumo Geral</h4>
        <div class="summary-stats">
          <div class="stat">
            <span class="stat-value">${m.projetos_total}</span>
            <span class="stat-label">Projetos Total</span>
          </div>
          <div class="stat">
            <span class="stat-value">${m.projetos_concluidos}</span>
            <span class="stat-label">Concluídos</span>
          </div>
          <div class="stat">
            <span class="stat-value">${m.atividades_total}</span>
            <span class="stat-label">Atividades Total</span>
          </div>
          <div class="stat">
            <span class="stat-value">${m.atividades_concluidas}</span>
            <span class="stat-label">Concluídas</span>
          </div>
          <div class="stat">
            <span class="stat-value">${m.atividades_andamento}</span>
            <span class="stat-label">Em Andamento</span>
          </div>
          <div class="stat">
            <span class="stat-value">${m.atividades_pendentes}</span>
            <span class="stat-label">Pendentes</span>
          </div>
        </div>
        
        <div class="ev-explanation">
          <h5>Entenda os indicadores:</h5>
          <ul>
            <li><strong>SPI</strong> > 1 = Ahead of schedule (adiantado)</li>
            <li><strong>SPI</strong> < 1 = Behind schedule (atrasado)</li>
            <li><strong>CPI</strong> > 1 = Under budget (abaixo do orçamento)</li>
            <li><strong>CPI</strong> < 1 = Over budget (acima do orçamento)</li>
          </ul>
        </div>
      </div>
    `;
  },

  calculateEV(metricas) {
    const totalHoras = metricas.horas_estimadas_total;
    const percentual = metricas.percentual_concluido / 100;
    return {
      PV: metricas.valor_planejado || Math.round(totalHoras * (metricas.tempo_decorrido_meses / (metricas.tempo_decorrido_meses + metricas.tempo_restante_meses))),
      EV: metricas.valor_ganho || Math.round(totalHoras * percentual),
      AC: metricas.custo_real || metricas.horas_gastas
    };
  },

  renderMarcosContent(container) {
    const marcos = this.data.marcos;
    const now = new Date();
    
    container.innerHTML = `
      <div class="dashboard-card">
        <h3>🏁 Marcos (Milestones)</h3>
        
        <div class="timeline-container">
          ${marcos.map((m, i) => {
            const isPast = new Date(m.data_alvo) < now;
            const isCurrent = m.status === 'em_andamento';
            return `
              <div class="milestone ${m.status} ${isPast ? 'past' : ''} ${isCurrent ? 'current' : ''}">
                <div class="milestone-marker">
                  ${m.status === 'concluido' ? '✓' : m.status === 'em_andamento' ? '◐' : '○'}
                </div>
                <div class="milestone-content">
                  <div class="milestone-date">${this.formatDate(m.data_alvo)}</div>
                  <div class="milestone-name">${m.nome}</div>
                  <div class="milestone-deliverable">${m.entregavel}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        
        <table class="data-table">
          <tr><th>ID</th><th>Marco</th><th>Data Alvo</th><th>Entregável</th><th>Status</th></tr>
          ${marcos.map(m => `
            <tr>
              <td>${m.id}</td>
              <td>${m.nome}</td>
              <td>${this.formatDate(m.data_alvo)}</td>
              <td>${m.entregavel}</td>
              <td><span class="status-badge" style="background:${this.getStatusColor(m.status)}">${m.status}</span></td>
            </tr>
          `).join('')}
        </table>
      </div>
    `;
  },

  renderLicoesContent(container) {
    const raci = this.data.raci;
    container.innerHTML = `
      <div class="dashboard-card">
        <h3>📊 Matriz RACI</h3>
        <table class="data-table raci-table">
          <tr>
            <th>Atividade</th>
            ${raci.papéis.map(p => `<th>${p}</th>`).join('')}
          </tr>
          ${raci.atividades.map(a => `
            <tr>
              <td>${a.atividade}</td>
              <td class="raci-r">${a.R || '-'}</td>
              <td class="raci-a">${a.A || '-'}</td>
              <td class="raci-c">${a.C || '-'}</td>
              <td class="raci-i">${a.I || '-'}</td>
            </tr>
          `).join('')}
        </table>
        <div class="raci-legend">
          <span><strong>R</strong> = Responsável</span>
          <span><strong>A</strong> = Aprovador</span>
          <span><strong>C</strong> = Consultado</span>
          <span><strong>I</strong> = Informado</span>
        </div>
      </div>
    `;
  },

  renderLicoes() {
    fetch('./data/licoes_aprendidas.json')
      .then(r => r.json())
      .then(licoes => {
        const container = document.getElementById('dashboard-content');
        if (!container) return;
        
        container.innerHTML += `
          <div class="dashboard-card">
            <h3>📚 Lições Aprendidas</h3>
            <table class="data-table">
              <tr><th>Data</th><th>Projeto</th><th>Tipo</th><th>Título</th></tr>
              ${licoes.map(l => `
                <tr>
                  <td>${l.data}</td>
                  <td>${l.projeto}</td>
                  <td><span class="status-badge" style="background:${l.tipo === 'lição_positiva' ? '#22c55e' : '#ef4444'}">${l.tipo}</span></td>
                  <td>${l.titulo}</td>
                </tr>
              `).join('')}
            </table>
          </div>
        `;
      });
  },

  formatDate(dateStr) {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR');
  },

  toggleAll() {
    const content = document.getElementById('dashboard-content');
    if (content) {
      content.style.display = content.style.display === 'none' ? 'block' : 'none';
    }
  }
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  ProjectDashboard.init();
});