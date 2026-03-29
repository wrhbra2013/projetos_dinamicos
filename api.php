<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

define('DATA_DIR', __DIR__ . '/data');
define('PROJETOS_FILE', DATA_DIR . '/projetos.json');
define('ATIVIDADES_FILE', DATA_DIR . '/atividades.json');
define('LIÇÕES_FILE', DATA_DIR . '/licoes_aprendidas.json');
define('TEMPLATES_FILE', DATA_DIR . '/templates.json');
define('HISTORICO_FILE', DATA_DIR . '/historico.json');

if (!file_exists(DATA_DIR)) {
    mkdir(DATA_DIR, 0755, true);
}

function readJson($file, $default = []) {
    if (!file_exists($file)) {
        return $default;
    }
    $content = file_get_contents($file);
    return $content ? json_decode($content, true) : $default;
}

function writeJson($file, $data) {
    return file_put_contents($file, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

function generateId($prefix = 'id_') {
    return $prefix . time() . '_' . bin2hex(random_bytes(4));
}

function getJsonInput() {
    $input = file_get_contents('php://input');
    return $input ? json_decode($input, true) : [];
}

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

$response = ['success' => false, 'data' => null, 'error' => null];

switch ($action) {
    case 'health':
        $response['success'] = true;
        $response['data'] = ['status' => 'ok', 'timestamp' => date('c')];
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

    default:
        $response['error'] = 'Ação não encontrada';
}

echo json_encode($response, JSON_UNESCAPED_UNICODE);

function handleProjetos($method, $input) {
    $response = ['success' => false, 'data' => null, 'error' => null];
    
    switch ($method) {
        case 'GET':
            $projetos = readJson(PROJETOS_FILE, []);
            $response['success'] = true;
            $response['data'] = $projetos;
            break;

        case 'POST':
            $projetos = readJson(PROJETOS_FILE, []);
            $projeto = [
                'id' => generateId('proj_'),
                'nome' => $input['nome'] ?? 'Novo Projeto',
                'descricao' => $input['descricao'] ?? '',
                'status' => $input['status'] ?? 'planejamento',
                'template' => $input['template'] ?? null,
                'stakeholders' => $input['stakeholders'] ?? [],
                'objetivos' => $input['objetivos'] ?? [],
                'escopo' => $input['escopo'] ?? ['inclui' => [], 'nao_inclui' => []],
                'data_inicio' => $input['data_inicio'] ?? date('Y-m-d'),
                'data_fim' => $input['data_fim'] ?? null,
                'orcamento' => $input['orcamento'] ?? 0,
                'equipe' => $input['equipe'] ?? [],
                'created_at' => date('c'),
                'updated_at' => date('c')
            ];
            $projetos[] = $projeto;
            writeJson(PROJETOS_FILE, $projetos);
            $response['success'] = true;
            $response['data'] = $projeto;
            break;

        case 'PUT':
            $projetos = readJson(PROJETOS_FILE, []);
            $index = array_search($input['id'], array_column($projetos, 'id'));
            if ($index !== false) {
                $projetos[$index] = array_merge($projetos[$index], $input, ['updated_at' => date('c')]);
                writeJson(PROJETOS_FILE, $projetos);
                $response['success'] = true;
                $response['data'] = $projetos[$index];
            } else {
                $response['error'] = 'Projeto não encontrado';
            }
            break;

        case 'DELETE':
            $projetos = readJson(PROJETOS_FILE, []);
            $projetos = array_filter($projetos, fn($p) => $p['id'] !== ($input['id'] ?? ''));
            writeJson(PROJETOS_FILE, array_values($projetos));
            
            $atividades = readJson(ATIVIDADES_FILE, []);
            $atividades = array_filter($atividades, fn($a) => $a['projeto_id'] !== ($input['id'] ?? ''));
            writeJson(ATIVIDADES_FILE, array_values($atividades));
            
            $response['success'] = true;
            break;
    }
    
    return $response;
}

function handleAtividades($method, $input) {
    $response = ['success' => false, 'data' => null, 'error' => null];
    
    switch ($method) {
        case 'GET':
            $atividades = readJson(ATIVIDADES_FILE, []);
            $projeto_id = $_GET['projeto_id'] ?? null;
            if ($projeto_id) {
                $atividades = array_filter($atividades, fn($a) => $a['projeto_id'] === $projeto_id);
            }
            $response['success'] = true;
            $response['data'] = array_values($atividades);
            break;

        case 'POST':
            $atividades = readJson(ATIVIDADES_FILE, []);
            $atividade = [
                'id' => generateId('atk_'),
                'projeto_id' => $input['projeto_id'] ?? '',
                'titulo' => $input['titulo'] ?? 'Nova Atividade',
                'descricao' => $input['descricao'] ?? '',
                'status' => $input['status'] ?? 'pendente',
                'stack' => $input['stack'] ?? 'outro',
                'prioridade' => $input['prioridade'] ?? 'media',
                'dependencia' => $input['dependencia'] ?? '',
                'equipe' => $input['equipe'] ?? '',
                'responsavel' => $input['responsavel'] ?? '',
                'data_inicio' => $input['data_inicio'] ?? date('Y-m-d'),
                'data_fim' => $input['data_fim'] ?? null,
                'horas_estimadas' => $input['horas_estimadas'] ?? 0,
                'horas_realizadas' => $input['horas_realizadas'] ?? 0,
                'tags' => $input['tags'] ?? [],
                'created_at' => date('c'),
                'updated_at' => date('c')
            ];
            $atividades[] = $atividade;
            writeJson(ATIVIDADES_FILE, $atividades);
            $response['success'] = true;
            $response['data'] = $atividade;
            break;

        case 'PUT':
            $atividades = readJson(ATIVIDADES_FILE, []);
            $index = array_search($input['id'], array_column($atividades, 'id'));
            if ($index !== false) {
                $atividades[$index] = array_merge($atividades[$index], $input, ['updated_at' => date('c')]);
                writeJson(ATIVIDADES_FILE, $atividades);
                $response['success'] = true;
                $response['data'] = $atividades[$index];
            } else {
                $response['error'] = 'Atividade não encontrada';
            }
            break;

        case 'DELETE':
            $atividades = readJson(ATIVIDADES_FILE, []);
            $atividades = array_filter($atividades, fn($a) => $a['id'] !== ($input['id'] ?? ''));
            writeJson(ATIVIDADES_FILE, array_values($atividades));
            $response['success'] = true;
            break;
    }
    
    return $response;
}

function handleLicoes($method, $input) {
    $response = ['success' => false, 'data' => null, 'error' => null];
    
    switch ($method) {
        case 'GET':
            $licoes = readJson(LIÇÕES_FILE, []);
            $projeto_id = $_GET['projeto_id'] ?? null;
            if ($projeto_id) {
                $licoes = array_filter($licoes, fn($l) => $l['projeto_id'] === $projeto_id);
            }
            $response['success'] = true;
            $response['data'] = array_values($licoes);
            break;

        case 'POST':
            $licoes = readJson(LIÇÕES_FILE, []);
            $licao = [
                'id' => generateId('lic_'),
                'projeto_id' => $input['projeto_id'] ?? '',
                'tipo' => $input['tipo'] ?? 'positiva',
                'categoria' => $input['categoria'] ?? 'processo',
                'descricao' => $input['descricao'] ?? '',
                'acao' => $input['acao'] ?? '',
                'impacto' => $input['impacto'] ?? 'medio',
                'autor' => $input['autor'] ?? '',
                'created_at' => date('c')
            ];
            $licoes[] = $licao;
            writeJson(LIÇÕES_FILE, $licoes);
            $response['success'] = true;
            $response['data'] = $licao;
            break;

        case 'DELETE':
            $licoes = readJson(LIÇÕES_FILE, []);
            $licoes = array_filter($licoes, fn($l) => $l['id'] !== ($input['id'] ?? ''));
            writeJson(LIÇÕES_FILE, array_values($licoes));
            $response['success'] = true;
            break;
    }
    
    return $response;
}

function handleTemplates($method, $input) {
    $response = ['success' => false, 'data' => null, 'error' => null];
    
    switch ($method) {
        case 'GET':
            $templates = readJson(TEMPLATES_FILE, []);
            if (empty($templates)) {
                $templates = getDefaultTemplates();
                writeJson(TEMPLATES_FILE, $templates);
            }
            $response['success'] = true;
            $response['data'] = $templates;
            break;

        case 'POST':
            $templates = readJson(TEMPLATES_FILE, []);
            $template = [
                'id' => generateId('tpl_'),
                'nome' => $input['nome'] ?? 'Novo Template',
                'descricao' => $input['descricao'] ?? '',
                'categoria' => $input['categoria'] ?? 'personalizado',
                'atividades' => $input['atividades'] ?? [],
                'created_at' => date('c')
            ];
            $templates[] = $template;
            writeJson(TEMPLATES_FILE, $templates);
            $response['success'] = true;
            $response['data'] = $template;
            break;
    }
    
    return $response;
}

function getDefaultTemplates() {
    return [
        [
            'id' => 'tpl_web',
            'nome' => 'Projeto Web',
            'descricao' => 'Template para projetos web padrão',
            'categoria' => 'desenvolvimento',
            'atividades' => [
                ['titulo' => 'Definir requisitos', 'stack' => 'gestao', 'prioridade' => 'alta', 'horas_estimadas' => 8],
                ['titulo' => 'Criar wireframes', 'stack' => 'design', 'prioridade' => 'alta', 'horas_estimadas' => 16],
                ['titulo' => 'Setup ambiente', 'stack' => 'backend', 'prioridade' => 'media', 'horas_estimadas' => 4],
                ['titulo' => 'Desenvolver frontend', 'stack' => 'frontend', 'prioridade' => 'alta', 'horas_estimadas' => 40],
                ['titulo' => 'Desenvolver backend', 'stack' => 'backend', 'prioridade' => 'alta', 'horas_estimadas' => 40],
                ['titulo' => 'Configurar banco de dados', 'stack' => 'database', 'prioridade' => 'media', 'horas_estimadas' => 8],
                ['titulo' => 'Testes unitários', 'stack' => 'qa', 'prioridade' => 'media', 'horas_estimadas' => 16],
                ['titulo' => 'Testes de integração', 'stack' => 'qa', 'prioridade' => 'media', 'horas_estimadas' => 16],
                ['titulo' => 'Deploy staging', 'stack' => 'cloud', 'prioridade' => 'media', 'horas_estimadas' => 4],
                ['titulo' => 'Deploy produção', 'stack' => 'cloud', 'prioridade' => 'alta', 'horas_estimadas' => 4]
            ]
        ],
        [
            'id' => 'tpl_mobile',
            'nome' => 'App Mobile',
            'descricao' => 'Template para aplicativos mobile',
            'categoria' => 'desenvolvimento',
            'atividades' => [
                ['titulo' => 'Pesquisa de mercado', 'stack' => 'gestao', 'prioridade' => 'alta', 'horas_estimadas' => 16],
                ['titulo' => 'Definir funcionalidades', 'stack' => 'gestao', 'prioridade' => 'alta', 'horas_estimadas' => 16],
                ['titulo' => 'UI/UX Design', 'stack' => 'design', 'prioridade' => 'alta', 'horas_estimadas' => 40],
                ['titulo' => 'Setup projeto mobile', 'stack' => 'frontend', 'prioridade' => 'media', 'horas_estimadas' => 8],
                ['titulo' => 'Implementar UI', 'stack' => 'frontend', 'prioridade' => 'alta', 'horas_estimadas' => 60],
                ['titulo' => 'Integrar API', 'stack' => 'backend', 'prioridade' => 'alta', 'horas_estimadas' => 24],
                ['titulo' => 'Testes iOS', 'stack' => 'qa', 'prioridade' => 'media', 'horas_estimadas' => 20],
                ['titulo' => 'Testes Android', 'stack' => 'qa', 'prioridade' => 'media', 'horas_estimadas' => 20],
                ['titulo' => 'Publicar App Store', 'stack' => 'cloud', 'prioridade' => 'alta', 'horas_estimadas' => 8],
                ['titulo' => 'Publicar Play Store', 'stack' => 'cloud', 'prioridade' => 'alta', 'horas_estimadas' => 8]
            ]
        ],
        [
            'id' => 'tpl_api',
            'nome' => 'API REST',
            'descricao' => 'Template para desenvolvimento de APIs',
            'categoria' => 'desenvolvimento',
            'atividades' => [
                ['titulo' => 'Definir spec da API', 'stack' => 'backend', 'prioridade' => 'alta', 'horas_estimadas' => 16],
                ['titulo' => 'Modelar banco de dados', 'stack' => 'database', 'prioridade' => 'alta', 'horas_estimadas' => 16],
                ['titulo' => 'Criar estrutura do projeto', 'stack' => 'backend', 'prioridade' => 'media', 'horas_estimadas' => 8],
                ['titulo' => 'Implementar autenticação', 'stack' => 'backend', 'prioridade' => 'alta', 'horas_estimadas' => 16],
                ['titulo' => 'Implementar endpoints', 'stack' => 'backend', 'prioridade' => 'alta', 'horas_estimadas' => 40],
                ['titulo' => 'Documentação Swagger', 'stack' => 'backend', 'prioridade' => 'media', 'horas_estimadas' => 8],
                ['titulo' => 'Testes unitários', 'stack' => 'qa', 'prioridade' => 'media', 'horas_estimadas' => 20],
                ['titulo' => 'Testes de carga', 'stack' => 'qa', 'prioridade' => 'media', 'horas_estimadas' => 16],
                ['titulo' => 'Deploy', 'stack' => 'cloud', 'prioridade' => 'alta', 'horas_estimadas' => 8]
            ]
        ],
        [
            'id' => 'tpl_mvp',
            'nome' => 'MVP',
            'descricao' => 'Template para MVP (Minimum Viable Product)',
            'categoria' => 'produto',
            'atividades' => [
                ['titulo' => 'Descobrir problema e solução', 'stack' => 'gestao', 'prioridade' => 'alta', 'horas_estimadas' => 8],
                ['titulo' => 'Validar com usuários', 'stack' => 'gestao', 'prioridade' => 'alta', 'horas_estimadas' => 16],
                ['titulo' => 'Criar protótipo', 'stack' => 'design', 'prioridade' => 'alta', 'horas_estimadas' => 16],
                ['titulo' => 'Desenvolver versão inicial', 'stack' => 'frontend', 'prioridade' => 'alta', 'horas_estimadas' => 60],
                ['titulo' => 'Backend básico', 'stack' => 'backend', 'prioridade' => 'alta', 'horas_estimadas' => 40],
                ['titulo' => 'Testes com usuários', 'stack' => 'qa', 'prioridade' => 'media', 'horas_estimadas' => 16],
                ['titulo' => 'Iterar baseado em feedback', 'stack' => 'design', 'prioridade' => 'alta', 'horas_estimadas' => 24],
                ['titulo' => 'Lançar versão 1.0', 'stack' => 'cloud', 'prioridade' => 'alta', 'horas_estimadas' => 8]
            ]
        ],
        [
            'id' => 'tpl_infra',
            'nome' => 'Infraestrutura',
            'descricao' => 'Template para projetos de infraestrutura',
            'categoria' => 'infra',
            'atividades' => [
                ['titulo' => 'Avaliação atual', 'stack' => 'cloud', 'prioridade' => 'alta', 'horas_estimadas' => 16],
                ['titulo' => 'Planejamento de arquitetura', 'stack' => 'cloud', 'prioridade' => 'alta', 'horas_estimadas' => 24],
                ['titulo' => 'Provisionar recursos', 'stack' => 'cloud', 'prioridade' => 'alta', 'horas_estimadas' => 16],
                ['titulo' => 'Configurar networking', 'stack' => 'cloud', 'prioridade' => 'alta', 'horas_estimadas' => 16],
                ['titulo' => 'Implementar segurança', 'stack' => 'cloud', 'prioridade' => 'alta', 'horas_estimadas' => 24],
                ['titulo' => 'Automação (IaC)', 'stack' => 'cloud', 'prioridade' => 'media', 'horas_estimadas' => 32],
                ['titulo' => 'Monitoramento', 'stack' => 'cloud', 'prioridade' => 'media', 'horas_estimadas' => 16],
                ['titulo' => 'Documentação', 'stack' => 'gestao', 'prioridade' => 'media', 'horas_estimadas' => 8]
            ]
        ]
    ];
}
