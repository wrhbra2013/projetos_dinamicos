import json
import os
from datetime import datetime
import fcntl

DB_PATH = os.environ.get('FILE_DB_PATH', 'data.json')


def _read_db(path=DB_PATH):
    if not os.path.exists(path):
        return None
    with open(path, 'r') as f:
        try:
            fcntl.flock(f, fcntl.LOCK_SH)
            data = json.load(f)
        finally:
            try:
                fcntl.flock(f, fcntl.LOCK_UN)
            except Exception:
                pass
    return data


def _write_db(obj, path=DB_PATH):
    tmp = path + '.tmp'
    with open(tmp, 'w') as f:
        try:
            fcntl.flock(f, fcntl.LOCK_EX)
            json.dump(obj, f, default=str, ensure_ascii=False, indent=2)
            f.flush()
            os.fsync(f.fileno())
        finally:
            try:
                fcntl.flock(f, fcntl.LOCK_UN)
            except Exception:
                pass
    os.replace(tmp, path)


def init_db_file(path=DB_PATH):
    if os.path.exists(path):
        return
    base = {
        'projetos': [],
        'atividades': [],
        'next_projeto_id': 1,
        'next_atividade_id': 1
    }
    _write_db(base, path)


def _now_iso():
    return datetime.now().isoformat()


def get_projetos(path=DB_PATH):
    data = _read_db(path) or {'projetos': []}
    return data.get('projetos', [])


def get_projeto(projeto_id, path=DB_PATH):
    projetos = get_projetos(path)
    for p in projetos:
        if p.get('id') == int(projeto_id):
            return p
    return None


def insert_projeto(nome, descricao, path=DB_PATH):
    data = _read_db(path) or {'projetos': [], 'atividades': [], 'next_projeto_id': 1, 'next_atividade_id': 1}
    pid = data.get('next_projeto_id', 1)
    projeto = {
        'id': pid,
        'nome': nome,
        'descricao': descricao,
        'data_criacao': _now_iso()
    }
    data['projetos'].append(projeto)
    data['next_projeto_id'] = pid + 1
    _write_db(data, path)
    return projeto


def get_atividades(filters=None, path=DB_PATH):
    data = _read_db(path) or {'atividades': []}
    atividades = data.get('atividades', [])
    if not filters:
        return sorted(atividades, key=lambda x: x.get('created_at', ''), reverse=True)
    res = []
    for a in atividades:
        ok = True
        if 'projeto_id' in filters and filters['projeto_id'] is not None:
            if int(a.get('projeto_id')) != int(filters['projeto_id']):
                ok = False
        if 'prioridade' in filters and filters['prioridade']:
            if (a.get('prioridade') or '').lower() != filters['prioridade'].lower():
                ok = False
        if 'status' in filters and filters['status']:
            if (a.get('status') or '').lower() != filters['status'].lower():
                ok = False
        if ok:
            res.append(a)
    return sorted(res, key=lambda x: x.get('created_at', ''), reverse=True)


def insert_atividade(projeto_id, nome, stack, data_hora, prioridade, relatorio, status, path=DB_PATH):
    data = _read_db(path) or {'projetos': [], 'atividades': [], 'next_projeto_id': 1, 'next_atividade_id': 1}
    aid = data.get('next_atividade_id', 1)
    atividade = {
        'id': aid,
        'projeto_id': int(projeto_id) if projeto_id is not None else None,
        'nome': nome,
        'stack': stack,
        'data_hora': data_hora.isoformat() if hasattr(data_hora, 'isoformat') else str(data_hora),
        'prioridade': prioridade,
        'relatorio': relatorio,
        'status': status,
        'created_at': _now_iso()
    }
    data['atividades'].append(atividade)
    data['next_atividade_id'] = aid + 1
    _write_db(data, path)
    return atividade


def update_atividade_status(aid, status, path=DB_PATH):
    data = _read_db(path) or {}
    updated = False
    for a in data.get('atividades', []):
        if int(a.get('id')) == int(aid):
            a['status'] = status
            updated = True
            break
    if updated:
        _write_db(data, path)
    return updated


def delete_atividade(aid, path=DB_PATH):
    data = _read_db(path) or {}
    before = len(data.get('atividades', []))
    data['atividades'] = [a for a in data.get('atividades', []) if int(a.get('id')) != int(aid)]
    after = len(data.get('atividades', []))
    if after != before:
        _write_db(data, path)
        return True
    return False


def delete_projeto(projeto_id, path=DB_PATH):
    data = _read_db(path) or {}
    before_p = len(data.get('projetos', []))
    data['projetos'] = [p for p in data.get('projetos', []) if int(p.get('id')) != int(projeto_id)]
    after_p = len(data.get('projetos', []))
    # remove atividades relacionadas
    data['atividades'] = [a for a in data.get('atividades', []) if int(a.get('projeto_id')) != int(projeto_id)]
    if after_p != before_p:
        _write_db(data, path)
        return True
    return False

*** End Patch