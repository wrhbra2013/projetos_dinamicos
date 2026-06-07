#!/bin/sh
set -eu

# ==============================================================
# Script de instalação — API Amor Animal
# Uso: sudo bash install.sh          (instalar)
#       sudo bash install.sh uninstall (desinstalar)
#
# API REST genérica com PostgreSQL.
# ==============================================================

INSTALL_DIR="/var/www/amoranimal"
SRC_DIR="$INSTALL_DIR/src"
NGINX_AVAILABLE="/etc/nginx/sites-available"
NGINX_CONF="$NGINX_AVAILABLE/default"
RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; NC='\033[0m'
info()  { printf "${GREEN}[INFO]${NC} %s\n" "$1"; }
warn()  { printf "${YELLOW}[WARN]${NC} %s\n" "$1" >&2; }
error() { printf "${RED}[ERRO]${NC} %s\n" "$1" >&2; exit 1; }

[ "$(id -u)" -eq 0 ] || error "Execute como root: sudo bash install.sh"

if [ -n "${SUDO_USER:-}" ]; then
  PM2_USER="$SUDO_USER"
else
  PM2_USER="root"
fi
PM2_AS_USER=""
[ "$PM2_USER" != "root" ] && PM2_AS_USER="sudo -u $PM2_USER"



# ==============================================================
# Uninstall
# ==============================================================
uninstall() {
  echo ""
  info "===== Iniciando desinstalação da API Amor Animal ====="
  echo ""

  [ -f "$INSTALL_DIR/.env" ] && . "$INSTALL_DIR/.env" || true

  upm2="${PM2_APP_NAME:-amoranimal}"
  db_name="${DB_NAME:-amoranimal_db}"
  db_user="${DB_USER:-postgres}"
  db_pass="${DB_PASS:-wander}"
  db_host="${DB_HOST:-localhost}"
  db_port="${DB_PORT:-5432}"

  echo ""
  info "[1/5] Parando e removendo app do PM2 ($upm2)..."
  if $PM2_AS_USER pm2 delete "$upm2" 2>/dev/null; then
    info "PM2: app $upm2 removido"
  else
    warn "PM2: app $upm2 não encontrado ou já removido"
  fi
  $PM2_AS_USER pm2 save --force 2>/dev/null || true

  echo ""
  info "[2/5] Removendo location /$upm2/ do nginx..."
  LOC_MARKER_BEGIN="# LOCATION_BEGIN $upm2"
  LOC_MARKER_END="# LOCATION_END $upm2"
  if grep -q "^$LOC_MARKER_BEGIN\$" "$NGINX_CONF"; then
    sed -i "/^$LOC_MARKER_BEGIN\$/,/^$LOC_MARKER_END\$/d" "$NGINX_CONF" && info "Location /$upm2/ removido do nginx" || warn "Falha ao remover location /$upm2/ do nginx"
  else
    warn "Marcador $LOC_MARKER_BEGIN não encontrado — pulando"
  fi
  # Remove old-style server block se presente (instalações antigas)
  if grep -q "^# BEGIN $upm2\$" "$NGINX_CONF"; then
    sed -i "/^# BEGIN $upm2\$/,/^# END $upm2\$/d" "$NGINX_CONF" && info "Server block antigo (# BEGIN $upm2) removido" || warn "Falha ao remover server block antigo"
  fi
  if nginx -t 2>/dev/null; then
    systemctl reload nginx.service 2>/dev/null && info "Nginx recarregado" || warn "Falha ao recarregar nginx"
  else
    warn "Configuração do nginx inválida — verifique manualmente"
  fi

  echo ""
  info "[3/5] Removendo banco de dados ($db_name)..."
  info "Limpando tabelas existentes..."
  export PGPASSWORD="$db_pass"
  psql -h "$db_host" -p "$db_port" -U "$db_user" -d "$db_name" \
    -t -c "SELECT tablename FROM pg_tables WHERE schemaname='public';" 2>/dev/null | while read -r tbl; do
    [ -n "$tbl" ] && psql -h "$db_host" -p "$db_port" -U "$db_user" -d "$db_name" \
      -c "DROP TABLE IF EXISTS \"$tbl\" CASCADE;" 2>/dev/null || true
  done
  info "Tabelas removidas"
  unset PGPASSWORD
  if sudo -u postgres psql -c "DROP DATABASE IF EXISTS \"$db_name\";" 2>/dev/null; then
    info "Banco $db_name removido (usuário mantido)"
  else
    warn "Banco $db_name não encontrado ou já removido"
  fi

  echo ""
  info "[4/5] Removendo diretório $INSTALL_DIR..."
  rm -rf "$INSTALL_DIR" && info "Diretório $INSTALL_DIR removido com sucesso" || warn "Falha ao remover diretório $INSTALL_DIR"

  echo ""
  info "[5/5] Desinstalação concluída com sucesso!"
}

case "${1:-}" in
  uninstall) uninstall; exit 0 ;;
esac

cleanup_on_error() {
  [ $? -eq 0 ] && return 0
  warn "ERRO: Instalação falhou — revertendo..."
  rm -rf "$INSTALL_DIR" 2>/dev/null && warn "Diretório $INSTALL_DIR removido durante rollback" || true
  exit 1
}
trap cleanup_on_error EXIT
trap 'error "Instalação interrompida pelo usuário"' INT TERM

command -v node >/dev/null 2>&1 || error "Node.js não encontrado"
command -v npm  >/dev/null 2>&1 || error "npm não encontrado"
command -v psql >/dev/null 2>&1 || warn "psql não encontrado"
command -v pm2  >/dev/null 2>&1 || warn "pm2 não encontrado — será instalado via npm"

echo ""
info "===== Iniciando instalação da API Amor Animal ====="
echo ""
echo "============ Configuração da instalação ============"
_check_port() {
  local p=$1
  if command -v ss >/dev/null 2>&1; then
    ss -tlnp "sport = :$p" 2>/dev/null | grep -qv 'State.*Recv-Q' && return 0
  elif command -v lsof >/dev/null 2>&1; then
    lsof -i:"$p" 2>/dev/null | grep -q LISTEN && return 0
  fi
  return 1
}

while :; do
  printf "Porta do app [3002]: "; read -r APP_PORT
  APP_PORT=${APP_PORT:-3002}
  if _check_port "$APP_PORT"; then
    warn "Porta $APP_PORT já está em uso!"
    printf "  (M)atar processo, (T)rocar porta, (C)ancelar [M/t/c]: "; read -r PORT_ACT
    case "$PORT_ACT" in
      [Tt])
        continue
        ;;
      [Cc])
        error "Instalação cancelada pelo usuário"
        ;;
      *)
        fuser -k "$APP_PORT/tcp" 2>/dev/null && info "Processo na porta $APP_PORT encerrado" || warn "Não foi possível encerrar — tente trocar a porta"
        sleep 1
        ;;
    esac
  fi
  break
done
info "Porta definida: $APP_PORT"
printf "Nome do banco de dados PostgreSQL [amoranimal_db]: "; read -r DB_NAME
DB_NAME=${DB_NAME:-amoranimal_db}; info "DB_NAME: $DB_NAME"
printf "Nome do app no PM2 [amoranimal]: "; read -r PM2_APP_NAME
PM2_APP_NAME=${PM2_APP_NAME:-amoranimal}; info "PM2_APP_NAME: $PM2_APP_NAME"
printf "Email do administrador [amoranimalmariliadev@gmail.com]: "; read -r ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-amoranimalmariliadev@gmail.com}; info "ADMIN_EMAIL: $ADMIN_EMAIL"
printf "Nome do administrador [$ADMIN_EMAIL]: "; read -r ADMIN_NOME
ADMIN_NOME=${ADMIN_NOME:-$ADMIN_EMAIL}; info "ADMIN_NOME: $ADMIN_NOME"
printf "Senha do administrador [@admin]: "; stty -echo; read -r ADMIN_PASS; stty echo; echo ""
ADMIN_PASS=${ADMIN_PASS:-@admin}
DB_USER=postgres
DB_PASS=wander
DB_HOST=localhost
DB_PORT=5432
APP_DOMAIN=api.projetosdinamicos.com.br
APP_LOCATION=/$PM2_APP_NAME/

info "Criando diretórios..."
mkdir -p "$SRC_DIR" "$INSTALL_DIR/uploads/transparencia" "$INSTALL_DIR/backups" && info "Diretórios criados: $SRC_DIR" || warn "Erro ao criar diretórios"

# --------------------------------------------------------------
# .env
# --------------------------------------------------------------
info "Criando .env (PORT=$APP_PORT)"
cat > "$INSTALL_DIR/.env" <<ENVEOF
PORT=$APP_PORT
DB_HOST=$DB_HOST
DB_PORT=$DB_PORT
DB_NAME=$DB_NAME
DB_USER=$DB_USER
DB_PASS=$DB_PASS
PM2_APP_NAME=$PM2_APP_NAME
APP_DOMAIN=$APP_DOMAIN
APP_LOCATION=$APP_LOCATION
NGINX_BKP=
PASSWORD=$DB_PASS
ADMIN_EMAIL=$ADMIN_EMAIL
ADMIN_NOME=$ADMIN_NOME
ADMIN_PASS=$ADMIN_PASS
ENVEOF
chmod 600 "$INSTALL_DIR/.env" && info "Permissões do .env ajustadas (600)" || warn "Falha ao ajustar permissões do .env"
chown "$PM2_USER" "$INSTALL_DIR/.env" && info "Proprietário do .env definido: $PM2_USER" || warn "Falha ao definir proprietário do .env"
info ".env criado com PORT=$APP_PORT"

# --------------------------------------------------------------
# package.json
# --------------------------------------------------------------
info "Criando package.json"
cat > "$INSTALL_DIR/package.json" <<'JSONEOF'
{
  "name": "amoranimal-api",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "start": "node src/server.js",
    "dev": "node --watch src/server.js"
  },
  "dependencies": {
    "dotenv": "^16.4.5",
    "express": "^4.21.0",
    "pg": "^8.12.0"
  }
}
JSONEOF

# --------------------------------------------------------------
# src/server.js
# --------------------------------------------------------------
info "Criando src/server.js"
cat > "$SRC_DIR/server.js" <<'SVREOF'
const { Pool } = require('pg');
const express = require('express');

const path = require('path');
const crypto = require('crypto');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.PASSWORD
});

pool.on('error', (err) => console.error('DB Error:', err));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS — permite requisições do frontend hospedado em outro domínio
// O nginx TEM add_header correspondente (em install.sh) como fallback
// Headers duplicados (nginx + Node) são aceitos pelo browser sem erro
app.use((req, res, next) => {
    const origin = req.headers.origin;
    const allowedOrigins = [
        'https://www.projetosdinamicos.com.br',
        'https://api.projetosdinamicos.com.br'
    ];
    if (origin) {
        const match = allowedOrigins.find(o => origin === o || origin.endsWith('://' + o.split('://')[1]));
        if (match) {
            res.header('Access-Control-Allow-Origin', match);
            res.header('Vary', 'Origin');
        }
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') return res.sendStatus(200);
    next();
});

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// Gera ticket único
function gerarTicket(tipo, seq) {
    const prefixo = tipo === 'mutirao' ? 'M' : tipo === 'pets_rua' ? 'R' : 'B';
    return prefixo + String(seq).padStart(3, '0');
}

// ===================== STATUS / HEALTH =====================

app.get('/', (req, res) => {
    res.json({
        message: 'API Running',
        status: 'OK',
        project: 'Amor Animal API',
        timestamp: new Date().toISOString()
    });
});

app.get('/health', async (req, res) => {
    try {
        await pool.query('SELECT 1');
        res.json({ status: 'healthy', database: 'connected', timestamp: new Date().toISOString() });
    } catch (err) {
        res.json({ status: 'unhealthy', database: 'disconnected', error: err.message });
    }
});

// ===================== AUTH =====================

app.post('/auth/login', async (req, res) => {
    const { nome, email, senha } = req.body;
    const login = nome || email;
    if (!login || !senha) {
        return res.status(400).json({ error: 'Nome/email e senha são obrigatórios' });
    }
    try {
        const result = await pool.query(
            'SELECT id, nome, email, tipo FROM usuarios WHERE (nome = $1 OR email = $1) AND senha = $2',
            [login, senha]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }
        const usuario = result.rows[0];
        const token = crypto.createHash('sha256')
            .update(usuario.email + Date.now() + 'amoranimal_secret')
            .digest('hex');
        res.json({ success: true, token, usuario });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===================== SETTINGS =====================

app.get('/settings', async (req, res) => {
    try {
        const result = await pool.query('SELECT chave, valor FROM settings');
        const settings = {};
        result.rows.forEach(r => { settings[r.chave] = r.valor; });
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/settings', async (req, res) => {
    const pairs = req.body;
    try {
        for (const chave of Object.keys(pairs)) {
            await pool.query(
                'INSERT INTO settings (chave, valor) VALUES ($1, $2) ON CONFLICT (chave) DO UPDATE SET valor = $2',
                [chave, pairs[chave]]
            );
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===================== TABELAS DINÂMICAS (CRUD genérico) =====================
// Mapeia nomes de tabela que o frontend acessa diretamente
const TABELAS_PERMITIDAS = [
    'animais', 'adocoes', 'castracoes', 'doacoes',
    'eventos', 'parcerias', 'procura_se', 'usuarios',
    'voluntarios', 'coleta'
];

// GET /:tabela — listar registros
app.get('/:tabela', async (req, res) => {
    const { tabela } = req.params;
    if (!TABELAS_PERMITIDAS.includes(tabela)) {
        return res.status(404).json({ error: 'Tabela não encontrada' });
    }
    try {
        const result = await pool.query(`SELECT * FROM "${tabela}" ORDER BY id DESC LIMIT 500`);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// POST /:tabela — inserir registro
app.post('/:tabela', async (req, res) => {
    const { tabela } = req.params;
    if (!TABELAS_PERMITIDAS.includes(tabela)) {
        return res.status(404).json({ error: 'Tabela não encontrada' });
    }
    const data = req.body;
    try {
        // Gerar ticket automático para castracoes
        if (tabela === 'castracoes' && !data.ticket) {
            const seqResult = await pool.query("SELECT nextval('castracoes_id_seq')");
            const seq = seqResult.rows[0].nextval;
            data.ticket = gerarTicket(data.tipo || 'baixo_custo', seq);
        }

        const keys = Object.keys(data).map(k => `"${k}"`).join(', ');
        const values = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ');
        const result = await pool.query(
            `INSERT INTO "${tabela}" (${keys}) VALUES (${values}) RETURNING *;`,
            Object.values(data)
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// PUT /:tabela/:id — atualizar registro
app.put('/:tabela/:id', async (req, res) => {
    const { tabela, id } = req.params;
    if (!TABELAS_PERMITIDAS.includes(tabela)) {
        return res.status(404).json({ error: 'Tabela não encontrada' });
    }
    const data = req.body;
    try {
        const keys = Object.keys(data).map((k, i) => `"${k}" = $${i + 1}`).join(', ');
        const result = await pool.query(
            `UPDATE "${tabela}" SET ${keys} WHERE id = $${Object.keys(data).length + 1} RETURNING *;`,
            [...Object.values(data), id]
        );
        res.json(result.rows[0] || { error: 'Registro não encontrado' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// DELETE /:tabela/:id — excluir registro
app.delete('/:tabela/:id', async (req, res) => {
    const { tabela, id } = req.params;
    if (!TABELAS_PERMITIDAS.includes(tabela)) {
        return res.status(404).json({ error: 'Tabela não encontrada' });
    }
    try {
        await pool.query(`DELETE FROM "${tabela}" WHERE id = $1`, [id]);
        res.json({ success: true, message: 'Registro excluído' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===================== TRANSPARÊNCIA =====================

app.get('/transparencia', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM transparencia ORDER BY ano DESC, created_at DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/transparencia', async (req, res) => {
    const { titulo, tipo, ano, descricao, arquivo } = req.body;
    if (!titulo || !tipo || !ano) {
        return res.status(400).json({ error: 'titulo, tipo e ano são obrigatórios' });
    }
    try {
        const result = await pool.query(
            `INSERT INTO transparencia (titulo, tipo, ano, descricao, arquivo)
             VALUES ($1, $2, $3, $4, $5) RETURNING *`,
            [titulo, tipo, ano, descricao || null, arquivo || null]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/transparencia/:id/:arquivo', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM transparencia WHERE id = $1', [id]);
        res.json({ success: true, message: 'Documento excluído' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===================== RELATÓRIO / BACKUP =====================

app.get('/relatorio/tabelas', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name
        `);
        res.json({ tables: result.rows.map(r => r.table_name) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/relatorio/backup', async (req, res) => {
    const { action } = req.query;
    try {
        const fs = require('fs');
        const backupDir = path.join(__dirname, '..', 'backups');
        if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
        const filename = `backup_${new Date().toISOString().slice(0, 10)}_${Date.now()}.sql`;
        const filepath = path.join(backupDir, filename);

        const result = await pool.query(`
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
        `);
        let sql = '-- Backup Amor Animal - ' + new Date().toISOString() + '\n\n';
        for (const row of result.rows) {
            const tableName = row.table_name;
            const data = await pool.query(`SELECT * FROM "${tableName}"`);
            if (data.rows.length === 0) continue;
            const cols = Object.keys(data.rows[0]).map(c => `"${c}"`).join(', ');
            for (const r of data.rows) {
                const vals = Object.values(r).map(v => {
                    if (v === null || v === undefined) return 'NULL';
                    if (typeof v === 'number') return v;
                    return `'${String(v).replace(/'/g, "''")}'`;
                }).join(', ');
                sql += `INSERT INTO "${tableName}" (${cols}) VALUES (${vals});\n`;
            }
        }
        fs.writeFileSync(filepath, sql);
        res.json({ success: true, message: 'Backup criado', file: filename, log: `Backup salvo: ${filename}` });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message, log: 'Erro: ' + err.message });
    }
});

app.get('/relatorio/backups', async (req, res) => {
    try {
        const fs = require('fs');
        const backupDir = path.join(__dirname, '..', 'backups');
        if (!fs.existsSync(backupDir)) {
            return res.json({ success: true, files: [] });
        }
        const files = fs.readdirSync(backupDir)
            .filter(f => f.endsWith('.sql'))
            .sort()
            .reverse();
        res.json({ success: true, files });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post('/relatorio/restore', async (req, res) => {
    const { tabela, backupFile } = req.query;
    if (!tabela || !backupFile) {
        return res.status(400).json({ success: false, error: 'tabela e backupFile são obrigatórios', log: 'Parâmetros faltando' });
    }
    try {
        const fs = require('fs');
        const filepath = path.join(__dirname, '..', 'backups', backupFile);
        if (!fs.existsSync(filepath)) {
            return res.status(404).json({ success: false, error: 'Backup não encontrado', log: 'Arquivo não encontrado' });
        }

        await pool.query(`DELETE FROM "${tabela}"`);
        const content = fs.readFileSync(filepath, 'utf8');
        const lines = content.split('\n').filter(l => l.startsWith('INSERT') && l.includes(`"${tabela}"`));
        for (const line of lines) {
            await pool.query(line);
        }
        res.json({ success: true, message: `Tabela "${tabela}" restaurada`, log: `Restaurado de: ${backupFile}` });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message, log: 'Erro: ' + err.message });
    }
});

app.post('/relatorio/maintenance', async (req, res) => {
    const { option } = req.query;
    const { execSync } = require('child_process');
    const logs = [];
    try {
        switch (option) {
            case '1': // Fluxo completo
                logs.push('Executando git pull...');
                try { const o = execSync('git -C ' + path.join(__dirname, '..') + ' pull 2>&1', { timeout: 30000 }); logs.push(o.toString()); } catch (e) { logs.push('Git: ' + e.message); }
                logs.push('Instalando dependências...');
                execSync('npm install --prefix ' + path.join(__dirname, '..') + ' 2>&1', { timeout: 60000 });
                logs.push('npm install concluído');
                logs.push('Reiniciando app...');
                execSync('pm2 restart amoranimal 2>&1', { timeout: 10000 });
                logs.push('App reiniciado');
                break;
            case '3': // Atualizar código
                const o = execSync('git -C ' + path.join(__dirname, '..') + ' pull 2>&1', { timeout: 30000 });
                logs.push(o.toString());
                break;
            case '4': // Instalar dependências
                execSync('npm install --prefix ' + path.join(__dirname, '..') + ' 2>&1', { timeout: 60000 });
                logs.push('Dependências instaladas');
                break;
            case '5': // Reiniciar app
                execSync('pm2 restart amoranimal 2>&1', { timeout: 10000 });
                logs.push('App reiniciado via PM2');
                break;
            default:
                logs.push('Opção não implementada: ' + option);
        }
        res.json({ success: true, log: logs.join('\n') });
    } catch (err) {
        res.status(500).json({ success: false, log: logs.join('\n') + '\nErro: ' + err.message });
    }
});

// ===================== INICIALIZAÇÃO =====================

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
SVREOF
info "Ajustando porta padrão no server.js..."
sed -i "s/process\.env\.PORT || 3000/process.env.PORT || $APP_PORT/" "$SRC_DIR/server.js" && info "Porta ajustada para $APP_PORT" || warn "Falha ao ajustar porta no server.js"

# --------------------------------------------------------------
# Nginx — adiciona location no server block existente
# --------------------------------------------------------------
LOC_MARKER_BEGIN="# LOCATION_BEGIN $PM2_APP_NAME"
LOC_MARKER_END="# LOCATION_END $PM2_APP_NAME"

info "Configurando Nginx"

if [ ! -f "$NGINX_CONF" ]; then
  warn "$NGINX_CONF não encontrado — criando arquivo vazio"
  echo "# Nginx default — $PM2_APP_NAME API" > "$NGINX_CONF"
fi

# Backup antes de qualquer alteração (sempre)
info "Criando backup do nginx..."
sudo cp "$NGINX_CONF" "$NGINX_CONF.bkp" 2>/dev/null && info "Backup de nginx criado: $NGINX_CONF.bkp" || warn "Falha ao criar backup em $NGINX_CONF.bkp"

# Remove old-style server block se presente (instalações standalone antigas)
if grep -q "^# BEGIN $PM2_APP_NAME\$" "$NGINX_CONF"; then
  info "Removendo server block antigo (# BEGIN $PM2_APP_NAME)..."
  sed -i "/^# BEGIN $PM2_APP_NAME\$/,/^# END $PM2_APP_NAME\$/d" "$NGINX_CONF"
  info "Server block antigo removido"
fi

if grep -q "^$LOC_MARKER_BEGIN\$" "$NGINX_CONF"; then
  warn "Location /$PM2_APP_NAME/ já configurado em $NGINX_CONF — pulando"
else
  # Procura server block existente com server_name + listen 443 ssl
  SERVER_CLOSE=$(awk -v d="$APP_DOMAIN" '
    /^server \{/ { depth=1; match_block=0 }
    { if (depth>0 && !match_block && $0 ~ "server_name.*"d && $0 ~ /listen.*443/) match_block=1 }
    /\{/ { if (depth>0) depth++ }
    /\}/ { if (depth>0) { depth--; if (depth==0 && match_block) { print NR; exit } } }
  ' "$NGINX_CONF")

  if [ -z "$SERVER_CLOSE" ]; then
    # Nenhum server block existente — cria um novo (fallback standalone)
    warn "Server block para $APP_DOMAIN:443 não encontrado em $NGINX_CONF — criando novo"
    SSL_CERT=""; SSL_KEY=""
    for d in /etc/letsencrypt/live/*/; do
      [ -f "${d}fullchain.pem" ] || continue
      SSL_CERT="${d}fullchain.pem"
      SSL_KEY="${d}privkey.pem"
      echo "$d" | grep -qi "$(echo "$APP_DOMAIN" | sed 's/^www\.//')" && break
    done

    SERVER_BLOCK="
$LOC_MARKER_BEGIN
server {
    listen 80;
    listen [::]:80;
    server_name $APP_DOMAIN;

    location /.well-known/acme-challenge/ {
        root /var/www;
    }

    location $APP_LOCATION {
        return 301 https://\$host\$request_uri;
    }
}

server {
    listen 443 ssl;
    listen [::]:443 ssl;
    http2 on;
    server_name $APP_DOMAIN;
"
    if [ -n "$SSL_CERT" ]; then
      SERVER_BLOCK="$SERVER_BLOCK
    ssl_certificate $SSL_CERT;
    ssl_certificate_key $SSL_KEY;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;"
    else
      SERVER_BLOCK="$SERVER_BLOCK
    # SSL: certifique-se de gerar certificado para $APP_DOMAIN
    # ssl_certificate /etc/letsencrypt/live/$APP_DOMAIN/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/$APP_DOMAIN/privkey.pem;"
    fi

    SERVER_BLOCK="$SERVER_BLOCK

    location /.well-known/acme-challenge/ {
        root /var/www;
    }

    location $APP_LOCATION {
        add_header Access-Control-Allow-Origin \$http_origin always;
        add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header Access-Control-Allow-Headers 'Content-Type, Authorization' always;

        if (\$request_method = OPTIONS) {
            add_header Access-Control-Allow-Origin \$http_origin always;
            add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header Access-Control-Allow-Headers 'Content-Type, Authorization' always;
            return 204;
        }

        proxy_pass http://127.0.0.1:$APP_PORT/;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    client_max_body_size 15M;
}
$LOC_MARKER_END
"
    echo "$SERVER_BLOCK" >> "$NGINX_CONF"
    info "Server block criado em $NGINX_CONF"
  else
    # Insere location block dentro do server block existente
    sed -i "${SERVER_CLOSE}i\\
$LOC_MARKER_BEGIN\\
location /$PM2_APP_NAME/ {\\
    add_header Access-Control-Allow-Origin \$http_origin always;\\
    add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS' always;\\
    add_header Access-Control-Allow-Headers 'Content-Type, Authorization' always;\\
\\
    if (\$request_method = OPTIONS) {\\
        add_header Access-Control-Allow-Origin \$http_origin always;\\
        add_header Access-Control-Allow-Methods 'GET, POST, PUT, DELETE, OPTIONS' always;\\
        add_header Access-Control-Allow-Headers 'Content-Type, Authorization' always;\\
        return 204;\\
    }\\
\\
    proxy_pass http://127.0.0.1:$APP_PORT/;\\
    proxy_http_version 1.1;\\
    proxy_set_header Host \$host;\\
    proxy_set_header X-Real-IP \$remote_addr;\\
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;\\
    proxy_set_header X-Forwarded-Proto \$scheme;\\
}\\
$LOC_MARKER_END" "$NGINX_CONF"
    info "Location /$PM2_APP_NAME/ adicionado ao server block existente em $NGINX_CONF"
  fi
fi

# --------------------------------------------------------------
# PostgreSQL — criar usuário e banco
# --------------------------------------------------------------
info "Criando banco PostgreSQL ($DB_NAME)..."
if command -v sudo >/dev/null 2>&1 && sudo -u postgres psql -c "SELECT 1" >/dev/null 2>&1; then
  info "PostgreSQL acessível via sudo -u postgres"
  if sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>&1; then
    info "Banco $DB_NAME criado"
  else
    warn "Banco $DB_NAME já existe ou erro ao criar"
  fi
else
  warn "Não foi possível acessar o PostgreSQL como superusuário (postgres)"
  warn "Crie manualmente:"
  warn "  sudo -u postgres createdb $DB_NAME -O $DB_USER"
fi

# --------------------------------------------------------------
# Migration — criar todas as tabelas do projeto
# --------------------------------------------------------------
info "Executando migration — criando tabelas..."
MIGRATION_FILE="$INSTALL_DIR/migrations/001_create_tables.sql"
mkdir -p "$INSTALL_DIR/migrations" && info "Diretório de migrations criado" || warn "Erro ao criar diretório de migrations"

cat > "$MIGRATION_FILE" <<SQLEOF
-- ============================================================
-- Migration 001: Cria todas as tabelas do sistema Amor Animal
-- Execute com: psql -h HOST -p PORT -U USER -d DB -f migrations/001_create_tables.sql
-- ============================================================

-- settings: armazenamento chave-valor (config da clínica, etc.)
CREATE TABLE IF NOT EXISTS settings (
    chave VARCHAR(100) PRIMARY KEY,
    valor TEXT
);

-- animais: pets disponíveis para adoção
CREATE TABLE IF NOT EXISTS animais (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    especie VARCHAR(50),
    porte VARCHAR(50),
    idade VARCHAR(100),
    sexo VARCHAR(20),
    caracteristicas TEXT,
    foto_url TEXT,
    status VARCHAR(50) DEFAULT 'disponivel',
    created_at TIMESTAMP DEFAULT NOW()
);

-- adocoes: registros de adoção realizadas
CREATE TABLE IF NOT EXISTS adocoes (
    id SERIAL PRIMARY KEY,
    adotante_nome VARCHAR(255) NOT NULL,
    adotante_cpf VARCHAR(20),
    adotante_contato VARCHAR(100),
    adotante_endereco TEXT,
    adotante_numero VARCHAR(20),
    adotante_bairro VARCHAR(100),
    adotante_cidade VARCHAR(100),
    adotante_estado VARCHAR(10),
    adotante_cep VARCHAR(15),
    pet_nome VARCHAR(255) NOT NULL,
    pet_especie VARCHAR(50),
    pet_sexo VARCHAR(20),
    pet_idade VARCHAR(100),
    pet_porte VARCHAR(50),
    pet_castrado VARCHAR(20),
    pet_vermifugado VARCHAR(20),
    pet_vacinado VARCHAR(20),
    pet_endereco VARCHAR(50),
    protocolo VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- castracoes: agendamentos de castração (baixo custo, mutirão, pets de rua)
CREATE TABLE IF NOT EXISTS castracoes (
    id SERIAL PRIMARY KEY,
    tipo VARCHAR(50) NOT NULL,
    ticket VARCHAR(20),
    tutor_nome VARCHAR(255) NOT NULL,
    tutor_telefone VARCHAR(50),
    tutor_email VARCHAR(255),
    tutor_cpf VARCHAR(20),
    tutor_endereco TEXT,
    tutor_numero VARCHAR(20),
    tutor_complemento VARCHAR(100),
    tutor_bairro VARCHAR(100),
    tutor_cidade VARCHAR(100),
    tutor_estado VARCHAR(10),
    tutor_cep VARCHAR(15),
    tutor_localidade VARCHAR(100),
    tutor_whatsapp VARCHAR(10),
    pet_nome VARCHAR(255) NOT NULL,
    pet_especie VARCHAR(50),
    pet_sexo VARCHAR(20),
    pet_idade VARCHAR(50),
    pet_porte VARCHAR(50),
    pet_peso VARCHAR(50),
    pet_vacinado BOOLEAN DEFAULT FALSE,
    pet_medicamento TEXT,
    clinica VARCHAR(255),
    agenda VARCHAR(50),
    data_agendamento DATE,
    dia_semana VARCHAR(30),
    status VARCHAR(50) DEFAULT 'Pendente',
    created_at TIMESTAMP DEFAULT NOW()
);

-- doacoes: registros de doações
CREATE TABLE IF NOT EXISTS doacoes (
    id SERIAL PRIMARY KEY,
    doador_nome VARCHAR(255),
    doador_contato VARCHAR(100),
    tipo VARCHAR(50),
    valor DECIMAL(10,2),
    descricao TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- eventos: eventos da ONG
CREATE TABLE IF NOT EXISTS eventos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    data_evento DATE,
    local VARCHAR(255),
    endereco TEXT,
    fotos TEXT,
    status VARCHAR(50) DEFAULT 'agendado',
    created_at TIMESTAMP DEFAULT NOW()
);

-- parcerias: empresas parceiras
CREATE TABLE IF NOT EXISTS parcerias (
    id SERIAL PRIMARY KEY,
    empresa VARCHAR(255) NOT NULL,
    localidade VARCHAR(255),
    proposta TEXT,
    representante VARCHAR(255) NOT NULL,
    telefone VARCHAR(50),
    whatsapp VARCHAR(10),
    email VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- procura_se: animais desaparecidos
CREATE TABLE IF NOT EXISTS procura_se (
    id SERIAL PRIMARY KEY,
    origem TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nome VARCHAR(255),
    especie VARCHAR(100),
    sexo VARCHAR(50),
    idade VARCHAR(50),
    porte VARCHAR(50),
    cor VARCHAR(100),
    foto_url TEXT,
    informacoes TEXT,
    contato VARCHAR(255),
    status VARCHAR(50)
);

CREATE TABLE IF NOT EXISTS voluntarios (
    id SERIAL PRIMARY KEY,
    origem TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nome VARCHAR(255),
    localidade VARCHAR(255),
    telefone VARCHAR(20),
    whatsapp VARCHAR(20),
    disponibilidade TEXT,
    habilidade TEXT,
    mensagem TEXT
);

CREATE TABLE IF NOT EXISTS coleta (
    id SERIAL PRIMARY KEY,
    origem TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    nome VARCHAR(255),
    telefone VARCHAR(20),
    whatsapp VARCHAR(20),
    item VARCHAR(255),
    quantidade VARCHAR(50),
    dia VARCHAR(10),
    hora TIME,
    cep VARCHAR(10),
    endereco VARCHAR(255),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(50),
    mensagem TEXT
);

-- usuarios: usuários do sistema (login, voluntários)
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) DEFAULT 'voluntario',
    localidade VARCHAR(100),
    habilidades TEXT,
    disponibilidade VARCHAR(100),
    foto_url TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- transparencia: documentos do portal da transparência
CREATE TABLE IF NOT EXISTS transparencia (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    ano INTEGER,
    descricao TEXT,
    arquivo TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert default settings
INSERT INTO settings (chave, valor) VALUES ('clinica_baixo', 'E O BICHO') ON CONFLICT (chave) DO NOTHING;
INSERT INTO settings (chave, valor) VALUES ('clinica_pets', 'E O BICHO') ON CONFLICT (chave) DO NOTHING;

-- Insert admin user (valores fornecidos durante a instalação)
INSERT INTO usuarios (nome, email, senha, tipo)
VALUES ('${ADMIN_NOME}', '${ADMIN_EMAIL}', '${ADMIN_PASS}', 'admin')
ON CONFLICT (email) DO NOTHING;
SQLEOF

# Executar migration
info "Executando migration ($MIGRATION_FILE)..."
if PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATION_FILE" 2>&1; then
  info "Migration executada com sucesso!"
else
  warn "Erro ao executar migration — execute manualmente: psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $MIGRATION_FILE"
fi

# --------------------------------------------------------------
# Instalar dependências
# --------------------------------------------------------------
info "Instalando dependências npm..."
if npm install --prefix "$INSTALL_DIR" --production 2>&1; then
  info "Dependências npm instaladas com sucesso"
else
  warn "Erro ao instalar dependências — execute manualmente: npm install --prefix $INSTALL_DIR"
fi

# --------------------------------------------------------------
# PM2
# --------------------------------------------------------------
info "Registrando app no PM2 (usuário: $PM2_USER)"
$PM2_AS_USER pm2 delete "$PM2_APP_NAME" 2>/dev/null || true
if $PM2_AS_USER pm2 start "$INSTALL_DIR/src/server.js" --name "$PM2_APP_NAME" 2>&1; then
  $PM2_AS_USER pm2 save --force 2>&1
  info "PM2: app registrado e salvo"
else
  warn "Erro ao iniciar app no PM2 — execute manualmente: pm2 start $INSTALL_DIR/src/server.js --name $PM2_APP_NAME"
fi

# --------------------------------------------------------------
# Nginx reload
# --------------------------------------------------------------
info "Testando e recarregando Nginx"
if nginx -t 2>&1; then
  info "Nginx: configuração válida"
  if systemctl reload nginx.service 2>&1; then
    info "Nginx recarregado com sucesso!"
  else
    warn "Erro ao recarregar nginx — execute manualmente: sudo systemctl reload nginx.service"
  fi
else
  warn "Configuração do nginx inválida — execute manualmente: sudo nginx -t"
fi

# --------------------------------------------------------------
# Final
# --------------------------------------------------------------
echo ""
info "===== Instalação concluída! ====="
echo ""
echo "  Domínio: $APP_DOMAIN  |  Location: $APP_LOCATION  |  Porta: $APP_PORT"
echo "  Admin:   $ADMIN_EMAIL / $ADMIN_PASS"
echo "  PM2:     $PM2_APP_NAME ($PM2_USER)"
echo "  .env:    $INSTALL_DIR/.env"
echo "  Migração: $MIGRATION_FILE"
echo ""

info "Testando API..." && sleep 2
BASE="http://127.0.0.1:$APP_PORT/"
for endpoint in "health" ""; do
  resp=$(curl -s "${BASE}${endpoint}" 2>/dev/null) || resp=""
  case "$endpoint" in
    health) echo "$resp" | grep -q '"healthy"\|"connected"' && info "Health:    ✓" || warn "Health:    ✗ $resp" ;;
    "")     echo "$resp" | grep -q '"OK"\|"Running"'      && info "Root:      ✓" || warn "Root:      ✗ $resp" ;;
  esac
done

login_resp=$(curl -s -X POST "${BASE}auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"nome\":\"$ADMIN_NOME\",\"senha\":\"$ADMIN_PASS\"}" 2>/dev/null) || login_resp=""
echo "$login_resp" | grep -q '"success":true\|"token"' && info "Login:     ✓ autenticado" || warn "Login:     ✗ $login_resp"

echo && info "Testes concluídos!"
echo ""
echo "  Admin:   $ADMIN_EMAIL / $ADMIN_PASS"
echo "  PM2:     pm2 {status|logs|restart} $PM2_APP_NAME"
echo "  .env:    $INSTALL_DIR/.env"
echo "  Migração: $MIGRATION_FILE"
echo ""
