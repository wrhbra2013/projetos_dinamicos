/**
 * Sistema de Persistência de Dados com LocalStorage + JSON
 * Projetos Dinâmicos
 */

const DataStore = {
    PREFIX: 'pd_',

    save(key, data) {
        try {
            const fullKey = this.PREFIX + key;
            const jsonData = JSON.stringify(data);
            localStorage.setItem(fullKey, jsonData);
            return true;
        } catch (e) {
            console.error('Erro ao salvar dados:', e);
            return false;
        }
    },

    load(key) {
        try {
            const fullKey = this.PREFIX + key;
            const jsonData = localStorage.getItem(fullKey);
            return jsonData ? JSON.parse(jsonData) : null;
        } catch (e) {
            console.error('Erro ao carregar dados:', e);
            return null;
        }
    },

    remove(key) {
        try {
            const fullKey = this.PREFIX + key;
            localStorage.removeItem(fullKey);
            return true;
        } catch (e) {
            console.error('Erro ao remover dados:', e);
            return false;
        }
    },

    clear() {
        try {
            const keys = Object.keys(localStorage);
            keys.forEach(key => {
                if (key.startsWith(this.PREFIX)) {
                    localStorage.removeItem(key);
                }
            });
            return true;
        } catch (e) {
            console.error('Erro ao limpar dados:', e);
            return false;
        }
    },

    getAllKeys() {
        const keys = Object.keys(localStorage);
        return keys
            .filter(key => key.startsWith(this.PREFIX))
            .map(key => key.replace(this.PREFIX, ''));
    }
};

// Preferências do usuário
const PreferencesStore = {
    KEY: 'preferences',

    save(prefs) {
        const existing = this.load();
        return DataStore.save(this.KEY, { ...existing, ...prefs });
    },

    load() {
        return DataStore.load(this.KEY) || {
            contraste: false,
            altoContraste: false,
            tamanhoFonte: 'medio',
            tema: 'light'
        };
    },

    toggleContraste() {
        const prefs = this.load();
        prefs.contraste = !prefs.contraste;
        this.save(prefs);
        return prefs.contraste;
    },

    setTamanhoFonte(tamanho) {
        const prefs = this.load();
        prefs.tamanhoFonte = tamanho;
        this.save(prefs);
        return prefs;
    }
};

// Dados do plano/usuário
const PlanoStore = {
    KEY: 'plano',

    getPlano() {
        const data = DataStore.load(this.KEY) || {};
        return {
            tipo: data.tipo || 'gratuito',
            ativo: data.ativo || false,
            inicio: data.inicio || null,
            fim: data.fim || null,
            pago: data.pago || false,
            email: data.email || '',
            nome: data.nome || ''
        };
    },

    setPlano(tipo, pago = false) {
        const data = {
            tipo: tipo,
            ativo: tipo !== 'gratuito',
            inicio: tipo !== 'gratuito' ? Date.now() : null,
            fim: tipo !== 'gratuito' ? Date.now() + 30 * 24 * 60 * 60 * 1000 : null,
            pago: pago,
            atualizadoEm: Date.now()
        };
        return DataStore.save(this.KEY, data);
    },

    ativarPlano(tipo, dados) {
        const atual = this.getPlano();
        const data = {
            ...atual,
            tipo: tipo,
            ativo: true,
            pago: true,
            inicio: Date.now(),
            fim: Date.now() + 30 * 24 * 60 * 60 * 1000,
            email: dados.email || '',
            nome: dados.nome || '',
            ativadoEm: Date.now()
        };
        return DataStore.save(this.KEY, data);
    },

    isPro() {
        const plano = this.getPlano();
        return plano.tipo === 'pro' && plano.pago;
    },

    isEmpresarial() {
        const plano = this.getPlano();
        return plano.tipo === 'empresarial' && plano.pago;
    },

    isPremium() {
        const plano = this.getPlano();
        return plano.pago;
    },

    verificarLimites() {
        const plano = this.getPlano();
        if (plano.tipo === 'gratuito' || !plano.pago) {
            return {
                projetos: { usado: 0, limite: 3 },
                atividades: { usado: 0, limite: 10 },
                permitide: true
            };
        }
        return {
            projetos: { usado: -1, limite: 'ilimitado' },
            atividades: { usado: -1, limite: 'ilimitado' },
            permitide: true
        };
    }
};

// Assinaturas/Pagamentos
const AssinaturaStore = {
    KEY: 'assinaturas',

    getAll() {
        return DataStore.load(this.KEY) || [];
    },

    adicionar(assinatura) {
        const assinaturas = this.getAll();
        assinatura.id = 'assinatura_' + Date.now();
        assinatura.criadoEm = Date.now();
        assinatura.status = 'PENDENTE';
        assinaturas.push(assinatura);
        return DataStore.save(this.KEY, assinaturas);
    },

    atualizar(id, dados) {
        const assinaturas = this.getAll();
        const index = assinaturas.findIndex(a => a.id === id);
        if (index !== -1) {
            assinaturas[index] = { ...assinaturas[index], ...dados, atualizadoEm: Date.now() };
            return DataStore.save(this.KEY, assinaturas);
        }
        return false;
    },

    getPorId(id) {
        return this.getAll().find(a => a.id === id);
    },

    getAtiva() {
        return this.getAll().find(a => a.status === 'ATIVA');
    }
};

// Planos disponíveis
const PLANOS = {
    gratuito: {
        id: 'gratuito',
        nome: 'Gratuito',
        preco: 0,
        periodo: 'mês',
        features: [
            'Até 3 projetos',
            'Até 10 atividades por projeto',
            'Mapa visual básico',
            'Feedbacks e sugestões IA'
        ],
        limites: {
            projetos: 3,
            atividades: 10
        }
    },
    pro: {
        id: 'pro',
        nome: 'Pro',
        preco: 29,
        periodo: 'mês',
        periodoLabel: '/mês',
        features: [
            'Projetos ilimitados',
            'Atividades ilimitadas',
            'Mapa visual completo',
            'Exportação PDF',
            'Relatórios avançados',
            'Suporte prioritário',
            'Kanban e Timeline'
        ],
        linkPagamento: 'https://buy.stripe.com/test_pro',
        chavePix: 'seu-email@dominio.com',
        beneficios: 'Mais Popular'
    },
    empresarial: {
        id: 'empresarial',
        nome: 'Empresarial',
        preco: 99,
        periodo: 'mês',
        periodoLabel: '/mês',
        features: [
            'Tudo do Pro',
            'Múltiplos usuários',
            'API de integração',
            'Backup automático',
            'Customizações',
            'Suporte dedicado',
            'White label'
        ],
        linkPagamento: 'https://buy.stripe.com/test_empresa',
        chavePix: 'seu-email@dominio.com',
        beneficios: 'Para times'
    }
};

// Configurações de pagamento PIX
const PagamentoConfig = {
    chavePix: 'projetosdinamicos@gmail.com',
    nomeBeneficiario: 'Projetos Dinâmicos',
    banco: 'Nu Pagamentos S.A.',
    instrucoes: [
        'Abra o app do seu banco',
        'Escolha PIX ou Transferência',
        'Cole ou digite a chave PIX',
        'Digite o valor mostrado',
        'Pronto! Envie o comprovante'
    ]
};

const PagamentoStore = {
    KEY: 'pagamentos',

    getAll() {
        return DataStore.load(this.KEY) || [];
    },

    criar(pagamento) {
        const pagamentos = this.getAll();
        pagamento.id = 'pag_' + Date.now();
        pagamento.criadoEm = Date.now();
        pagamento.status = 'PENDENTE';
        pagamento.comprovante = null;
        pagamentos.push(pagamento);
        DataStore.save(this.KEY, pagamentos);
        return pagamento;
    },

    atualizar(id, dados) {
        const pagamentos = this.getAll();
        const index = pagamentos.findIndex(p => p.id === id);
        if (index !== -1) {
            pagamentos[index] = { ...pagamentos[index], ...dados, atualizadoEm: Date.now() };
            DataStore.save(this.KEY, pagamentos);
            return pagamentos[index];
        }
        return null;
    },

    getPorId(id) {
        return this.getAll().find(p => p.id === id);
    },

    getPendentes() {
        return this.getAll().filter(p => p.status === 'PENDENTE');
    }
};

// Histórico de navegação
const NavigationStore = {
    KEY: 'navigation_history',
    MAX_ITEMS: 20,

    add(page) {
        let history = DataStore.load(this.KEY) || [];
        history = history.filter(h => h.page !== page);
        history.unshift({ page, timestamp: Date.now() });
        if (history.length > this.MAX_ITEMS) {
            history = history.slice(0, this.MAX_ITEMS);
        }
        return DataStore.save(this.KEY, history);
    },

    getHistory() {
        return DataStore.load(this.KEY) || [];
    },

    clear() {
        return DataStore.remove(this.KEY);
    }
};

// Store Genérico para CRUD
function createStore(name) {
    return {
        KEY: name,
        
        getAll() {
            return DataStore.load(this.KEY) || [];
        },
        
        save(item) {
            const items = this.getAll();
            if (item.id) {
                const index = items.findIndex(i => i.id === item.id);
                if (index !== -1) {
                    items[index] = { ...items[index], ...item, updatedAt: Date.now() };
                } else {
                    items.push({ ...item, updatedAt: Date.now() });
                }
            } else {
                item.id = Date.now().toString();
                item.createdAt = Date.now();
                items.push(item);
            }
            return DataStore.save(this.KEY, items);
        },
        
        delete(id) {
            const items = this.getAll().filter(i => i.id !== id);
            return DataStore.save(this.KEY, items);
        },
        
        getById(id) {
            return this.getAll().find(i => i.id === id) || null;
        }
    };
}

// Exports
window.DataStore = DataStore;
window.PreferencesStore = PreferencesStore;
window.PlanoStore = PlanoStore;
window.AssinaturaStore = AssinaturaStore;
window.PagamentoStore = PagamentoStore;
window.PLANOS = PLANOS;
window.PagamentoConfig = PagamentoConfig;
window.NavigationStore = NavigationStore;
window.createStore = createStore;