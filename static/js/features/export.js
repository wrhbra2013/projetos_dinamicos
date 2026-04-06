const ExportImport = {
    async exportJSON() {
        const data = await DB.getAllData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `projetos-dinamicos-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        this.showNotification('Dados exportados com sucesso!', 'success');
    },

    async exportCSV() {
        const data = await DB.getAllData();
        let csv = 'Tipo,Nome,Descrição,Status,Prioridade,Data Criação\n';
        
        data.projetos.forEach(p => {
            csv += `Projeto,"${p.nome}","${p.descricao || ''}",${p.status},,${p.created_at || ''}\n`;
        });
        
        data.atividades.forEach(a => {
            csv += `Atividade,"${a.titulo}","${a.descricao || ''}",${a.status},${a.prioridade},${a.created_at || ''}\n`;
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `projetos-dinamicos-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        this.showNotification('CSV exportado com sucesso!', 'success');
    },

    async importJSON(file) {
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            if (!data.projetos && !data.atividades) {
                throw new Error('Formato inválido');
            }
            
            if (data.projetos) {
                for (const p of data.projetos) {
                    delete p._id;
                    delete p._rev;
                    await DB.createProjeto(p);
                }
            }
            
            if (data.atividades) {
                for (const a of data.atividades) {
                    delete a._id;
                    delete a._rev;
                    await DB.createAtividade(a);
                }
            }
            
            this.showNotification('Dados importados com sucesso!', 'success');
            if (window.Mapa) Mapa.loadData();
        } catch (e) {
            console.error('Erro ao importar:', e);
            this.showNotification('Erro ao importar arquivo', 'error');
        }
    },

    showNotification(msg, type = 'info') {
        const notif = document.createElement('div');
        notif.className = `notification notification-${type}`;
        notif.textContent = msg;
        notif.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 8px;
            z-index: 10000;
            animation: slideIn 0.3s ease;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
        `;
        document.body.appendChild(notif);
        setTimeout(() => notif.remove(), 3000);
    },

    init() {
        const exportBtn = document.getElementById('exportBtn');
        const importBtn = document.getElementById('importBtn');
        const importFile = document.getElementById('importFile');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.showExportMenu());
        }
        
        if (importBtn) {
            importBtn.addEventListener('click', () => importFile.click());
        }
        
        if (importFile) {
            importFile.addEventListener('change', (e) => {
                if (e.target.files[0]) this.importJSON(e.target.files[0]);
            });
        }
    },

    showExportMenu() {
        const menu = document.createElement('div');
        menu.className = 'export-menu';
        menu.innerHTML = `
            <button onclick="ExportImport.exportJSON()">📄 Exportar JSON</button>
            <button onclick="ExportImport.exportCSV()">📊 Exportar CSV</button>
        `;
        menu.style.cssText = `
            position: fixed;
            top: 70px;
            right: 120px;
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 8px;
            z-index: 9999;
            box-shadow: var(--shadow-lg);
        `;
        
        menu.querySelectorAll('button').forEach(btn => {
            btn.style.cssText = `
                display: block;
                width: 100%;
                padding: 10px 20px;
                border: none;
                background: transparent;
                text-align: left;
                cursor: pointer;
                border-radius: 4px;
            `;
            btn.onmouseover = () => btn.style.background = 'var(--accent-light)';
            btn.onmouseout = () => btn.style.background = 'transparent';
        });
        
        document.body.appendChild(menu);
        setTimeout(() => {
            document.addEventListener('click', function handler(e) {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', handler);
                }
            });
        }, 100);
    }
};

document.addEventListener('DOMContentLoaded', () => ExportImport.init());