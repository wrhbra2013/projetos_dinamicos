let data = loadData();
let currentView = 'dashboard';
let currentSubjectId = null;

function showView(view, param) {
    currentView = view;

    document.querySelectorAll('.nav-item').forEach(el => {
        el.classList.toggle('active', el.dataset.view === view);
    });

    const main = document.getElementById('main-content');
    main.innerHTML = '';
    main.classList.add('fade-in');

    switch (view) {
        case 'dashboard': renderDashboard(main); break;
        case 'subjects': renderSubjects(main); break;
        case 'summaries': renderSummaries(main, param); break;
        case 'tests': renderTests(main, param); break;
        case 'results': renderResults(main); break;
        case 'subject-detail': renderSubjectDetail(main, param); break;
        case 'test-taking': renderTestTaking(main, param); break;
        case 'result-detail': renderResultDetail(main, param); break;
        default: renderDashboard(main);
    }

    setTimeout(() => main.classList.remove('fade-in'), 300);
}

function getSubject(id) { return data.subjects.find(s => s.id === id); }
function getSummariesBySubject(id) { return data.summaries.filter(s => s.subjectId === id); }
function getTestsBySubject(id) { return data.tests.filter(t => t.subjectId === id); }
function getSummary(id) { return data.summaries.find(s => s.id === id); }
function getTest(id) { return data.tests.find(t => t.id === id); }
function getResult(id) { return data.results.find(r => r.id === id); }
function getResultsByTest(id) { return data.results.filter(r => r.testId === id); }

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString('pt-BR');
}

function getSubjectSelectOptions(selectedId) {
    let html = '<option value="">Todos os projetos</option>';
    data.subjects.forEach(s => {
        const sel = s.id === selectedId ? 'selected' : '';
        html += `<option value="${s.id}" ${sel}>${s.icon} ${s.name}</option>`;
    });
    return html;
}

function countBySubject(items) {
    const counts = {};
    items.forEach(item => {
        counts[item.subjectId] = (counts[item.subjectId] || 0) + 1;
    });
    return counts;
}

// ==================== DASHBOARD ====================

function renderDashboard(main) {
    const sumCount = data.summaries.length;
    const testCount = data.tests.length;
    const resCount = data.results.length;
    const subCount = data.subjects.length;

    const sumBySub = countBySubject(data.summaries);
    const testBySub = countBySubject(data.tests);

    const recentSubjects = [...data.subjects].slice(-3).reverse();

    const activities = [];
    data.summaries.forEach(s => {
        const sub = getSubject(s.subjectId);
        activities.push({ icon: '📝', text: `Novo documento: <strong>${s.title}</strong> em ${sub ? sub.name : '?'}`, time: formatDate(s.createdAt) });
    });
    data.tests.forEach(t => {
        const sub = getSubject(t.subjectId);
        activities.push({ icon: '📋', text: `Nova revisão: <strong>${t.title}</strong> em ${sub ? sub.name : '?'}`, time: formatDate(t.createdAt) });
    });
    data.results.forEach(r => {
        const test = getTest(r.testId);
        activities.push({ icon: '✅', text: `Revisão concluída: <strong>${test ? test.title : '?'}</strong> - ${r.score}/${r.total}`, time: formatDate(r.date) });
    });
    activities.sort((a, b) => new Date(b.time) - new Date(a.time));
    const recentActivities = activities.slice(0, 5);

    main.innerHTML = `
        <div class="page-header">
            <h1>📊 Dashboard</h1>
        </div>

        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">📚</div>
                <div class="stat-info"><h3>${subCount}</h3><p>Projetos</p></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📝</div>
                <div class="stat-info"><h3>${sumCount}</h3><p>Documentos</p></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📋</div>
                <div class="stat-info"><h3>${testCount}</h3><p>Revisões</p></div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">✅</div>
                <div class="stat-info"><h3>${resCount}</h3><p>Pareceres</p></div>
            </div>
        </div>

        <h2 style="font-size:18px;margin-bottom:14px;">📌 Projetos Recentes</h2>
        <div class="cards-grid" style="margin-bottom:28px;">
            ${recentSubjects.map(s => `
                <div class="card" onclick="showView('subject-detail','${s.id}')" style="border-left-color:${s.color}">
                    <div class="card-icon">${s.icon}</div>
                    <h3>${s.name}</h3>
                    <p>${s.description}</p>
                    <div class="card-meta">
                        <span>📝 ${sumBySub[s.id] || 0} documentos</span>
                        <span>📋 ${testBySub[s.id] || 0} revisões</span>
                    </div>
                </div>
            `).join('')}
        </div>

        ${recentActivities.length > 0 ? `
        <h2 style="font-size:18px;margin-bottom:14px;">🕐 Atividade Recente</h2>
        <div class="activity-list">
            ${recentActivities.map(a => `
                <div class="activity-item">
                    <span class="activity-icon">${a.icon}</span>
                    <span class="activity-text">${a.text}</span>
                    <span class="activity-time">${a.time}</span>
                </div>
            `).join('')}
        </div>` : ''}
    `;
}

// ==================== SUBJECTS ====================

function renderSubjects(main) {
    main.innerHTML = `
        <div class="page-header">
            <h1>📚 Projetos</h1>
            <button class="btn btn-primary" onclick="showSubjectForm()">➕ Novo Projeto</button>
        </div>
        ${data.subjects.length === 0 ? `
            <div class="empty-state">
                <div class="empty-icon">📚</div>
                <h3>Nenhum projeto cadastrado</h3>
                <p>Crie seu primeiro projeto para começar.</p>
                <button class="btn btn-primary" onclick="showSubjectForm()">➕ Criar Projeto</button>
            </div>
        ` : `
        <div class="cards-grid">
            ${data.subjects.map(s => {
                const sumCount = getSummariesBySubject(s.id).length;
                const testCount = getTestsBySubject(s.id).length;
                return `
                <div class="card card-subject" onclick="showView('subject-detail','${s.id}')" style="border-left-color:${s.color}">
                    <div class="card-actions" onclick="event.stopPropagation()">
                        <button class="btn-icon" onclick="showSubjectForm('${s.id}')" title="Editar">✏️</button>
                        <button class="btn-icon" onclick="confirmDeleteSubject('${s.id}')" title="Excluir" style="color:var(--danger)">🗑️</button>
                    </div>
                    <div class="card-icon">${s.icon}</div>
                    <h3>${s.name}</h3>
                    <p>${s.description}</p>
                    <div class="card-meta">
                        <span>📝 ${sumCount} documentos</span>
                        <span>📋 ${testCount} revisões</span>
                    </div>
                </div>`;
            }).join('')}
        </div>`}
    `;
}

function showSubjectForm(id) {
    const subject = id ? getSubject(id) : null;
    const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ec4899', '#14b8a6', '#f97316', '#a855f7', '#06b6d4'];

    const isEdit = !!subject;
    openModal(isEdit ? 'Editar Projeto' : 'Novo Projeto', `
        <div class="form-group">
            <label>Nome do Projeto</label>
            <input class="form-input" id="f-subject-name" value="${subject ? subject.name : ''}" placeholder="Ex: Matemática">
        </div>
        <div class="form-group">
            <label>Descrição</label>
            <input class="form-input" id="f-subject-desc" value="${subject ? subject.description : ''}" placeholder="Breve descrição">
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>Ícone</label>
                <input class="form-input" id="f-subject-icon" value="${subject ? subject.icon : '📚'}" placeholder="📚" maxlength="2">
            </div>
            <div class="form-group">
                <label>Cor</label>
                <div class="color-picker" id="f-subject-color">
                    ${colors.map(c => `
                        <div class="color-option ${(subject ? subject.color : colors[0]) === c ? 'selected' : ''}"
                             style="background:${c}"
                             onclick="selectColor(this,'${c}')"></div>
                    `).join('')}
                </div>
            </div>
        </div>
    `, `
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" onclick="saveSubject('${id || ''}')">${isEdit ? 'Salvar' : 'Criar'}</button>
    `);
}

let selectedColor = '#6366f1';
function selectColor(el, color) {
    document.querySelectorAll('.color-option').forEach(e => e.classList.remove('selected'));
    el.classList.add('selected');
    selectedColor = color;
}

function saveSubject(id) {
    const name = document.getElementById('f-subject-name').value.trim();
    const desc = document.getElementById('f-subject-desc').value.trim();
    const icon = document.getElementById('f-subject-icon').value.trim() || '📚';
    const colorEl = document.querySelector('.color-option.selected');
    const color = colorEl ? colorEl.style.background : selectedColor;

    if (!name) { alert('Digite o nome do projeto.'); return; }

    if (id) {
        const sub = getSubject(id);
        if (sub) {
            sub.name = name;
            sub.description = desc;
            sub.icon = icon;
            sub.color = color;
        }
    } else {
        data.subjects.push({
            id: genId(),
            name,
            description: desc,
            icon,
            color,
            createdAt: new Date().toISOString().slice(0, 10)
        });
    }

    saveData(data);
    closeModal();
    showView('subjects');
}

function confirmDeleteSubject(id) {
    const sub = getSubject(id);
    if (!sub) return;
    if (!confirm(`Excluir "${sub.name}" e todos os seus documentos e revisões?`)) return;

    data.summaries = data.summaries.filter(s => s.subjectId !== id);
    data.tests = data.tests.filter(t => t.subjectId !== id);
    data.results = data.results.filter(r => r.subjectId !== id);
    data.subjects = data.subjects.filter(s => s.id !== id);
    saveData(data);
    showView('subjects');
}

// ==================== SUBJECT DETAIL ====================

function renderSubjectDetail(main, id) {
    const sub = getSubject(id);
    if (!sub) { showView('subjects'); return; }

    currentSubjectId = id;
    const summaries = getSummariesBySubject(id);
    const tests = getTestsBySubject(id);

    main.innerHTML = `
        <button class="btn-back" onclick="showView('subjects')">← Voltar</button>

        <div class="subject-detail-header">
            <span class="subject-detail-icon">${sub.icon}</span>
            <div class="subject-detail-info">
                <h2>${sub.name}</h2>
                <p>${sub.description}</p>
            </div>
            <div style="margin-left:auto;display:flex;gap:8px;">
                <button class="btn btn-primary btn-sm" onclick="showSummaryForm('${id}')">📝 Novo Documento</button>
                <button class="btn btn-primary btn-sm" onclick="showTestForm('${id}')">📋 Nova Revisão</button>
            </div>
        </div>

        <div class="section-tabs">
            <button class="section-tab active" data-section="summaries" onclick="switchSection(this,'summaries','${id}')">📝 Documentos (${summaries.length})</button>
            <button class="section-tab" data-section="tests" onclick="switchSection(this,'tests','${id}')">📋 Revisões (${tests.length})</button>
        </div>

        <div id="section-content">
            ${renderSummariesList(summaries, id)}
        </div>
    `;
}

function switchSection(el, section, id) {
    document.querySelectorAll('.section-tab').forEach(e => e.classList.remove('active'));
    el.classList.add('active');

    const container = document.getElementById('section-content');
    if (section === 'summaries') {
        container.innerHTML = renderSummariesList(getSummariesBySubject(id), id);
    } else {
        container.innerHTML = renderTestsList(getTestsBySubject(id), id);
    }
}

function renderSummariesList(summaries, subjectId) {
    if (summaries.length === 0) {
        return `<div class="empty-state"><div class="empty-icon">📝</div><h3>Nenhum documento ainda</h3><p>Crie seu primeiro documento para este projeto.</p><button class="btn btn-primary" onclick="showSummaryForm('${subjectId}')">📝 Criar Documento</button></div>`;
    }
    return `<div class="list-container">${summaries.map(s => `
        <div class="list-item">
            <div class="list-item-info">
                <h4>${s.title}</h4>
                <p>Criado em ${formatDate(s.createdAt)}</p>
            </div>
            <div class="list-item-meta">
                <button class="btn btn-secondary btn-sm" onclick="viewSummary('${s.id}')">👁️ Ver</button>
                <button class="btn btn-secondary btn-sm" onclick="showSummaryForm('${subjectId}','${s.id}')">✏️ Editar</button>
                <button class="btn btn-danger btn-sm" onclick="confirmDeleteSummary('${s.id}')">🗑️</button>
            </div>
        </div>
    `).join('')}</div>`;
}

function renderTestsList(tests, subjectId) {
    if (tests.length === 0) {
        return `<div class="empty-state"><div class="empty-icon">📋</div><h3>Nenhuma revisão ainda</h3><p>Crie sua primeira revisão para este projeto.</p><button class="btn btn-primary" onclick="showTestForm('${subjectId}')">📋 Criar Revisão</button></div>`;
    }
    return `<div class="list-container">${tests.map(t => `
        <div class="list-item">
            <div class="list-item-info">
                <h4>${t.title}</h4>
                <p>${t.questions.length} perguntas · Criado em ${formatDate(t.createdAt)}</p>
            </div>
            <div class="list-item-meta">
                <button class="btn btn-success btn-sm" onclick="showView('test-taking','${t.id}')">▶️ Iniciar</button>
                <button class="btn btn-secondary btn-sm" onclick="showTestForm('${subjectId}','${t.id}')">✏️</button>
                <button class="btn btn-danger btn-sm" onclick="confirmDeleteTest('${t.id}')">🗑️</button>
            </div>
        </div>
    `).join('')}</div>`;
}

// ==================== SUMMARIES ====================

function renderSummaries(main, filterSubjectId) {
    const filtered = filterSubjectId
        ? data.summaries.filter(s => s.subjectId === filterSubjectId)
        : data.summaries;

    main.innerHTML = `
        <div class="page-header">
            <h1>📝 Documentos</h1>
            <button class="btn btn-primary" onclick="showSummaryForm('')">📝 Novo Documento</button>
        </div>
        <div class="filters">
            <select class="filter-select" onchange="showView('summaries', this.value || null)">
                ${getSubjectSelectOptions(filterSubjectId || '')}
            </select>
        </div>
        ${filtered.length === 0 ? `
            <div class="empty-state">
                <div class="empty-icon">📝</div>
                <h3>Nenhum documento encontrado</h3>
                <p>${data.subjects.length === 0 ? 'Cadastre um projeto primeiro.' : 'Crie um documento para começar.'}</p>
                ${data.subjects.length > 0 ? '<button class="btn btn-primary" onclick="showSummaryForm(\'\')">📝 Criar Documento</button>' : '<button class="btn btn-primary" onclick="showView(\'subjects\')">📚 Criar Projeto</button>'}
            </div>
        ` : `
        <div class="list-container">
            ${filtered.map(s => {
                const sub = getSubject(s.subjectId);
                return `
                <div class="list-item">
                    <div class="list-item-info">
                        <h4>${s.title}</h4>
                        <p>${sub ? `${sub.icon} ${sub.name}` : '?'} · ${formatDate(s.createdAt)}</p>
                    </div>
                    <div class="list-item-meta">
                        <button class="btn btn-secondary btn-sm" onclick="viewSummary('${s.id}')">👁️ Ver</button>
                        <button class="btn btn-secondary btn-sm" onclick="showSummaryForm('${s.subjectId}','${s.id}')">✏️ Editar</button>
                        <button class="btn btn-danger btn-sm" onclick="confirmDeleteSummary('${s.id}')">🗑️</button>
                    </div>
                </div>`;
            }).join('')}
        </div>`}
    `;
}

function showSummaryForm(subjectId, id) {
    const summary = id ? getSummary(id) : null;
    const isEdit = !!summary;

    openModal(isEdit ? 'Editar Documento' : 'Novo Documento', `
        <div class="form-group">
            <label>Título</label>
            <input class="form-input" id="f-summary-title" value="${summary ? summary.title : ''}" placeholder="Título do documento">
        </div>
        <div class="form-group">
            <label>Projeto</label>
            <select class="filter-select" id="f-summary-subject" style="width:100%">
                ${data.subjects.map(s => {
                    const sel = (summary ? summary.subjectId : subjectId) === s.id ? 'selected' : '';
                    return `<option value="${s.id}" ${sel}>${s.icon} ${s.name}</option>`;
                }).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>Conteúdo</label>
            <textarea class="form-textarea" id="f-summary-content" placeholder="Digite o conteúdo do documento...">${summary ? summary.content : ''}</textarea>
        </div>
    `, `
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" onclick="saveSummary('${id || ''}')">${isEdit ? 'Salvar' : 'Criar'}</button>
    `);
}

function saveSummary(id) {
    const title = document.getElementById('f-summary-title').value.trim();
    const subjectId = document.getElementById('f-summary-subject').value;
    const content = document.getElementById('f-summary-content').value.trim();

    if (!title) { alert('Digite o título do documento.'); return; }
    if (!subjectId) { alert('Selecione um projeto.'); return; }
    if (!content) { alert('Digite o conteúdo do documento.'); return; }

    if (id) {
        const s = getSummary(id);
        if (s) {
            s.title = title;
            s.subjectId = subjectId;
            s.content = content;
            s.updatedAt = new Date().toISOString().slice(0, 10);
        }
    } else {
        data.summaries.push({
            id: genId(),
            subjectId,
            title,
            content,
            createdAt: new Date().toISOString().slice(0, 10),
            updatedAt: new Date().toISOString().slice(0, 10)
        });
    }

    saveData(data);
    closeModal();

    if (currentView === 'subject-detail' && currentSubjectId) {
        showView('subject-detail', currentSubjectId);
    } else {
        showView('summaries');
    }
}

function viewSummary(id) {
    const s = getSummary(id);
    if (!s) return;
    const sub = getSubject(s.subjectId);

    openModal(s.title, `
        <div style="margin-bottom:12px;color:var(--text-secondary);font-size:13px;">
            ${sub ? `${sub.icon} ${sub.name}` : ''} · Criado ${formatDate(s.createdAt)}${s.updatedAt !== s.createdAt ? ` · Atualizado ${formatDate(s.updatedAt)}` : ''}
        </div>
        <div class="summary-content">${s.content}</div>
    `, `
        <button class="btn btn-secondary" onclick="closeModal()">Fechar</button>
    `, 'wide');
}

function confirmDeleteSummary(id) {
    if (!confirm('Excluir este documento?')) return;
    data.summaries = data.summaries.filter(s => s.id !== id);
    saveData(data);

    if (currentView === 'subject-detail' && currentSubjectId) {
        showView('subject-detail', currentSubjectId);
    } else {
        showView('summaries');
    }
}

// ==================== TESTS ====================

function renderTests(main, filterSubjectId) {
    const filtered = filterSubjectId
        ? data.tests.filter(t => t.subjectId === filterSubjectId)
        : data.tests;

    main.innerHTML = `
        <div class="page-header">
            <h1>📋 Revisões</h1>
            <button class="btn btn-primary" onclick="showTestForm('')">📋 Nova Revisão</button>
        </div>
        <div class="filters">
            <select class="filter-select" onchange="showView('tests', this.value || null)">
                ${getSubjectSelectOptions(filterSubjectId || '')}
            </select>
        </div>
        ${filtered.length === 0 ? `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <h3>Nenhuma revisão encontrada</h3>
                <p>${data.subjects.length === 0 ? 'Cadastre um projeto primeiro.' : 'Crie uma revisão para começar.'}</p>
                ${data.subjects.length > 0 ? '<button class="btn btn-primary" onclick="showTestForm(\'\')">📋 Criar Revisão</button>' : '<button class="btn btn-primary" onclick="showView(\'subjects\')">📚 Criar Projeto</button>'}
            </div>
        ` : `
        <div class="list-container">
            ${filtered.map(t => {
                const sub = getSubject(t.subjectId);
                const results = getResultsByTest(t.id);
                const best = results.length > 0 ? Math.max(...results.map(r => r.score)) : null;
                return `
                <div class="list-item">
                    <div class="list-item-info">
                        <h4>${t.title}</h4>
                        <p>${sub ? `${sub.icon} ${sub.name}` : '?'} · ${t.questions.length} perguntas</p>
                        ${best !== null ? `<p style="font-size:12px;color:var(--success);">Melhor nota: ${best}/${t.questions.length} (${Math.round(best/t.questions.length*100)}%)</p>` : ''}
                    </div>
                    <div class="list-item-meta">
                        <button class="btn btn-success btn-sm" onclick="showView('test-taking','${t.id}')">▶️ Iniciar</button>
                        <button class="btn btn-secondary btn-sm" onclick="showTestForm('${t.subjectId}','${t.id}')">✏️</button>
                        <button class="btn btn-danger btn-sm" onclick="confirmDeleteTest('${t.id}')">🗑️</button>
                    </div>
                </div>`;
            }).join('')}
        </div>`}
    `;
}

function showTestForm(subjectId, id) {
    const test = id ? getTest(id) : null;
    const isEdit = !!test;

    const questionsHtml = test ? test.questions.map((q, i) => renderQuestionForm(i, q)).join('') : '';

    openModal(isEdit ? 'Editar Revisão' : 'Nova Revisão', `
        <div class="form-group">
            <label>Título da Revisão</label>
            <input class="form-input" id="f-test-title" value="${test ? test.title : ''}" placeholder="Ex: Equações do 2º Grau">
        </div>
        <div class="form-group">
            <label>Descrição</label>
            <input class="form-input" id="f-test-desc" value="${test ? test.description : ''}" placeholder="Descrição da revisão">
        </div>
        <div class="form-group">
            <label>Projeto</label>
            <select class="filter-select" id="f-test-subject" style="width:100%">
                ${data.subjects.map(s => {
                    const sel = (test ? test.subjectId : subjectId) === s.id ? 'selected' : '';
                    return `<option value="${s.id}" ${sel}>${s.icon} ${s.name}</option>`;
                }).join('')}
            </select>
        </div>
        <div class="form-group">
            <label>Perguntas</label>
            <div id="questions-container">${questionsHtml}</div>
            <button class="btn btn-secondary btn-sm" onclick="addQuestion()" style="margin-top:8px;">➕ Adicionar Pergunta</button>
        </div>
    `, `
        <button class="btn btn-secondary" onclick="closeModal()">Cancelar</button>
        <button class="btn btn-primary" onclick="saveTest('${id || ''}')">${isEdit ? 'Salvar' : 'Criar'}</button>
    `, 'wide');

}

function renderQuestionForm(index, q) {
    const letters = ['A', 'B', 'C', 'D', 'E'];
    return `
        <div class="question-card" data-qindex="${index}">
            <div class="question-card-header">
                <h4>Pergunta ${index + 1}</h4>
                <button class="btn-icon" onclick="removeQuestion(this)" style="color:var(--danger);font-size:18px;">🗑️</button>
            </div>
            <input class="question-input" placeholder="Digite a pergunta..." value="${q ? q.question.replace(/"/g, '&quot;') : ''}" data-field="question">
            <div class="options-list" data-options>
                ${(q ? q.options : ['', '', '', '']).map((opt, oi) => `
                    <div class="option-row ${q && q.correct === oi ? 'correct' : ''}" onclick="selectCorrectOption(this)" data-oi="${oi}">
                        <input type="radio" name="q${index}-correct" ${q && q.correct === oi ? 'checked' : ''}>
                        <span class="option-text">${letters[oi]}</span>
                        <input class="question-input" style="margin:0;flex:1;" placeholder="Opção ${letters[oi]}..." value="${opt.replace(/"/g, '&quot;')}" data-field="option">
                        <span class="correct-badge">${q && q.correct === oi ? '✓ Correta' : ''}</span>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function addQuestion() {
    const container = document.getElementById('questions-container');
    const count = container.children.length;
    const div = document.createElement('div');
    div.innerHTML = renderQuestionForm(count, null);
    container.appendChild(div.firstElementChild);
}

function removeQuestion(btn) {
    const card = btn.closest('.question-card');
    card.remove();
    document.querySelectorAll('.question-card').forEach((el, i) => {
        el.querySelector('h4').textContent = `Pergunta ${i + 1}`;
    });
}

function selectCorrectOption(el) {
    const card = el.closest('.question-card');
    card.querySelectorAll('.option-row').forEach(row => {
        row.classList.remove('correct');
        row.querySelector('.correct-badge').textContent = '';
    });
    el.classList.add('correct');
    el.querySelector('.correct-badge').textContent = '✓ Correta';
    el.querySelector('input[type="radio"]').checked = true;
}

function saveTest(id) {
    const title = document.getElementById('f-test-title').value.trim();
    const desc = document.getElementById('f-test-desc').value.trim();
    const subjectId = document.getElementById('f-test-subject').value;

    if (!title) { alert('Digite o título da revisão.'); return; }
    if (!subjectId) { alert('Selecione um projeto.'); return; }

    const questionCards = document.querySelectorAll('.question-card');
    if (questionCards.length === 0) { alert('Adicione pelo menos uma pergunta.'); return; }

    const questions = [];
    let valid = true;

    questionCards.forEach((card, i) => {
        const qText = card.querySelector('[data-field="question"]').value.trim();
        const optionRows = card.querySelectorAll('.option-row');
        const options = [];
        let correctIndex = -1;

        optionRows.forEach((row, oi) => {
            const optText = row.querySelector('[data-field="option"]').value.trim();
            options.push(optText);
            if (row.classList.contains('correct')) correctIndex = oi;
        });

        if (!qText) { valid = false; alert(`Pergunta ${i + 1} está vazia.`); return; }
        if (options.some(o => !o)) { valid = false; alert(`Preencha todas as opções da pergunta ${i + 1}.`); return; }
        if (correctIndex === -1) { valid = false; alert(`Selecione a resposta correta da pergunta ${i + 1}.`); return; }

        questions.push({ id: genId(), question: qText, options, correct: correctIndex });
    });

    if (!valid) return;

    if (id) {
        const t = getTest(id);
        if (t) {
            t.title = title;
            t.description = desc;
            t.subjectId = subjectId;
            t.questions = questions;
        }
    } else {
        data.tests.push({
            id: genId(),
            subjectId,
            title,
            description: desc,
            questions,
            createdAt: new Date().toISOString().slice(0, 10)
        });
    }

    saveData(data);
    closeModal();

    if (currentView === 'subject-detail' && currentSubjectId) {
        showView('subject-detail', currentSubjectId);
    } else {
        showView('tests');
    }
}

function confirmDeleteTest(id) {
    if (!confirm('Excluir esta revisão?')) return;
    data.results = data.results.filter(r => r.testId !== id);
    data.tests = data.tests.filter(t => t.id !== id);
    saveData(data);

    if (currentView === 'subject-detail' && currentSubjectId) {
        showView('subject-detail', currentSubjectId);
    } else {
        showView('tests');
    }
}

// ==================== TEST TAKING ====================

function renderTestTaking(main, id) {
    const test = getTest(id);
    if (!test) { showView('tests'); return; }

    const sub = getSubject(test.subjectId);
    const safeTitle = test.title.replace(/'/g, "\\'");
    const safeDesc = (test.description || '').replace(/'/g, "\\'");

    main.innerHTML = `
        <button class="btn-back" onclick="showView('tests')">← Voltar</button>
        <div class="test-container">
            <div class="test-header">
                <h1>${test.title}</h1>
                <p>${sub ? `${sub.icon} ${sub.name}` : ''} · ${test.questions.length} perguntas</p>
                ${test.description ? `<p style="margin-top:8px;color:var(--text-muted);">${test.description}</p>` : ''}
            </div>

            <div class="test-progress">
                <span class="progress-text" id="progress-text">0 de ${test.questions.length} respondidas</span>
            </div>

            <form id="test-form">
                ${test.questions.map((q, i) => {
                    const safeQ = q.question.replace(/'/g, "\\'");
                    return `
                    <div class="test-question" data-qindex="${i}">
                        <div class="q-number">Pergunta ${i + 1} de ${test.questions.length}</div>
                        <div class="q-text">${q.question}</div>
                        <div class="q-options">
                            ${q.options.map((opt, oi) => `
                                <label class="q-option" data-qid="${q.id}" data-oi="${oi}">
                                    <input type="radio" name="q${q.id}" value="${oi}" style="display:none">
                                    <span style="font-weight:600;color:var(--accent);min-width:24px;">${String.fromCharCode(65 + oi)}</span>
                                    <span>${opt}</span>
                                </label>
                            `).join('')}
                        </div>
                    </div>`;
                }).join('')}
            </form>

            <div class="test-submit-area">
                <button class="btn btn-success" onclick="submitTest('${test.id}')">✅ Finalizar Revisão</button>
            </div>
        </div>
    `;

    document.getElementById('test-form').addEventListener('click', function(e) {
        const label = e.target.closest('.q-option');
        if (!label) return;
        const radio = label.querySelector('input[type="radio"]');
        if (radio) {
            radio.checked = true;
            updateTestProgress();
        }
    });
}

function updateTestProgress() {
    const total = document.querySelectorAll('.test-question').length;
    const answered = document.querySelectorAll('.test-question input[type="radio"]:checked').length;
    const el = document.getElementById('progress-text');
    if (el) el.textContent = `${answered} de ${total} respondidas`;
}

function submitTest(testId) {
    const test = getTest(testId);
    if (!test) return;

    const answers = [];
    let answered = 0;

    test.questions.forEach(q => {
        const selected = document.querySelector(`input[name="q${q.id}"]:checked`);
        const answer = selected ? parseInt(selected.value) : -1;
        if (answer !== -1) answered++;
        answers.push({ questionId: q.id, selected: answer, correct: q.correct });
    });

    if (answered < test.questions.length) {
        if (!confirm(`Você respondeu apenas ${answered} de ${test.questions.length} perguntas. Deseja finalizar mesmo assim?`)) return;
    }

    const score = answers.filter(a => a.selected === a.correct).length;

    const result = {
        id: genId(),
        testId: test.id,
        subjectId: test.subjectId,
        answers,
        score,
        total: test.questions.length,
        date: new Date().toISOString()
    };

    data.results.push(result);
    saveData(data);

    showView('result-detail', result.id);
}

// ==================== RESULTS ====================

function renderResults(main) {
    const sortedResults = [...data.results].sort((a, b) => new Date(b.date) - new Date(a.date));

    main.innerHTML = `
        <div class="page-header">
            <h1>📈 Pareceres</h1>
        </div>
        ${sortedResults.length === 0 ? `
            <div class="empty-state">
                <div class="empty-icon">📈</div>
                <h3>Nenhum parecer ainda</h3>
                <p>Complete uma revisão para ver seus pareceres aqui.</p>
                <button class="btn btn-primary" onclick="showView('tests')">📋 Ver Revisões</button>
            </div>
        ` : `
        <div class="list-container">
            ${sortedResults.map(r => {
                const test = getTest(r.testId);
                const sub = getSubject(r.subjectId);
                const pct = Math.round(r.score / r.total * 100);
                const pctClass = pct >= 70 ? 'percentage-high' : pct >= 40 ? 'percentage-mid' : 'percentage-low';
                return `
                <div class="list-item" onclick="showView('result-detail','${r.id}')" style="cursor:pointer;">
                    <div class="list-item-info">
                        <h4>${test ? test.title : 'Revisão removida'}</h4>
                        <p>${sub ? `${sub.icon} ${sub.name}` : ''} · ${formatDate(r.date)}</p>
                    </div>
                    <div class="list-item-meta" style="gap:12px;">
                        <span class="${pctClass}" style="font-size:18px;font-weight:700;">${pct}%</span>
                        <span style="color:var(--text-secondary);font-size:13px;">${r.score}/${r.total}</span>
                        <button class="btn btn-secondary btn-sm" onclick="event.stopPropagation();showView('result-detail','${r.id}')">👁️ Detalhes</button>
                    </div>
                </div>`;
            }).join('')}
        </div>`}
    `;
}

// ==================== RESULT DETAIL ====================

function renderResultDetail(main, id) {
    const result = getResult(id);
    if (!result) { showView('results'); return; }

    const test = getTest(result.testId);
    const sub = getSubject(result.subjectId);
    const pct = Math.round(result.score / result.total * 100);
    const pctClass = pct >= 70 ? 'percentage-high' : pct >= 40 ? 'percentage-mid' : 'percentage-low';

    main.innerHTML = `
        <button class="btn-back" onclick="showView('results')">← Voltar</button>

        <div class="result-card">
            <div class="result-score">
                ${result.score}<span class="score-separator">/${result.total}</span>
            </div>
            <div class="result-label">${test ? test.title : 'Revisão removida'}</div>
            ${sub ? `<div style="color:var(--text-secondary);margin-top:4px;font-size:14px;">${sub.icon} ${sub.name}</div>` : ''}
            <div class="result-percentage ${pctClass}">${pct}%</div>
            <div style="color:var(--text-muted);font-size:13px;margin-top:8px;">${formatDate(result.date)}</div>
        </div>

        <div class="result-details">
            <div class="detail-row">
                <span>✅ Corretas</span>
                <span class="result-stat-correct">${result.score}</span>
            </div>
            <div class="detail-row">
                <span>❌ Incorretas</span>
                <span class="result-stat-wrong">${result.total - result.score}</span>
            </div>
            <div class="detail-row">
                <span>📊 Aproveitamento</span>
                <span class="${pctClass}">${pct}%</span>
            </div>
        </div>

        ${test ? `
        <h3 style="font-size:16px;margin-bottom:12px;">Revisão das Perguntas</h3>
        <div class="result-answers">
            ${result.answers.map((a, i) => {
                const q = test.questions[i];
                if (!q) return '';
                const isCorrect = a.selected === a.correct;
                const letters = ['A', 'B', 'C', 'D', 'E'];
                return `
                <div class="result-answer">
                    <div class="ra-question">${i + 1}. ${q.question}</div>
                    ${q.options.map((opt, oi) => {
                        let cls = '';
                        let label = '';
                        if (oi === a.correct) { cls = 'ra-correct'; label = '✓ Resposta correta'; }
                        else if (oi === a.selected && !isCorrect) { cls = 'ra-wrong'; label = '✗ Sua resposta'; }
                        else { return ''; }
                        return `<div class="ra-option ${cls}">${letters[oi]}. ${opt} <span>${label}</span></div>`;
                    }).join('')}
                </div>`;
            }).join('')}
        </div>` : ''}

        <div style="text-align:center;margin-top:20px;">
            ${test ? `<button class="btn btn-primary" onclick="showView('test-taking','${test.id}')">🔄 Refazer Revisão</button>` : ''}
        </div>
    `;
}

// ==================== MODAL ====================

function openModal(title, bodyHtml, footerHtml, extraClass) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHtml;
    document.getElementById('modal-footer').innerHTML = footerHtml || '';

    const modal = document.getElementById('modal');
    modal.classList.remove('hidden', 'wide', 'full');
    if (extraClass) modal.classList.add(extraClass);

    document.getElementById('modal-overlay').classList.remove('hidden');
    modal.style.display = 'flex';
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
    document.getElementById('modal-overlay').classList.add('hidden');
}

// ==================== RESET ====================

function resetAll() {
    if (!confirm('Tem certeza que deseja resetar todos os dados? Esta ação não pode ser desfeita.')) return;
    if (!confirm('Todos os documentos, revisões e pareceres serão perdidos. Confirma?')) return;

    data = resetData();
    showView('dashboard');
}

// ==================== INIT ====================

showView('dashboard');
