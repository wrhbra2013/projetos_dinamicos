const Kanban = {
    projetoAtual: null,

    init() {
        this.loadProjetoSelector();
    },

    async loadProjetoSelector() {
        const select = document.getElementById('kanbanProjeto');
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
        const projetoId = document.getElementById('kanbanProjeto')?.value;
        if (!projetoId) return;

        const data = Mapa.getData();
        const atividades = data.atividades.filter(a => a.projeto_id === projetoId);

        document.querySelectorAll('.kanban-tasks').forEach(col => {
            col.innerHTML = '';
            const status = col.dataset.status;
            const filtered = atividades.filter(a => a.status === status);
            
            filtered.forEach(a => {
                const card = this.createCard(a);
                col.appendChild(card);
            });
        });
    },

    createCard(atividade) {
        const card = document.createElement('div');
        card.className = 'kanban-card';
        card.draggable = true;
        card.dataset.id = atividade._id;
        
        const prioridadeCor = {
            'alta': '#ef4444',
            'media': '#f59e0b',
            'baixa': '#10b981'
        };

        card.innerHTML = `
            <div class="kanban-card-header">
                <span class="kanban-priority" style="background: ${prioridadeCor[atividade.prioridade] || '#6b7280'}"></span>
                <button class="kanban-delete" onclick="Kanban.excluir('${atividade._id}')">×</button>
            </div>
            <h4>${this.escapeHtml(atividade.titulo)}</h4>
            <p>${this.escapeHtml(atividade.descricao || '').substring(0, 60)}...</p>
            ${atividade.responsavel ? `<span class="kanban-user">👤 ${this.escapeHtml(atividade.responsavel)}</span>` : ''}
        `;

        card.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text', atividade._id);
        });

        return card;
    },

    async excluir(id) {
        if (!confirm('Excluir esta atividade?')) return;
        await DB.deleteAtividade(id);
        this.render();
        Mapa.loadData();
    },

    escapeHtml(str) {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
};

document.addEventListener('DOMContentLoaded', () => Kanban.init());

document.querySelectorAll('.kanban-tasks').forEach(col => {
    col.addEventListener('dragover', (e) => {
        e.preventDefault();
        col.style.background = 'var(--accent-light)';
    });

    col.addEventListener('dragleave', () => {
        col.style.background = '';
    });

    col.addEventListener('drop', async (e) => {
        e.preventDefault();
        col.style.background = '';
        
        const id = e.dataTransfer.getData('text');
        const newStatus = col.dataset.status;
        
        const atividade = await DB.getAtividade(id);
        if (atividade) {
            await DB.updateAtividade({ ...atividade, status: newStatus });
            Mapa.loadData();
            Kanban.render();
        }
    });
});