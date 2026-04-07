console.log('FinanceOrganizer - JS Carregado');

const CATEGORIAS_RECEITA = {
    salario: 'Salário',
    freelance: 'Freelance',
    investimento: 'Investimento',
    presente: 'Presente',
    outros: 'Outros'
};

const CATEGORIAS_DESPESA = {
    alimentacao: 'Alimentação',
    transporte: 'Transporte',
    moradia: 'Moradia',
    lazer: 'Lazer',
    saude: 'Saúde',
    educacao: 'Educação',
    outros: 'Outros'
};

let dados = {
    receitas: [],
    despesas: [],
    metas: []
};

document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initDefaultDate();
    renderAll();
});

function initDefaultDate() {
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('receita-data').value = today;
    document.getElementById('despesa-data').value = today;
    initMonthFilter();
}

function initMonthFilter() {
    const select = document.getElementById('report-month');
    const months = [];
    for (let i = 0; i < 12; i++) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const month = d.toISOString().slice(0, 7);
        const label = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
        months.push({ value: month, label });
    }
    select.innerHTML = '<option value="">Selecione o mês</option>' +
        months.map(m => `<option value="${m.value}">${m.label}</option>`).join('');
}

function loadData() {
    const saved = localStorage.getItem('finance_data');
    if (saved) {
        dados = JSON.parse(saved);
    }
}

function saveData() {
    localStorage.setItem('finance_data', JSON.stringify(dados));
}

function renderAll() {
    renderDashboard();
    renderReceitas();
    renderDespesas();
    renderMetas();
    renderReports();
}

function switchView(view) {
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === view);
    });
    document.querySelectorAll('.view').forEach(v => {
        v.classList.toggle('active', v.id === 'view-' + view);
    });
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('pt-BR');
}

// ============= DASHBOARD =============
function renderDashboard() {
    const totalReceitas = dados.receitas.reduce((sum, r) => sum + r.valor, 0);
    const totalDespesas = dados.despesas.reduce((sum, d) => sum + d.valor, 0);
    const saldo = totalReceitas - totalDespesas;
    const metasAtivas = dados.metas.length;

    document.getElementById('dash-receitas').textContent = formatCurrency(totalReceitas);
    document.getElementById('dash-despesas').textContent = formatCurrency(totalDespesas);
    document.getElementById('dash-saldo').textContent = formatCurrency(saldo);
    document.getElementById('dash-metas').textContent = metasAtivas;
    document.getElementById('header-balance').textContent = formatCurrency(saldo);

    renderRecentTransactions();
    renderGoalsProgress();
    renderCategoryChart();
}

function renderRecentTransactions() {
    const all = [
        ...dados.receitas.map(r => ({ ...r, tipo: 'receita' })),
        ...dados.despesas.map(d => ({ ...d, tipo: 'despesa' }))
    ].sort((a, b) => new Date(b.data) - new Date(a.data)).slice(0, 5);

    const container = document.getElementById('recent-transactions');
    container.innerHTML = all.length ? all.map(t => `
        <div class="transaction-item">
            <div class="transaction-info">
                <span class="transaction-desc">${t.descricao}</span>
                <span class="transaction-date">${formatDate(t.data)} • ${t.tipo === 'receita' ? CATEGORIAS_RECEITA[t.categoria] : CATEGORIAS_DESPESA[t.categoria]}</span>
            </div>
            <span class="transaction-amount ${t.tipo}">${t.tipo === 'receita' ? '+' : '-'}${formatCurrency(t.valor)}</span>
        </div>
    `).join('') : '<p style="color: var(--text2); text-align: center;">Nenhuma transação</p>';
}

function renderGoalsProgress() {
    const container = document.getElementById('goals-progress');
    const now = Date.now();

    container.innerHTML = dados.metas.length ? dados.metas.map(m => {
        const saved = m.valorAtual || 0;
        const percent = Math.min((saved / m.valor) * 100, 100);
        const daysLeft = Math.ceil((new Date(m.dataLimite) - now) / (1000 * 60 * 60 * 24));
        
        return `
            <div class="goal-card">
                <h4>${m.nome}</h4>
                <div class="goal-progress">
                    <div class="goal-progress-bar">
                        <div class="goal-progress-fill ${percent >= 100 ? 'complete' : ''}" style="width: ${percent}%"></div>
                    </div>
                </div>
                <div class="goal-info">
                    <span>${formatCurrency(saved)} / ${formatCurrency(m.valor)}</span>
                    <span>${percent.toFixed(0)}% • ${daysLeft > 0 ? daysLeft + ' dias' : 'Tempo esgotado'}</span>
                </div>
            </div>
        `;
    }).join('') : '<p style="color: var(--text2); text-align: center;">Nenhuma meta definida</p>';
}

function renderCategoryChart() {
    const categoryTotals = {};
    dados.despesas.forEach(d => {
        categoryTotals[d.categoria] = (categoryTotals[d.categoria] || 0) + d.valor;
    });

    const sorted = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
    const max = sorted.length ? sorted[0][1] : 1;

    const container = document.getElementById('category-chart');
    container.innerHTML = sorted.slice(0, 6).map(([cat, total]) => `
        <div class="chart-bar-item">
            <div class="chart-bar" style="height: ${(total / max) * 150}px; background: var(--accent);"></div>
            <span class="chart-label">${CATEGORIAS_DESPESA[cat] || cat}</span>
            <span style="font-size: 11px; color: var(--text2)">${formatCurrency(total)}</span>
        </div>
    `).join('') || '<p style="color: var(--text2); margin: auto;">Nenhuma despesa registrada</p>';
}

// ============= RECEITAS =============
function renderReceitas() {
    const sorted = [...dados.receitas].sort((a, b) => new Date(b.data) - new Date(a.data));
    const total = sorted.reduce((sum, r) => sum + r.valor, 0);

    document.getElementById('total-receitas').textContent = formatCurrency(total);

    const tbody = document.getElementById('receitas-table');
    tbody.innerHTML = sorted.length ? sorted.map(r => `
        <tr>
            <td>${formatDate(r.data)}</td>
            <td>${r.descricao}</td>
            <td>${CATEGORIAS_RECEITA[r.categoria]}</td>
            <td class="amount income">${formatCurrency(r.valor)}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteReceita(${r.id})">🗑️</button>
            </td>
        </tr>
    `).join('') : '<tr><td colspan="5" style="text-align: center; color: var(--text2)">Nenhuma receita registrada</td></tr>';
}

function addReceita(e) {
    e.preventDefault();
    dados.receitas.push({
        id: Date.now(),
        descricao: document.getElementById('receita-desc').value,
        valor: parseFloat(document.getElementById('receita-valor').value),
        data: document.getElementById('receita-data').value,
        categoria: document.getElementById('receita-categoria').value
    });
    saveData();
    renderAll();
    closeModal('receita');
    e.target.reset();
    initDefaultDate();
}

function deleteReceita(id) {
    if (confirm('Excluir esta receita?')) {
        dados.receitas = dados.receitas.filter(r => r.id !== id);
        saveData();
        renderAll();
    }
}

// ============= DESPESAS =============
function renderDespesas() {
    const sorted = [...dados.despesas].sort((a, b) => new Date(b.data) - new Date(a.data));
    const total = sorted.reduce((sum, d) => sum + d.valor, 0);

    document.getElementById('total-despesas').textContent = formatCurrency(total);

    const tbody = document.getElementById('despesas-table');
    tbody.innerHTML = sorted.length ? sorted.map(d => `
        <tr>
            <td>${formatDate(d.data)}</td>
            <td>${d.descricao}</td>
            <td>${CATEGORIAS_DESPESA[d.categoria]}</td>
            <td class="amount expense">-${formatCurrency(d.valor)}</td>
            <td>
                <button class="btn btn-sm btn-danger" onclick="deleteDespesa(${d.id})">🗑️</button>
            </td>
        </tr>
    `).join('') : '<tr><td colspan="5" style="text-align: center; color: var(--text2)">Nenhuma despesa registrada</td></tr>';
}

function addDespesa(e) {
    e.preventDefault();
    dados.despesas.push({
        id: Date.now(),
        descricao: document.getElementById('despesa-desc').value,
        valor: parseFloat(document.getElementById('despesa-valor').value),
        data: document.getElementById('despesa-data').value,
        categoria: document.getElementById('despesa-categoria').value
    });
    saveData();
    renderAll();
    closeModal('despesa');
    e.target.reset();
    initDefaultDate();
}

function deleteDespesa(id) {
    if (confirm('Excluir esta despesa?')) {
        dados.despesas = dados.despesas.filter(d => d.id !== id);
        saveData();
        renderAll();
    }
}

// ============= METAS =============
function renderMetas() {
    const container = document.getElementById('goals-grid');
    const now = Date.now();

    container.innerHTML = dados.metas.length ? dados.metas.map(m => {
        const saved = m.valorAtual || 0;
        const percent = Math.min((saved / m.valor) * 100, 100);
        const daysLeft = Math.ceil((new Date(m.dataLimite) - now) / (1000 * 60 * 60 * 24));

        return `
            <div class="goal-card">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                    <h4>${m.nome}</h4>
                    <button class="btn btn-sm btn-danger" onclick="deleteMeta(${m.id})">🗑️</button>
                </div>
                <p>${m.descricao || ''}</p>
                <div class="goal-progress">
                    <div class="goal-progress-bar">
                        <div class="goal-progress-fill ${percent >= 100 ? 'complete' : ''}" style="width: ${percent}%"></div>
                    </div>
                </div>
                <div class="goal-info">
                    <span>${formatCurrency(saved)} / ${formatCurrency(m.valor)}</span>
                    <span>${percent.toFixed(0)}% • ${daysLeft > 0 ? daysLeft + ' dias' : 'Tempo esgotado'}</span>
                </div>
                <div style="margin-top: 12px; display: flex; gap: 8px;">
                    <input type="number" id="add-meta-${m.id}" placeholder="Valor" style="flex: 1; padding: 8px; background: var(--bg); border: 1px solid var(--border); border-radius: 6px; color: var(--text);" step="0.01">
                    <button class="btn btn-sm btn-primary" onclick="addToMeta(${m.id})">+</button>
                </div>
            </div>
        `;
    }).join('') : '<p style="color: var(--text2); grid-column: 1/-1; text-align: center;">Nenhuma meta definida</p>';
}

function addMeta(e) {
    e.preventDefault();
    dados.metas.push({
        id: Date.now(),
        nome: document.getElementById('meta-nome').value,
        descricao: document.getElementById('meta-desc').value,
        valor: parseFloat(document.getElementById('meta-valor').value),
        valorAtual: 0,
        dataLimite: document.getElementById('meta-data').value
    });
    saveData();
    renderAll();
    closeModal('meta');
    e.target.reset();
}

function deleteMeta(id) {
    if (confirm('Excluir esta meta?')) {
        dados.metas = dados.metas.filter(m => m.id !== id);
        saveData();
        renderAll();
    }
}

function addToMeta(id) {
    const input = document.getElementById(`add-meta-${id}`);
    const value = parseFloat(input.value);
    if (value > 0) {
        const meta = dados.metas.find(m => m.id === id);
        if (meta) {
            meta.valorAtual = (meta.valorAtual || 0) + value;
            saveData();
            renderAll();
        }
    }
}

// ============= RELATÓRIOS =============
function renderReports() {
    const month = document.getElementById('report-month').value;
    
    const receitasMes = month 
        ? dados.receitas.filter(r => r.data.startsWith(month)) 
        : dados.receitas;
    const despesasMes = month 
        ? dados.despesas.filter(d => d.data.startsWith(month)) 
        : dados.despesas;

    const totalReceitas = receitasMes.reduce((sum, r) => sum + r.valor, 0);
    const totalDespesas = despesasMes.reduce((sum, d) => sum + d.valor, 0);
    const saldo = totalReceitas - totalDespesas;

    document.getElementById('report-receitas').textContent = formatCurrency(totalReceitas);
    document.getElementById('report-despesas').textContent = formatCurrency(totalDespesas);
    document.getElementById('report-saldo').textContent = formatCurrency(saldo);

    renderMonthlyComparison();
}

function renderMonthlyComparison() {
    const months = {};
    dados.receitas.forEach(r => {
        const m = r.data.slice(0, 7);
        months[m] = months[m] || { receitas: 0, despesas: 0 };
        months[m].receitas += r.valor;
    });
    dados.despesas.forEach(d => {
        const m = d.data.slice(0, 7);
        months[m] = months[m] || { receitas: 0, despesas: 0 };
        months[m].despesas += d.valor;
    });

    const sorted = Object.entries(months).sort().slice(-6);
    const max = Math.max(...sorted.map(([, d]) => Math.max(d.receitas, d.despesas)), 1);

    const container = document.getElementById('monthly-comparison');
    container.innerHTML = sorted.length ? sorted.map(([m, d]) => {
        const label = new Date(m + '-01').toLocaleDateString('pt-BR', { month: 'short' });
        return `
            <div class="chart-bar-item">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; width: 100%;">
                    <div style="display: flex; gap: 4px; align-items: flex-end; height: 150px;">
                        <div class="chart-bar" style="height: ${(d.receitas / max) * 140}px; background: var(--income);"></div>
                        <div class="chart-bar" style="height: ${(d.despesas / max) * 140}px; background: var(--expense);"></div>
                    </div>
                    <span class="chart-label">${label}</span>
                </div>
            </div>
        `;
    }).join('') : '<p style="color: var(--text2); margin: auto;">Sem dados suficientes</p>';
}

// ============= MODAIS =============
function openModal(type) {
    document.getElementById('modal-' + type).classList.add('active');
}

function closeModal(type) {
    document.getElementById('modal-' + type).classList.remove('active');
}

document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', e => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
});

function resetData() {
    if (confirm('Resetar todos os dados?')) {
        localStorage.removeItem('finance_data');
        dados = { receitas: [], despesas: [], metas: [] };
        renderAll();
    }
}