const Timeline = {
    projetoAtual: null,

    init() {
        this.loadProjetoSelector();
    },

    async loadProjetoSelector() {
        const select = document.getElementById('timelineProjeto');
        if (!select) return;
        
        const projetos = await DB.getAllProjetos();
        projetos.forEach(p => {
            const opt = document.createElement('option');
            opt.value = p._id;
            opt.textContent = p.nome;
            select.appendChild(opt);
        });
    },

    async render() {
        const projetoId = document.getElementById('timelineProjeto')?.value;
        if (!projetoId) return;

        const data = Mapa.getData();
        const atividades = data.atividades.filter(a => a.projeto_id === projetoId);
        
        const container = document.getElementById('timelineContainer');
        
        if (atividades.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhuma atividade neste projeto.</p>';
            return;
        }

        const statusOrdem = ['pendente', 'andamento', 'concluido'];
        const cores = {
            pendente: '#6b7280',
            andamento: '#3b82f6',
            concluido: '#10b981'
        };

        let html = '<div class="timeline">';
        
        atividades.sort((a, b) => {
            return statusOrdem.indexOf(a.status) - statusOrdem.indexOf(b.status);
        });

        atividades.forEach((a, i) => {
            const dataCriacao = a.created_at ? new Date(a.created_at).toLocaleDateString('pt-BR') : '';
            
            html += `
                <div class="timeline-item" style="--accent: ${cores[a.status]}">
                    <div class="timeline-marker"></div>
                    <div class="timeline-content">
                        <div class="timeline-header">
                            <span class="timeline-status" style="background: ${cores[a.status]}">${this.getStatusLabel(a.status)}</span>
                            <span class="timeline-date">${dataCriacao}</span>
                        </div>
                        <h4>${this.escapeHtml(a.titulo)}</h4>
                        <p>${this.escapeHtml(a.descricao || '')}</p>
                        ${a.responsavel ? `<span class="timeline-user">👤 ${this.escapeHtml(a.responsavel)}</span>` : ''}
                    </div>
                </div>
            `;
        });

        html += '</div>';
        container.innerHTML = html;
    },

    getStatusLabel(status) {
        const labels = {
            pendente: 'Pendente',
            andamento: 'Em Andamento',
            concluido: 'Concluído'
        };
        return labels[status] || status;
    },

    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

document.addEventListener('DOMContentLoaded', () => Timeline.init());