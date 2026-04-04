<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

define('DB_FILE', __DIR__ . '/data/database.sqlite');

function getDB() {
    static $db = null;
    if ($db === null) {
        $db = new PDO('sqlite:' . DB_FILE);
        $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        initDB($db);
    }
    return $db;
}

function initDB($db) {
    $db->exec("CREATE TABLE IF NOT EXISTS projetos (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        descricao TEXT,
        status TEXT DEFAULT 'planejamento',
        template TEXT,
        stakeholders TEXT,
        objetivos TEXT,
        escopo_inclui TEXT,
        escopo_nao_inclui TEXT,
        data_inicio TEXT,
        data_fim TEXT,
        orcamento REAL DEFAULT 0,
        equipe TEXT,
        created_at TEXT,
        updated_at TEXT
    )");
    
    $db->exec("CREATE TABLE IF NOT EXISTS atividades (
        id TEXT PRIMARY KEY,
        projeto_id TEXT NOT NULL,
        titulo TEXT NOT NULL,
        descricao TEXT,
        status TEXT DEFAULT 'pendente',
        stack TEXT DEFAULT 'outro',
        prioridade TEXT DEFAULT 'media',
        dependencia TEXT,
        equipe TEXT,
        responsavel TEXT,
        data_inicio TEXT,
        data_fim TEXT,
        horas_estimadas REAL DEFAULT 0,
        horas_realizadas REAL DEFAULT 0,
        tags TEXT,
        created_at TEXT,
        updated_at TEXT,
        FOREIGN KEY (projeto_id) REFERENCES projetos(id)
    )");
    
    $db->exec("CREATE TABLE IF NOT EXISTS licoes (
        id TEXT PRIMARY KEY,
        projeto_id TEXT NOT NULL,
        tipo TEXT DEFAULT 'positiva',
        categoria TEXT DEFAULT 'processo',
        descricao TEXT,
        acao TEXT,
        impacto TEXT DEFAULT 'medio',
        autor TEXT,
        created_at TEXT,
        FOREIGN KEY (projeto_id) REFERENCES projetos(id)
    )");
    
    $db->exec("CREATE TABLE IF NOT EXISTS templates (
        id TEXT PRIMARY KEY,
        nome TEXT NOT NULL,
        descricao TEXT,
        categoria TEXT DEFAULT 'personalizado',
        atividades TEXT,
        created_at TEXT
    )");
}

function generateId($prefix = 'id_') {
    return $prefix . time() . '_' . bin2hex(random_bytes(4));
}

function getJsonInput() {
    $input = file_get_contents('php://input');
    return $input ? json_decode($input, true) : [];
}

function toJson($data) {
    return json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

$response = ['success' => false, 'data' => null, 'error' => null];

try {
    switch ($action) {
        case 'health':
            $response['success'] = true;
            $response['data'] = ['status' => 'ok', 'db' => DB_FILE, 'timestamp' => date('c')];
            break;

        case 'projetos':
            $response = handleProjetos($method, getJsonInput());
            break;

        case 'atividades':
            $response = handleAtividades($method, getJsonInput());
            break;

        case 'licoes':
            $response = handleLicoes($method, getJsonInput());
            break;

        case 'templates':
            $response = handleTemplates($method, getJsonInput());
            break;

        case 'sync':
            $response = handleSync($method, getJsonInput());
            break;

        default:
            $response['error'] = 'Ação não encontrada';
    }
} catch (Exception $e) {
    $response['error'] = $e->getMessage();
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);

function handleProjetos($method, $input) {
    $db = getDB();
    $response = ['success' => false, 'data' => null, 'error' => null];
    
    switch ($method) {
        case 'GET':
            $stmt = $db->query("SELECT * FROM projetos ORDER BY created_at DESC");
            $projetos = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($projetos as &$p) {
                $p['stakeholders'] = json_decode($p['stakeholders'] ?? '[]', true);
                $p['objetivos'] = json_decode($p['objetivos'] ?? '[]', true);
                $p['escopo'] = ['inclui' => json_decode($p['escopo_inclui'] ?? '[]', true), 'nao_inclui' => json_decode($p['escopo_nao_inclui'] ?? '[]', true)];
                $p['equipe'] = json_decode($p['equipe'] ?? '[]', true);
            }
            $response['success'] = true;
            $response['data'] = $projetos;
            break;

        case 'POST':
            $id = generateId('proj_');
            $stmt = $db->prepare("INSERT INTO projetos (id, nome, descricao, status, template, stakeholders, objetivos, escopo_inclui, escopo_nao_inclui, data_inicio, data_fim, orcamento, equipe, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $input['nome'] ?? 'Novo Projeto',
                $input['descricao'] ?? '',
                $input['status'] ?? 'planejamento',
                $input['template'] ?? null,
                json_encode($input['stakeholders'] ?? []),
                json_encode($input['objetivos'] ?? []),
                json_encode($input['escopo']['inclui'] ?? []),
                json_encode($input['escopo']['nao_inclui'] ?? []),
                $input['data_inicio'] ?? date('Y-m-d'),
                $input['data_fim'] ?? null,
                $input['orcamento'] ?? 0,
                json_encode($input['equipe'] ?? []),
                date('c'),
                date('c')
            ]);
            $response['success'] = true;
            $response['data'] = ['id' => $id, 'nome' => $input['nome'] ?? 'Novo Projeto'];
            break;

        case 'PUT':
            $stmt = $db->prepare("UPDATE projetos SET nome = ?, descricao = ?, status = ?, template = ?, stakeholders = ?, objetivos = ?, escopo_inclui = ?, escopo_nao_inclui = ?, data_inicio = ?, data_fim = ?, orcamento = ?, equipe = ?, updated_at = ? WHERE id = ?");
            $stmt->execute([
                $input['nome'] ?? '',
                $input['descricao'] ?? '',
                $input['status'] ?? 'planejamento',
                $input['template'] ?? null,
                json_encode($input['stakeholders'] ?? []),
                json_encode($input['objetivos'] ?? []),
                json_encode($input['escopo']['inclui'] ?? []),
                json_encode($input['escopo']['nao_inclui'] ?? []),
                $input['data_inicio'] ?? null,
                $input['data_fim'] ?? null,
                $input['orcamento'] ?? 0,
                json_encode($input['equipe'] ?? []),
                date('c'),
                $input['id'] ?? ''
            ]);
            $response['success'] = true;
            $response['data'] = ['id' => $input['id'] ?? ''];
            break;

        case 'DELETE':
            $db->prepare("DELETE FROM atividades WHERE projeto_id = ?")->execute([$input['id'] ?? '']);
            $db->prepare("DELETE FROM projetos WHERE id = ?")->execute([$input['id'] ?? '']);
            $response['success'] = true;
            break;
    }
    
    return $response;
}

function handleAtividades($method, $input) {
    $db = getDB();
    $response = ['success' => false, 'data' => null, 'error' => null];
    
    switch ($method) {
        case 'GET':
            $projeto_id = $_GET['projeto_id'] ?? null;
            if ($projeto_id) {
                $stmt = $db->prepare("SELECT * FROM atividades WHERE projeto_id = ? ORDER BY created_at DESC");
                $stmt->execute([$projeto_id]);
            } else {
                $stmt = $db->query("SELECT * FROM atividades ORDER BY created_at DESC");
            }
            $atividades = $stmt->fetchAll(PDO::FETCH_ASSOC);
            foreach ($atividades as &$a) {
                $a['tags'] = json_decode($a['tags'] ?? '[]', true);
            }
            $response['success'] = true;
            $response['data'] = $atividades;
            break;

        case 'POST':
            $id = generateId('atk_');
            $stmt = $db->prepare("INSERT INTO atividades (id, projeto_id, titulo, descricao, status, stack, prioridade, dependencia, equipe, responsavel, data_inicio, data_fim, horas_estimadas, horas_realizadas, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $input['projeto_id'] ?? '',
                $input['titulo'] ?? 'Nova Atividade',
                $input['descricao'] ?? '',
                $input['status'] ?? 'pendente',
                $input['stack'] ?? 'outro',
                $input['prioridade'] ?? 'media',
                $input['dependencia'] ?? '',
                $input['equipe'] ?? '',
                $input['responsavel'] ?? '',
                $input['data_inicio'] ?? date('Y-m-d'),
                $input['data_fim'] ?? null,
                $input['horas_estimadas'] ?? 0,
                $input['horas_realizadas'] ?? 0,
                json_encode($input['tags'] ?? []),
                date('c'),
                date('c')
            ]);
            $response['success'] = true;
            $response['data'] = ['id' => $id, 'titulo' => $input['titulo'] ?? 'Nova Atividade'];
            break;

        case 'PUT':
            $stmt = $db->prepare("UPDATE atividades SET projeto_id = ?, titulo = ?, descricao = ?, status = ?, stack = ?, prioridade = ?, dependencia = ?, equipe = ?, responsavel = ?, data_inicio = ?, data_fim = ?, horas_estimadas = ?, horas_realizadas = ?, tags = ?, updated_at = ? WHERE id = ?");
            $stmt->execute([
                $input['projeto_id'] ?? '',
                $input['titulo'] ?? '',
                $input['descricao'] ?? '',
                $input['status'] ?? 'pendente',
                $input['stack'] ?? 'outro',
                $input['prioridade'] ?? 'media',
                $input['dependencia'] ?? '',
                $input['equipe'] ?? '',
                $input['responsavel'] ?? '',
                $input['data_inicio'] ?? null,
                $input['data_fim'] ?? null,
                $input['horas_estimadas'] ?? 0,
                $input['horas_realizadas'] ?? 0,
                json_encode($input['tags'] ?? []),
                date('c'),
                $input['id'] ?? ''
            ]);
            $response['success'] = true;
            $response['data'] = ['id' => $input['id'] ?? ''];
            break;

        case 'DELETE':
            $db->prepare("DELETE FROM atividades WHERE id = ?")->execute([$input['id'] ?? '']);
            $response['success'] = true;
            break;
    }
    
    return $response;
}

function handleLicoes($method, $input) {
    $db = getDB();
    $response = ['success' => false, 'data' => null, 'error' => null];
    
    switch ($method) {
        case 'GET':
            $projeto_id = $_GET['projeto_id'] ?? null;
            if ($projeto_id) {
                $stmt = $db->prepare("SELECT * FROM licoes WHERE projeto_id = ? ORDER BY created_at DESC");
                $stmt->execute([$projeto_id]);
            } else {
                $stmt = $db->query("SELECT * FROM licoes ORDER BY created_at DESC");
            }
            $response['success'] = true;
            $response['data'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            break;

        case 'POST':
            $id = generateId('lic_');
            $stmt = $db->prepare("INSERT INTO licoes (id, projeto_id, tipo, categoria, descricao, acao, impacto, autor, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $input['projeto_id'] ?? '',
                $input['tipo'] ?? 'positiva',
                $input['categoria'] ?? 'processo',
                $input['descricao'] ?? '',
                $input['acao'] ?? '',
                $input['impacto'] ?? 'medio',
                $input['autor'] ?? '',
                date('c')
            ]);
            $response['success'] = true;
            $response['data'] = ['id' => $id];
            break;

        case 'DELETE':
            $db->prepare("DELETE FROM licoes WHERE id = ?")->execute([$input['id'] ?? '']);
            $response['success'] = true;
            break;
    }
    
    return $response;
}

function handleTemplates($method, $input) {
    $db = getDB();
    $response = ['success' => false, 'data' => null, 'error' => null];
    
    switch ($method) {
        case 'GET':
            $stmt = $db->query("SELECT * FROM templates ORDER BY created_at DESC");
            $templates = $stmt->fetchAll(PDO::FETCH_ASSOC);
            if (empty($templates)) {
                $templates = getDefaultTemplates($db);
            }
            foreach ($templates as &$t) {
                $t['atividades'] = json_decode($t['atividades'] ?? '[]', true);
            }
            $response['success'] = true;
            $response['data'] = $templates;
            break;

        case 'POST':
            $id = generateId('tpl_');
            $stmt = $db->prepare("INSERT INTO templates (id, nome, descricao, categoria, atividades, created_at) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt->execute([
                $id,
                $input['nome'] ?? 'Novo Template',
                $input['descricao'] ?? '',
                $input['categoria'] ?? 'personalizado',
                json_encode($input['atividades'] ?? []),
                date('c')
            ]);
            $response['success'] = true;
            $response['data'] = ['id' => $id];
            break;
    }
    
    return $response;
}

function handleSync($method, $input) {
    $db = getDB();
    $response = ['success' => false, 'data' => null, 'error' => null];
    
    if ($method === 'POST') {
        if (!empty($input['projetos'])) {
            foreach ($input['projetos'] as $p) {
                $stmt = $db->prepare("INSERT OR REPLACE INTO projetos (id, nome, descricao, status, template, stakeholders, objetivos, escopo_inclui, escopo_nao_inclui, data_inicio, data_fim, orcamento, equipe, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $p['id'], $p['nome'] ?? '', $p['descricao'] ?? '', $p['status'] ?? 'planejamento',
                    $p['template'] ?? null, json_encode($p['stakeholders'] ?? []), json_encode($p['objetivos'] ?? []),
                    json_encode($p['escopo']['inclui'] ?? []), json_encode($p['escopo']['nao_inclui'] ?? []),
                    $p['data_inicio'] ?? null, $p['data_fim'] ?? null, $p['orcamento'] ?? 0,
                    json_encode($p['equipe'] ?? []), $p['created_at'] ?? date('c'), date('c')
                ]);
            }
        }
        
        if (!empty($input['atividades'])) {
            foreach ($input['atividades'] as $a) {
                $stmt = $db->prepare("INSERT OR REPLACE INTO atividades (id, projeto_id, titulo, descricao, status, stack, prioridade, dependencia, equipe, responsavel, data_inicio, data_fim, horas_estimadas, horas_realizadas, tags, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt->execute([
                    $a['id'], $a['projeto_id'] ?? '', $a['titulo'] ?? '', $a['descricao'] ?? '',
                    $a['status'] ?? 'pendente', $a['stack'] ?? 'outro', $a['prioridade'] ?? 'media',
                    $a['dependencia'] ?? '', $a['equipe'] ?? '', $a['responsavel'] ?? '',
                    $a['data_inicio'] ?? null, $a['data_fim'] ?? null, $a['horas_estimadas'] ?? 0,
                    $a['horas_realizadas'] ?? 0, json_encode($a['tags'] ?? []),
                    $a['created_at'] ?? date('c'), date('c')
                ]);
            }
        }
        
        $response['success'] = true;
        $response['data'] = ['synced' => true, 'timestamp' => date('c')];
    } else {
        $stmt = $db->query("SELECT * FROM projetos ORDER BY created_at DESC");
        $projetos = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $stmt = $db->query("SELECT * FROM atividades ORDER BY created_at DESC");
        $atividades = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($projetos as &$p) {
            $p['stakeholders'] = json_decode($p['stakeholders'] ?? '[]', true);
            $p['objetivos'] = json_decode($p['objetivos'] ?? '[]', true);
            $p['escopo'] = ['inclui' => json_decode($p['escopo_inclui'] ?? '[]', true), 'nao_inclui' => json_decode($p['escopo_nao_inclui'] ?? '[]', true)];
            $p['equipe'] = json_decode($p['equipe'] ?? '[]', true);
        }
        foreach ($atividades as &$a) {
            $a['tags'] = json_decode($a['tags'] ?? '[]', true);
        }
        
        $response['success'] = true;
        $response['data'] = ['projetos' => $projetos, 'atividades' => $atividades];
    }
    
    return $response;
}

function getDefaultTemplates($db) {
    $templates = [
        ['id' => 'tpl_web', 'nome' => 'Projeto Web', 'descricao' => 'Template para projetos web padrão', 'categoria' => 'desenvolvimento', 'atividades' => [
            ['titulo' => 'Definir requisitos', 'stack' => 'gestao', 'prioridade' => 'alta', 'horas_estimadas' => 8],
            ['titulo' => 'Criar wireframes', 'stack' => 'design', 'prioridade' => 'alta', 'horas_estimadas' => 16],
            ['titulo' => 'Setup ambiente', 'stack' => 'backend', 'prioridade' => 'media', 'horas_estimadas' => 4],
            ['titulo' => 'Desenvolver frontend', 'stack' => 'frontend', 'prioridade' => 'alta', 'horas_estimadas' => 40],
            ['titulo' => 'Desenvolver backend', 'stack' => 'backend', 'prioridade' => 'alta', 'horas_estimadas' => 40],
            ['titulo' => 'Configurar banco de dados', 'stack' => 'database', 'prioridade' => 'media', 'horas_estimadas' => 8],
            ['titulo' => 'Testes unitários', 'stack' => 'qa', 'prioridade' => 'media', 'horas_estimadas' => 16],
            ['titulo' => 'Deploy produção', 'stack' => 'cloud', 'prioridade' => 'alta', 'horas_estimadas' => 4]
        ]],
        ['id' => 'tpl_mobile', 'nome' => 'App Mobile', 'descricao' => 'Template para aplicativos mobile', 'categoria' => 'desenvolvimento', 'atividades' => [
            ['titulo' => 'Pesquisa de mercado', 'stack' => 'gestao', 'prioridade' => 'alta', 'horas_estimadas' => 16],
            ['titulo' => 'UI/UX Design', 'stack' => 'design', 'prioridade' => 'alta', 'horas_estimadas' => 40],
            ['titulo' => 'Implementar UI', 'stack' => 'frontend', 'prioridade' => 'alta', 'horas_estimadas' => 60],
            ['titulo' => 'Integrar API', 'stack' => 'backend', 'prioridade' => 'alta', 'horas_estimadas' => 24],
            ['titulo' => 'Publicar App Store', 'stack' => 'cloud', 'prioridade' => 'alta', 'horas_estimadas' => 8]
        ]],
        ['id' => 'tpl_mvp', 'nome' => 'MVP', 'descricao' => 'Template para MVP', 'categoria' => 'produto', 'atividades' => [
            ['titulo' => 'Descobrir problema e solução', 'stack' => 'gestao', 'prioridade' => 'alta', 'horas_estimadas' => 8],
            ['titulo' => 'Criar protótipo', 'stack' => 'design', 'prioridade' => 'alta', 'horas_estimadas' => 16],
            ['titulo' => 'Desenvolver versão inicial', 'stack' => 'frontend', 'prioridade' => 'alta', 'horas_estimadas' => 60],
            ['titulo' => 'Lançar versão 1.0', 'stack' => 'cloud', 'prioridade' => 'alta', 'horas_estimadas' => 8]
        ]]
    ];
    
    foreach ($templates as $t) {
        $stmt = $db->prepare("INSERT INTO templates (id, nome, descricao, categoria, atividades, created_at) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$t['id'], $t['nome'], $t['descricao'], $t['categoria'], json_encode($t['atividades']), date('c')]);
    }
    
    return $templates;
}