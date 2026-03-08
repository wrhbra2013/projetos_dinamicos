const Suporte = {
    STRIPE_PUBLIC_KEY: 'pk_test_SUA_CHAVE_PUBLICA_AQUI',
    STRIPE_PRICE_IDS: {
        basic: 'price_basic_id',
        professional: 'price_professional_id',
        enterprise: 'price_enterprise_id'
    },
    API_URL: 'https://sua-api.com',
    
    STORAGE_KEY: 'projetos_dinamicos_assinatura',
    
    init() {
        this.carregarStatusAssinatura();
    },
    
    getAssinatura() {
        return JSON.parse(localStorage.getItem(this.STORAGE_KEY));
    },
    
    salvarAssinatura(dados) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dados));
    },
    
    carregarStatusAssinatura() {
        const assinatura = this.getAssinatura();
        const statusEl = document.getElementById('subscriptionStatus');
        
        if (!statusEl) return;
        
        if (assinatura && assinatura.status === 'active') {
            const dataFim = new Date(assinatura.current_period_end * 1000).toLocaleDateString('pt-BR');
            statusEl.innerHTML = `
                <span class="status-badge active">✓ Assinatura Ativa - ${assinatura.plano}</span>
                <p style="color: var(--text-secondary); margin-top: 8px;">
                    Válido até: ${dataFim}
                </p>
            `;
        } else {
            statusEl.innerHTML = '<span class="status-badge inactive">Sem assinatura ativa</span>';
        }
    },
    
    async assinar(plano) {
        const priceId = this.STRIPE_PRICE_IDS[plano];
        
        if (priceId === 'price_basic_id' || priceId.includes('SUA_CHAVE')) {
            alert('Configure suas chaves do Stripe em static/js/suporte.js');
            return;
        }
        
        try {
            const response = await fetch(`${this.API_URL}/criar-sessao-checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    price_id: priceId,
                    success_url: window.location.origin + '/suporte.html?success=true',
                    cancel_url: window.location.origin + '/suporte.html?canceled=true'
                })
            });
            
            const data = await response.json();
            
            if (data.url) {
                window.location.href = data.url;
            } else {
                this.simularAssinatura(plano);
            }
        } catch (error) {
            console.log('Erro na API, simulando assinatura:', error);
            this.simularAssinatura(plano);
        }
    },
    
    simularAssinatura(plano) {
        const planos = {
            basic: 'Básico',
            professional: 'Profissional',
            enterprise: 'Enterprise'
        };
        
        const confirmar = confirm(`Simular pagamento do plano ${planos[plano]}?\n\nEsta é uma demonstração. Configure o backend para funcionar com Stripe real.`);
        
        if (confirmar) {
            const assinatura = {
                id: 'sub_' + Math.random().toString(36).substr(2, 9),
                status: 'active',
                plano: planos[plano],
                plano_tipo: plano,
                current_period_start: Math.floor(Date.now() / 1000),
                current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60)
            };
            
            this.salvarAssinatura(assinatura);
            this.carregarStatusAssinatura();
            
            alert('Assinatura ativada com sucesso! (Modo demonstração)');
        }
    },
    
    async enviarMensagem() {
        const nome = document.getElementById('nome').value;
        const email = document.getElementById('email').value;
        const assunto = document.getElementById('assunto').value;
        const mensagem = document.getElementById('mensagem').value;
        
        if (!nome || !email || !mensagem) {
            alert('Preencha todos os campos');
            return;
        }
        
        const assinatura = this.getAssinatura();
        
        const ticket = {
            id: 'TKT-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
            nome,
            email,
            assunto,
            mensagem,
            assinatura: assinatura ? assinatura.plano_tipo : 'free',
            status: 'open',
            created_at: new Date().toISOString()
        };
        
        const tickets = JSON.parse(localStorage.getItem('projetos_dinamicos_tickets') || '[]');
        tickets.push(ticket);
        localStorage.setItem('projetos_dinamicos_tickets', JSON.stringify(tickets));
        
        alert(`Ticket #${ticket.id} criado com sucesso!\n\nEm breve nosso equipe entrará em contato.`);
        
        document.getElementById('formContato').reset();
    },
    
    verificarUrlParams() {
        const params = new URLSearchParams(window.location.search);
        
        if (params.get('success') === 'true') {
            alert('Pagamento realizado com sucesso! Bem-vindo ao Projetos Dinâmicos Pro.');
            window.history.replaceState({}, document.title, '/suporte.html');
        }
        
        if (params.get('canceled') === 'true') {
            alert('Pagamento cancelado. Tente novamente quando quiser.');
            window.history.replaceState({}, document.title, '/suporte.html');
        }
        
        if (params.get('session_id')) {
            this.verificarAssinatura(params.get('session_id'));
        }
    },
    
    async verificarAssinatura(sessionId) {
        try {
            const response = await fetch(`${this.API_URL}/verificar-assinatura`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session_id: sessionId })
            });
            
            const data = await response.json();
            
            if (data.assinatura) {
                this.salvarAssinatura(data.assinatura);
                this.carregarStatusAssinatura();
            }
        } catch (error) {
            console.log('Erro ao verificar assinatura');
        }
    },
    
    gerenciarAssinatura() {
        const assinatura = this.getAssinatura();
        
        if (!assinatura || assinatura.status !== 'active') {
            alert('Você não possui uma assinatura ativa.');
            return;
        }
        
        const portalUrl = `${this.API_URL}/customer-portal`;
        
        fetch(`${this.API_URL}/criar-portal-session`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ assinatura_id: assinatura.id })
        })
        .then(res => res.json())
        .then(data => {
            if (data.url) {
                window.location.href = data.url;
            } else {
                this.opcoesGerenciamento();
            }
        })
        .catch(() => {
            this.opcoesGerenciamento();
        });
    },
    
    opcoesGerenciamento() {
        const opcao = prompt('Escolha uma opção:\n1 - Cancelar assinatura\n2 - Alterar plano\n3 - Voltar');
        
        if (opcao === '1') {
            if (confirm('Tem certeza que deseja cancelar?')) {
                this.cancelarAssinatura();
            }
        } else if (opcao === '2') {
            window.location.href = 'suporte.html';
        }
    },
    
    cancelarAssinatura() {
        const assinatura = this.getAssinatura();
        
        if (assinatura) {
            assinatura.status = 'canceled';
            this.salvarAssinatura(assinatura);
            this.carregarStatusAssinatura();
            alert('Assinatura cancelada. O acesso será mantido até o fim do período pago.');
        }
    }
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Suporte.verificarUrlParams());
} else {
    Suporte.verificarUrlParams();
}
