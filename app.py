import os
from datetime import datetime
from flask import Flask, render_template, request, redirect, url_for, send_file, flash
from io import BytesIO
from datetime import datetime as _dt
import file_db
from fpdf import FPDF

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'projetosdinamicos2026_seguro')

# Configuração do Banco de Dados PostgreSQL
DATABASE_URL = os.environ.get('DATABASE_URL', 'postgresql://postgres:wander@localhost:5432/projedydb')

def init_db():
    """Inicializa armazenamento em arquivo se não existir."""
    file_db.init_db_file()

# --- ROTAS PRINCIPAIS ---

@app.route('/')
def index():
    # Busca projetos e atividades para o dashboard (arquivo JSON)
    projetos = file_db.get_projetos()
    atividades = file_db.get_atividades()

    # Separa por status para o quadro visual (Status Board)
    concluidos = [a for a in atividades if a.get('status') == 'concluido']
    andamentos = [a for a in atividades if a.get('status') == 'andamento']
    planejamentos = [a for a in atividades if a.get('status') == 'planejamento']

    return render_template('index.html', 
                           projetos=projetos, 
                           concluidos=concluidos, 
                           andamentos=andamentos, 
                           planejamentos=planejamentos)

@app.route('/projeto/criar', methods=['POST'])
def criar_projeto():      
    nome = request.form['nome']
    descricao = request.form['descricao']
    # Ensure file_db.insert_projeto is called
    file_db.insert_projeto(nome, descricao)
    return redirect(url_for('index'))

@app.route('/projeto/<int:projeto_id>', methods=['GET', 'POST'])
def projeto_detalhes(projeto_id):
    if request.method == 'POST':
        nome = request.form['nome_atividade']
        stack = request.form.get('stack')
        if stack == 'other':
            new_stack = (request.form.get('new_stack') or '').strip()
            stack = new_stack if new_stack else 'Outro'
        prioridade = request.form['prioridade']
        relatorio = request.form['relatorio']
        status = request.form.get('status', 'planejamento')
        # Usa timestamp do servidor (não pede a data/hora ao usuário)
        data_conv = datetime.now()
        file_db.insert_atividade(projeto_id, nome, stack, data_conv, prioridade, relatorio, status)

    projeto = file_db.get_projeto(projeto_id)
    atividades = file_db.get_atividades({'projeto_id': projeto_id})
    # converte datas ISO para datetime no template
    for a in atividades:
        if a.get('data_hora'):
            try:
                a['data_hora'] = datetime.fromisoformat(a['data_hora'])
            except Exception:
                pass

    return render_template('projeto.html', projeto=projeto, atividades=atividades)

@app.route('/relatorio')
def relatorio():
    projeto_id = request.args.get('projeto_id')
    prioridade = request.args.get('prioridade')
    status = request.args.get('status')
    filtros = {}
    if projeto_id: filtros['projeto_id'] = projeto_id
    if prioridade: filtros['prioridade'] = prioridade
    if status: filtros['status'] = status
    atividades_raw = file_db.get_atividades(filtros)
    projetos = file_db.get_projetos()
    projetos_map = {p['id']: p['nome'] for p in projetos}

    atividades = []
    for a in atividades_raw:
        item = a.copy()
        item['projeto_nome'] = projetos_map.get(item.get('projeto_id'))
        item['atividade_nome'] = item.get('nome')
        if item.get('data_hora'):
            try:
                item['data_hora'] = datetime.fromisoformat(item['data_hora'])
            except Exception:
                pass
        atividades.append(item)

    return render_template('relatorio.html', atividades=atividades, projetos=projetos)


@app.route('/relatorio/fluxograma')
def relatorio_fluxograma():
    projeto_id = request.args.get('projeto_id')
    prioridade = request.args.get('prioridade')
    status = request.args.get('status')
    filtros = {}
    if projeto_id: filtros['projeto_id'] = projeto_id
    if prioridade: filtros['prioridade'] = prioridade
    if status: filtros['status'] = status
    atividades_raw = file_db.get_atividades(filtros)
    projetos = file_db.get_projetos()
    projetos_map = {p['id']: p['nome'] for p in projetos}
    # Enriquecer atividades com nomes e converter datas quando possível
    atividades = []
    for a in atividades_raw:
        item = a.copy()
        item['projeto_nome'] = projetos_map.get(item.get('projeto_id'))
        item['atividade_nome'] = item.get('nome')
        if item.get('data_hora'):
            try:
                item['data_hora'] = datetime.fromisoformat(item['data_hora'])
            except Exception:
                pass
        atividades.append(item)

    # Agrupa atividades por projeto e calcula estatísticas
    from collections import defaultdict
    projetos = defaultdict(lambda: {'id': None, 'nome': '', 'atividades': [], 'total': 0, 'concluidas': 0})
    for a in atividades:
        pid = a.get('projeto_id')
        pname = a.get('projeto_nome') or 'Sem Projeto'
        projetos[pname]['id'] = pid
        projetos[pname]['nome'] = pname
        projetos[pname]['atividades'].append(a)
        projetos[pname]['total'] += 1
        if a.get('status') == 'concluido':
            projetos[pname]['concluidas'] += 1

    mermaid_lines = ['graph LR']
    # Define classes para status
    mermaid_lines.append('classDef concluido fill:#cfe8cf,stroke:#2d8a2d;')
    mermaid_lines.append('classDef andamento fill:#fff3b0,stroke:#e6b800;')
    mermaid_lines.append('classDef planejamento fill:#f0f0f0,stroke:#888888;')

    # Para cada projeto, cria um subgraph com atividades
    for pname, p in projetos.items():
        pct = int((p['concluidas'] / p['total']) * 100) if p['total'] > 0 else 0
        title = f"{pname} ({pct}%)"
        mermaid_lines.append(f'subgraph "{title}"')
        for a in p['atividades']:
            aid = a.get('id')
            aname = (a.get('atividade_nome') or '').replace('"', '')
            status_txt = (a.get('status') or 'planejamento')
            # node with status
            mermaid_lines.append(f'A{aid}["{aname}\\n({status_txt})"]')
            # class assignment
            cls = 'planejamento'
            if status_txt == 'concluido':
                cls = 'concluido'
            elif status_txt == 'andamento':
                cls = 'andamento'
            mermaid_lines.append(f'class A{aid} {cls};')
        mermaid_lines.append('end')

    mermaid = "\n".join(mermaid_lines)
    # Ordena projetos para exibir resumo na página
    projetos_list = []
    for pname, p in projetos.items():
        pct = int((p['concluidas'] / p['total']) * 100) if p['total'] > 0 else 0
        projetos_list.append({'nome': pname, 'total': p['total'], 'concluidas': p['concluidas'], 'pct': pct})

    return render_template('relatorio_fluxograma.html', mermaid=mermaid, projetos_summary=projetos_list)

@app.route('/atividades/status/<int:id>', methods=['POST'])
def update_status(id):
    novo_status = request.form.get('status')
    file_db.update_atividade_status(id, novo_status)
    return redirect(request.referrer or url_for('index'))

@app.route('/atividades/delete/<int:id>', methods=['POST'])
def delete_atividade(id):
    file_db.delete_atividade(id)
    flash('Atividade removida com sucesso!', 'success')
    return redirect(request.referrer or url_for('relatorio'))

@app.route('/projeto/delete/<int:projeto_id>', methods=['POST'])
def delete_projeto(projeto_id):
    file_db.delete_projeto(projeto_id)
    return redirect(url_for('index'))

@app.route('/relatorio/pdf')
def gerar_pdf():
    projeto_id = request.args.get('projeto_id')
    prioridade = request.args.get('prioridade')
    status = request.args.get('status')
    filtros = {}
    if projeto_id: filtros['projeto_id'] = projeto_id
    if prioridade: filtros['prioridade'] = prioridade
    if status: filtros['status'] = status
    atividades_raw = file_db.get_atividades(filtros)
    projetos = file_db.get_projetos()
    projetos_map = {p['id']: p['nome'] for p in projetos}

    atividades = []
    for a in atividades_raw:
        item = a.copy()
        item['projeto_nome'] = projetos_map.get(item.get('projeto_id'))
        item['atividade_nome'] = item.get('nome')
        if item.get('data_hora'):
            try:
                item['data_hora'] = datetime.fromisoformat(item['data_hora'])
            except Exception:
                pass
        atividades.append(item)

    # Agrupa por projeto e calcula estatísticas de progresso
    from collections import defaultdict
    projetos_stats = defaultdict(lambda: {
        'nome': '', 'total': 0, 'concluidas': 0, 'datas': []
    })
    for a in atividades:
        pid = a.get('projeto_id') or a.get('id')
        pid = a.get('projeto_id') if a.get('projeto_id') is not None else None
        proj_name = a.get('projeto_nome') or 'Sem Projeto'
        projetos_stats[proj_name]['nome'] = proj_name
        projetos_stats[proj_name]['total'] += 1
        if a.get('status') == 'concluido':
            projetos_stats[proj_name]['concluidas'] += 1
        if a.get('data_hora'):
            projetos_stats[proj_name]['datas'].append(a.get('data_hora'))

    # Monta PDF textual com resumo por projeto
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font('Arial', 'B', 16)
    pdf.cell(0, 10, 'Relatório de Atividades - Resumo', ln=True, align='C')
    pdf.ln(6)

    now = datetime.now()
    pdf.set_font('Arial', size=11)
    for proj, stats in projetos_stats.items():
        total = stats['total']
        concluidas = stats['concluidas']
        pct = int((concluidas / total) * 100) if total > 0 else 0

        pdf.set_font('Arial', 'B', 12)
        header = f"Projeto: {proj} — {concluidas}/{total} concluídas ({pct}%)"
        pdf.multi_cell(0, 7, header)
        pdf.set_font('Arial', size=10)

        # Barra de progresso textual
        bar_len = 30
        filled = int((pct * bar_len) / 100)
        bar = '[' + ('#' * filled) + ('-' * (bar_len - filled)) + f'] {pct}%'
        pdf.multi_cell(0, 6, bar)

        # Estimativa de progresso por tempo (se houver datas planejadas)
        if len(stats['datas']) >= 2:
            dmin = min(stats['datas'])
            dmax = max(stats['datas'])
            try:
                total_seconds = (dmax - dmin).total_seconds()
                elapsed_seconds = (now - dmin).total_seconds()
                time_pct = max(0, min(100, int((elapsed_seconds / total_seconds) * 100))) if total_seconds > 0 else 0
                time_line = f"Progresso temporal estimado: {time_pct}% (de {dmin.strftime('%Y-%m-%d')} até {dmax.strftime('%Y-%m-%d')})"
                pdf.multi_cell(0, 6, time_line)
            except Exception:
                pass

        # Lista das atividades do projeto (até N itens para evitar PDF gigante)
        pdf.ln(2)
        pdf.set_font('Arial', size=9)
        count = 0
        for a in [x for x in atividades if x.get('projeto_nome') == proj]:
            if count >= 40:
                pdf.multi_cell(0, 6, '... (mais atividades não listadas)')
                break
            ativ = a.get('atividade_nome') or '—'
            status_txt = a.get('status') or ''
            prioridade_txt = a.get('prioridade') or ''
            data_hora = ''
            if a.get('data_hora'):
                try:
                    data_hora = a['data_hora'].strftime('%Y-%m-%d')
                except Exception:
                    data_hora = str(a['data_hora'])
            line = f"- {ativ} | Data: {data_hora} | Prioridade: {prioridade_txt} | Status: {status_txt}"
            safe_line = line.encode('latin-1', 'replace').decode('latin-1')
            pdf.multi_cell(0, 5, safe_line)
            count += 1

        pdf.ln(4)

    # Opcional: adicionar seção de auditoria/resumo de recomendações simples
    pdf.set_font('Arial', 'B', 12)
    pdf.cell(0, 8, 'Auditoria Rápida e Recomendações', ln=True)
    pdf.set_font('Arial', size=9)
    pdf.multi_cell(0, 5, '- Verificar validação de entradas no frontend e backend.')
    pdf.multi_cell(0, 5, '- Habilitar backups regulares do banco de dados.')
    pdf.multi_cell(0, 5, '- Adicionar testes automatizados e CI para deploys seguros.')
    pdf.multi_cell(0, 5, '- Considerar índices em colunas frequentemente filtradas (projeto_id, status, prioridade).')

    pdf_output = pdf.output(dest='S').encode('latin-1', 'replace')
    pdf_stream = BytesIO(pdf_output)
    pdf_stream.seek(0)
    return send_file(pdf_stream, mimetype='application/pdf', as_attachment=True, download_name='relatorio_resumo.pdf')

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)