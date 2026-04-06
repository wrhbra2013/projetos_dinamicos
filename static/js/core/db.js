// ========== PouchDB Database (Legacy - não usado) ==========
// Este arquivo está deprecado. Use api-client.js que tem localStorage + fallback API PHP
console.log('db.js carregado (deprecado)');

// O código abaixo não é mais usado - mantido apenas para referência
// O sistema agora usa api-client.js com localStorage como armazenamento principal
    db: null,
    useApi: false,

    async init() {
        try {
            // Verificar se PouchDB está disponível
            if (typeof PouchDB === 'undefined') {
                console.error('PouchDB não está carregado!');
                return null;
            }
            
            // Inicializa PouchDB
            this.db = new PouchDB('projetos_dinamicos');
            console.log('PouchDB inicializado, banco:', this.db.name);
            
            // Escuta mudanças locais (com debounce para evitar loops)
            let updating = false;
            this.db.changes({
                since: 'now',
                live: true
            }).on('change', function() {
                if (updating) return;
                updating = true;
                console.log('Dados alterados, atualizando UI...');
                setTimeout(() => {
                    if (window.Mapa && typeof Mapa.loadData === 'function') {
                        Mapa.loadData();
                    }
                    updating = false;
                }, 100);
            });
            
            // Verifica se há dados na nuvem (CouchDB)
            await this.checkSync();
            
            return this.db;
        } catch (e) {
            console.error('Erro ao inicializar PouchDB:', e);
        }
    },

    async checkSync() {
        // Se tiver CouchDB remoto, configure aqui
        // const remoteCouch = 'http://admin:password@localhost:5984/projetos';
        // this.db.sync(remoteCouch);
    },

    // ========== PROJETOS ==========
    async getAllProjetos() {
        try {
            const result = await this.db.allDocs({ 
                include_docs: true,
                startkey: 'projeto_',
                endkey: 'projeto_\ufff0'
            });
            const projetos = result.rows.map(row => row.doc);
            console.log('Projetos encontrados:', projetos.length);
            return projetos;
        } catch (e) {
            console.error('Erro ao buscar projetos:', e);
            return [];
        }
    },

    async createProjeto(projeto) {
        try {
            const doc = {
                _id: 'projeto_' + Date.now(),
                type: 'projeto',
                nome: projeto.nome,
                descricao: projeto.descricao || '',
                status: projeto.status || 'planejamento',
                created_at: new Date().toISOString(),
                atividades: []
            };
            console.log('Criando projeto:', doc);
            const result = await this.db.put(doc);
            doc._rev = result.rev;
            console.log('Projeto criado com sucesso:', doc);
            return doc;
        } catch (e) {
            console.error('Erro ao criar projeto:', e);
            throw e;
        }
    },

    async updateProjeto(projeto) {
        try {
            const doc = await this.db.get(projeto._id);
            const updated = { ...doc, ...projeto, _rev: doc._rev };
            const result = await this.db.put(updated);
            updated._rev = result.rev;
            return updated;
        } catch (e) {
            console.error('Erro ao atualizar projeto:', e);
            throw e;
        }
    },

    async deleteProjeto(projetoId) {
        try {
            const doc = await this.db.get(projetoId);
            await this.db.remove(doc);
            
            // Excluir atividades do projeto
            const atks = await this.getAtividadesByProjeto(projetoId);
            for (const atk of atks) {
                await this.deleteAtividade(atk._id);
            }
        } catch (e) {
            console.error('Erro ao excluir projeto:', e);
        }
    },

    // ========== ATIVIDADES ==========
    async getAtividadesByProjeto(projetoId) {
        try {
            const result = await this.db.allDocs({ 
                include_docs: true,
                startkey: 'atividade_' + projetoId + '_',
                endkey: 'atividade_' + projetoId + '_\ufff0'
            });
            return result.rows.map(row => row.doc).filter(d => d.type === 'atividade');
        } catch (e) {
            console.error('Erro ao buscar atividades:', e);
            return [];
        }
    },

    async createAtividade(atividade) {
        const doc = {
            _id: 'atividade_' + atividade.projeto_id + '_' + Date.now(),
            type: 'atividade',
            projeto_id: atividade.projeto_id,
            titulo: atividade.titulo,
            descricao: atividade.descricao || '',
            status: atividade.status || 'pendente',
            stack: atividade.stack || '',
            prioridade: atividade.prioridade || 'media',
            dependencia: atividade.dependencia || '',
            equipe: atividade.equipe || '',
            responsavel: atividade.responsavel || '',
            created_at: new Date().toISOString()
        };
        const result = await this.db.put(doc);
        doc._rev = result.rev;
        return doc;
    },

    async updateAtividade(atividade) {
        try {
            const doc = await this.db.get(atividade._id);
            const updated = { ...doc, ...atividade, _rev: doc._rev };
            const result = await this.db.put(updated);
            updated._rev = result.rev;
            return updated;
        } catch (e) {
            console.error('Erro ao atualizar atividade:', e);
            throw e;
        }
    },

    async deleteAtividade(atividadeId) {
        try {
            const doc = await this.db.get(atividadeId);
            await this.db.remove(doc);
        } catch (e) {
            console.error('Erro ao excluir atividade:', e);
        }
    },

    async getAllAtividades() {
        try {
            const result = await this.db.allDocs({ 
                include_docs: true,
                startkey: 'atividade_',
                endkey: 'atividade_\ufff0'
            });
            return result.rows.map(row => row.doc).filter(d => d.type === 'atividade');
        } catch (e) {
            console.error('Erro ao buscar todas atividades:', e);
            return [];
        }
    },

    async getAllData() {
        const projetos = await this.getAllProjetos();
        const atividades = await this.getAllAtividades();
        return { projetos, atividades, exportedAt: new Date().toISOString() };
    }
};

// Escuta mudanças em outras abas
if (typeof window !== 'undefined') {
    let storageUpdating = false;
    window.addEventListener('storage', function(e) {
        if (e.key && e.key.includes('pouchdb') && !storageUpdating) {
            storageUpdating = true;
            console.log('Dados alterados em outra aba, recarregando...');
            setTimeout(() => {
                if (window.Mapa && typeof Mapa.loadData === 'function') {
                    Mapa.loadData();
                }
                storageUpdating = false;
            }, 100);
        }
    });
}

window.DB = DB;
