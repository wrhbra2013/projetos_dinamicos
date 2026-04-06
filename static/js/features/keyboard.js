const KeyboardShortcuts = {
    shortcuts: {
        'Ctrl+1': 'Ir para Dashboard',
        'Ctrl+2': 'Ir para Mapa Visual',
        'Ctrl+3': 'Ir para Relatórios',
        'Ctrl+N': 'Novo Projeto',
        'Ctrl+Shift+N': 'Nova Atividade',
        'Ctrl+T': 'Alternar Tema',
        'Ctrl+S': 'Salvar/Atualizar',
        'Escape': 'Fechar Modal',
        '?': 'Mostrar Ajuda'
    },

    init() {
        document.addEventListener('keydown', (e) => this.handle(e));
    },

    handle(e) {
        const key = [];
        if (e.ctrlKey) key.push('Ctrl');
        if (e.shiftKey) key.push('Shift');
        if (e.altKey) key.push('Alt');
        key.push(e.key.toUpperCase());
        const combo = key.join('+');

        if (this.shortcuts[combo] || e.key === '?') {
            this.execute(combo, e);
        }
    },

    execute(combo, e) {
        e.preventDefault();

        switch(combo) {
            case 'Ctrl+1':
                document.getElementById('page-dashboard').checked = true;
                break;
            case 'Ctrl+2':
                document.getElementById('page-mapa').checked = true;
                break;
            case 'Ctrl+3':
                document.getElementById('page-relatorio').checked = true;
                break;
            case 'Ctrl+N':
                document.getElementById('projetoModal').classList.add('active');
                document.getElementById('nome').focus();
                break;
            case 'Ctrl+Shift+N':
                document.getElementById('atividadeModal').classList.add('active');
                document.getElementById('atividadeTitulo').focus();
                break;
            case 'Ctrl+T':
                Theme.toggle();
                break;
            case 'Escape':
                document.querySelectorAll('.modal.active').forEach(m => m.classList.remove('active'));
                break;
            case '?':
                this.showHelp();
                break;
        }
    },

    showHelp() {
        const help = document.createElement('div');
        help.className = 'keyboard-help';
        help.innerHTML = `
            <h3>Atalhos de Teclado</h3>
            <table>
                ${Object.entries(this.shortcuts).map(([key, desc]) => 
                    `<tr><td><kbd>${key}</kbd></td><td>${desc}</td></tr>`
                ).join('')}
            </table>
            <button onclick="this.parentElement.remove()">Fechar</button>
        `;
        help.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 24px;
            z-index: 10000;
            max-width: 400px;
            box-shadow: var(--shadow-lg);
        `;
        
        help.querySelector('table').style.cssText = 'width: 100%; margin-bottom: 16px;';
        help.querySelectorAll('td').forEach(td => td.style.padding = '8px');
        help.querySelector('kbd').style.cssText = `
            background: var(--accent-light);
            padding: 4px 8px;
            border-radius: 4px;
            font-family: monospace;
        `;
        help.querySelector('button').style.cssText = `
            width: 100%;
            padding: 10px;
            background: var(--accent);
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
        `;
        
        document.body.appendChild(help);
    }
};

document.addEventListener('DOMContentLoaded', () => KeyboardShortcuts.init());