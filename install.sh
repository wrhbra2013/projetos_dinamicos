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
BACKUP_ROOT="/var/backups/amoranimal"

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
uninstall_app() {
  [ -f "$INSTALL_DIR/.env" ] || error ".env não encontrado em $INSTALL_DIR"

  local udb_host udb_port udb_name udb_user udb_pass upm2 unginx_bkp
  upm2="amoranimal"

  udb_host=$(grep -oP '^DB_HOST=\K.*' "$INSTALL_DIR/.env" 2>/dev/null || echo "localhost")
  udb_port=$(grep -oP '^DB_PORT=\K.*' "$INSTALL_DIR/.env" 2>/dev/null || echo "5432")
  udb_name=$(grep -oP '^DB_NAME=\K.*' "$INSTALL_DIR/.env" 2>/dev/null || echo "")
  udb_user=$(grep -oP '^DB_USER=\K.*' "$INSTALL_DIR/.env" 2>/dev/null || echo "")
  udb_pass=$(grep -oP '^PASSWORD=\K.*' "$INSTALL_DIR/.env" 2>/dev/null || echo "")
  grep -oP '^PM2_APP_NAME=\K.*' "$INSTALL_DIR/.env" 2>/dev/null && upm2=$(grep -oP '^PM2_APP_NAME=\K.*' "$INSTALL_DIR/.env") || true
  unginx_bkp=$(grep -oP '^NGINX_BKP=\K.*' "$INSTALL_DIR/.env" 2>/dev/null || echo "")

  info "Parando PM2 ($upm2)"
  $PM2_AS_USER pm2 delete "$upm2" 2>/dev/null || true
  $PM2_AS_USER pm2 save --force 2>/dev/null || true

  # Restaurar nginx do backup
  if [ -n "$unginx_bkp" ] && [ -f "$unginx_bkp" ]; then
    info "Restaurando nginx de $unginx_bkp"
    cp "$unginx_bkp" "$NGINX_CONF"
    nginx -t 2>/dev/null && systemctl reload nginx 2>/dev/null && \
      info "Nginx restaurado" || warn "Falha ao recarregar nginx"
  else
    warn "Backup nginx não encontrado ($unginx_bkp) — removendo bloco # BEGIN $upm2"
    cp "$NGINX_CONF" "$NGINX_CONF.bkp.$(date +%Y%m%d_%H%M%S)"
    sed -i "/^# BEGIN $upm2\$/,/^# END $upm2\$/d" "$NGINX_CONF" 2>/dev/null || true
    nginx -t 2>/dev/null && systemctl reload nginx 2>/dev/null || true
  fi

  # Remover banco
  if [ -n "$udb_name" ] && [ -n "$udb_user" ]; then
    info "Removendo banco $udb_name..."
    export PGPASSWORD="$udb_pass"
    TABLES=$(psql -h "$udb_host" -p "$udb_port" -U "$udb_user" -d "$udb_name" -t -c "SELECT tablename FROM pg_tables WHERE schemaname='public';" 2>/dev/null) || true
    for tbl in $TABLES; do
      psql -h "$udb_host" -p "$udb_port" -U "$udb_user" -d "$udb_name" -c "DROP TABLE IF EXISTS \"$tbl\" CASCADE;" 2>/dev/null || true
    done
    unset PGPASSWORD
    sudo -u postgres psql -c "DROP DATABASE IF EXISTS \"$udb_name\";" 2>/dev/null || true
    info "Banco $udb_name removido"
  fi

  info "Removendo $INSTALL_DIR"
  rm -rf "$INSTALL_DIR"

  info "Desinstalação concluída!"
}

case "${1:-}" in
  uninstall) uninstall_app; exit 0 ;;
esac

# ==============================================================
# Rollback automático em caso de erro na instalação
# ==============================================================
ROLLBACK_DIR=""
cleanup_on_error() {
  local rc=$?
  [ $rc -eq 0 ] && return 0
  warn "ERRO: Instalação falhou (código $rc) — revertendo alterações..."
  if [ -n "$ROLLBACK_DIR" ] && [ -d "$ROLLBACK_DIR" ]; then
    info "Restaurando backup pré-instalação de $ROLLBACK_DIR"
    rm -rf "$SRC_DIR" 2>/dev/null || true
    [ -d "$ROLLBACK_DIR/src.bkp" ] && cp -r "$ROLLBACK_DIR/src.bkp" "$SRC_DIR" 2>/dev/null || true
    [ -f "$ROLLBACK_DIR/env.bkp" ] && cp "$ROLLBACK_DIR/env.bkp" "$INSTALL_DIR/.env" 2>/dev/null || true
    [ -f "$ROLLBACK_DIR/package.json.bkp" ] && cp "$ROLLBACK_DIR/package.json.bkp" "$INSTALL_DIR/package.json" 2>/dev/null || true
    [ -f "$ROLLBACK_DIR/nginx_default.bkp" ] && cp "$ROLLBACK_DIR/nginx_default.bkp" "$NGINX_CONF" 2>/dev/null || true
    info "Rollback concluído."
  else
    warn "Nenhum backup prévio encontrado — removendo artefatos..."
    $PM2_AS_USER pm2 delete "$PM2_APP_NAME" 2>/dev/null || true
    rm -rf "$INSTALL_DIR" 2>/dev/null || true
    info "Artefatos removidos"
  fi
  exit $rc
}
trap 'cleanup_on_error' EXIT
trap 'error "Instalação interrompida pelo usuário"' INT TERM

# Backup automático pré-instalação (se já existir instalação)
if [ -d "$INSTALL_DIR" ] || [ -f "$NGINX_CONF" ]; then
  ROLLBACK_DIR="$BACKUP_ROOT/preinstall_$(date +%Y%m%d_%H%M%S)"
  mkdir -p "$ROLLBACK_DIR"
  info "Backup pré-instalação em $ROLLBACK_DIR"
  [ -f "$INSTALL_DIR/.env" ] && cp "$INSTALL_DIR/.env" "$ROLLBACK_DIR/env.bkp" 2>/dev/null || true
  [ -f "$INSTALL_DIR/package.json" ] && cp "$INSTALL_DIR/package.json" "$ROLLBACK_DIR/package.json.bkp" 2>/dev/null || true
  [ -d "$SRC_DIR" ] && cp -r "$SRC_DIR" "$ROLLBACK_DIR/src.bkp" 2>/dev/null || true
  [ -f "$NGINX_CONF" ] && cp "$NGINX_CONF" "$ROLLBACK_DIR/nginx_default.bkp" 2>/dev/null || true
fi

command -v node  >/dev/null 2>&1 || error "Node.js não encontrado"
command -v npm   >/dev/null 2>&1 || error "npm não encontrado"
command -v psql  >/dev/null 2>&1 || warn "psql não encontrado — PostgreSQL pode não estar instalado"
command -v pm2   >/dev/null 2>&1 || warn "pm2 não encontrado — será instalado via npm"

mkdir -p "$SRC_DIR" "$INSTALL_DIR/uploads/transparencia" "$INSTALL_DIR/backups"

# --------------------------------------------------------------
# Inputs do usuário
# --------------------------------------------------------------
echo ""
echo "============================================"
echo "  Configuração da instalação"
echo "============================================"
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
  printf "Porta do app [3000]: "; read -r APP_PORT
  APP_PORT=${APP_PORT:-3000}
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
printf "Nome do banco de dados PostgreSQL [amoranimal_db]: "; read -r DB_NAME
DB_NAME=${DB_NAME:-amoranimal_db}
printf "Nome do app no PM2 [amoranimal]: "; read -r PM2_APP_NAME
PM2_APP_NAME=${PM2_APP_NAME:-amoranimal}
printf "Email do administrador [amoranimalmariliadev@gmail.com]: "; read -r ADMIN_EMAIL
ADMIN_EMAIL=${ADMIN_EMAIL:-amoranimalmariliadev@gmail.com}
printf "Nome do administrador [$ADMIN_EMAIL]: "; read -r ADMIN_NOME
ADMIN_NOME=${ADMIN_NOME:-$ADMIN_EMAIL}
printf "Senha do administrador [@admin]: "; stty -echo; read -r ADMIN_PASS; stty echo; echo ""
ADMIN_PASS=${ADMIN_PASS:-@admin}
DB_USER=postgres
DB_PASS=wander
DB_HOST=localhost
DB_PORT=5432
APP_DOMAIN=api.projetosdinamicos.com.br
APP_LOCATION=/$PM2_APP_NAME/

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
chmod 600 "$INSTALL_DIR/.env"
chown "$PM2_USER" "$INSTALL_DIR/.env"
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
    const { email, senha } = req.body;
    if (!email || !senha) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    try {
        const result = await pool.query(
            'SELECT id, nome, email, tipo FROM usuarios WHERE email = $1 AND senha = $2',
            [email, senha]
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
    'eventos', 'parcerias', 'procura_se', 'usuarios'
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

// ===================== API TABLES (genérico, legado) =====================

app.post('/api/tables', async (req, res) => {
    const { tableName, columns } = req.body;
    if (!tableName || !columns || !Array.isArray(columns)) {
        return res.status(400).json({ error: 'tableName e columns (array) são obrigatórios' });
    }
    try {
        const columnDefs = columns.map(col => {
            if (typeof col === 'string') return `"${col}" TEXT`;
            return `"${col.name}" ${col.type || 'TEXT'}${col.primary ? ' PRIMARY KEY' : ''}${col.notnull ? ' NOT NULL' : ''}`;
        }).join(', ');
        await pool.query(`CREATE TABLE IF NOT EXISTS "${tableName}" (${columnDefs});`);
        res.json({ success: true, message: `Tabela "${tableName}" criada` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/tables/:tableName', async (req, res) => {
    const { tableName } = req.params;
    try {
        await pool.query(`DROP TABLE IF EXISTS "${tableName}" CASCADE;`);
        res.json({ success: true, message: `Tabela "${tableName}" excluída` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/tables', async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT table_name FROM information_schema.tables
            WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
            ORDER BY table_name;
        `);
        res.json({ tables: result.rows.map(r => r.table_name) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/tables/:tableName', async (req, res) => {
    const { tableName } = req.params;
    try {
        const result = await pool.query(`SELECT * FROM "${tableName}" LIMIT 100;`);
        res.json({ table: tableName, data: result.rows, columns: result.fields.map(f => f.name) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/tables/:tableName', async (req, res) => {
    const { tableName } = req.params;
    const data = req.body;
    try {
        const keys = Object.keys(data).map(k => `"${k}"`).join(', ');
        const values = Object.keys(data).map((_, i) => `$${i + 1}`).join(', ');
        const result = await pool.query(
            `INSERT INTO "${tableName}" (${keys}) VALUES (${values}) RETURNING *;`,
            Object.values(data)
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put('/api/tables/:tableName/:id', async (req, res) => {
    const { tableName, id } = req.params;
    const data = req.body;
    try {
        const keys = Object.keys(data).map((k, i) => `"${k}" = $${i + 1}`).join(', ');
        const result = await pool.query(
            `UPDATE "${tableName}" SET ${keys} WHERE id = $${Object.keys(data).length + 1} RETURNING *;`,
            [...Object.values(data), id]
        );
        res.json({ success: true, data: result.rows[0] });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/tables/:tableName/:id', async (req, res) => {
    const { tableName, id } = req.params;
    try {
        await pool.query(`DELETE FROM "${tableName}" WHERE id = $1;`, [id]);
        res.json({ success: true, message: 'Registro excluído' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ===================== INICIALIZAÇÃO =====================

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
SVREOF
sed -i "s/process\.env\.PORT || 3000/process.env.PORT || $APP_PORT/" "$SRC_DIR/server.js"

# --------------------------------------------------------------
# Nginx — adiciona server block único para este app
# --------------------------------------------------------------
info "Configurando Nginx"

if [ ! -f "$NGINX_CONF" ]; then
  warn "$NGINX_CONF não encontrado — criando arquivo vazio"
  echo "# Nginx default — Amor Animal API" > "$NGINX_CONF"
fi

if grep -q "^# BEGIN $PM2_APP_NAME\$" "$NGINX_CONF"; then
  warn "Bloco # BEGIN $PM2_APP_NAME já existe em $NGINX_CONF — pulando"
else
  # Backup antes de alterar
  NGINX_BKP_VAL="$NGINX_CONF.bkp.$(date +%Y%m%d_%H%M%S)"
  cp "$NGINX_CONF" "$NGINX_BKP_VAL"
  sed -i "s|^NGINX_BKP=.*|NGINX_BKP=$NGINX_BKP_VAL|" "$INSTALL_DIR/.env"

  # SSL cert paths dinâmicos
  SSL_DIR="/etc/letsencrypt/live"
  SSL_CERT=""
  SSL_KEY=""
  for d in "$SSL_DIR"/*/; do
    [ -f "${d}fullchain.pem" ] || continue
    if echo "$d" | grep -qi "$(echo "$APP_DOMAIN" | sed 's/^www\.//')"; then
      SSL_CERT="${d}fullchain.pem"
      SSL_KEY="${d}privkey.pem"
      break
    fi
  done
  # Fallback: primeiro certificado encontrado
  if [ -z "$SSL_CERT" ]; then
    for d in "$SSL_DIR"/*/; do
      [ -f "${d}fullchain.pem" ] || continue
      SSL_CERT="${d}fullchain.pem"
      SSL_KEY="${d}privkey.pem"
      break
    done
  fi

  # Se APP_LOCATION for sub-path (ex: /amoranimal/), proxy_pass precisa de trailing slash
  PROXY_TRAIL="/"
  [ "$APP_LOCATION" = "/" ] && PROXY_TRAIL=""

  cat >> "$NGINX_CONF" <<NGINXEOF

# BEGIN $PM2_APP_NAME
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

NGINXEOF
  if [ -n "$SSL_CERT" ]; then
    cat >> "$NGINX_CONF" <<NGINXEOF
    ssl_certificate $SSL_CERT;
    ssl_certificate_key $SSL_KEY;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

NGINXEOF
  else
    cat >> "$NGINX_CONF" <<NGINXEOF
    # SSL: certifique-se de gerar certificado para $APP_DOMAIN
    # ssl_certificate /etc/letsencrypt/live/$APP_DOMAIN/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/$APP_DOMAIN/privkey.pem;

NGINXEOF
  fi

  cat >> "$NGINX_CONF" <<NGINXEOF
    location /.well-known/acme-challenge/ {
        root /var/www;
    }

    location $APP_LOCATION {
        proxy_pass http://127.0.0.1:$APP_PORT$PROXY_TRAIL;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    client_max_body_size 15M;
}
# END $PM2_APP_NAME
NGINXEOF
  info "Server block # BEGIN $PM2_APP_NAME inserido em $NGINX_CONF"
fi

# --------------------------------------------------------------
# PostgreSQL — criar usuário e banco
# --------------------------------------------------------------
info "Criando usuário e banco PostgreSQL"
if command -v sudo >/dev/null 2>&1 && sudo -u postgres psql -c "SELECT 1" >/dev/null 2>&1; then
  if [ "$DB_USER" != "postgres" ]; then
    if [ -n "$DB_PASS" ]; then
      sudo -u postgres psql -c "CREATE USER $DB_USER WITH PASSWORD '$DB_PASS';" 2>/dev/null || warn "Usuário $DB_USER já existe"
    else
      sudo -u postgres psql -c "CREATE USER $DB_USER;" 2>/dev/null || warn "Usuário $DB_USER já existe"
    fi
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;" 2>/dev/null
  fi
  sudo -u postgres psql -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" 2>/dev/null || warn "Banco $DB_NAME já existe"
  info "Usuário/banco criados com sucesso"
else
  warn "Não foi possível acessar o PostgreSQL como superusuário (postgres)"
  warn "Crie manualmente:"
  warn "  sudo -u postgres createuser $DB_USER -P"
  warn "  sudo -u postgres createdb $DB_NAME -O $DB_USER"
fi

# --------------------------------------------------------------
# Migration — criar todas as tabelas do projeto
# --------------------------------------------------------------
info "Executando migration — criando tabelas..."
MIGRATION_FILE="$INSTALL_DIR/migrations/001_create_tables.sql"
mkdir -p "$INSTALL_DIR/migrations"

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
    tutor_nome VARCHAR(255) NOT NULL,
    tutor_contato VARCHAR(100),
    tutor_whatsapp VARCHAR(100),
    pet_nome VARCHAR(255) NOT NULL,
    pet_especie VARCHAR(50),
    pet_idade VARCHAR(100),
    pet_porte VARCHAR(50),
    pet_caracteristicas TEXT,
    local_desaparecimento VARCHAR(255),
    data_desaparecimento DATE,
    foto_url TEXT,
    status VARCHAR(50) DEFAULT 'desaparecido',
    created_at TIMESTAMP DEFAULT NOW()
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
if command -v sudo >/dev/null 2>&1 && sudo -u postgres psql -c "SELECT 1" >/dev/null 2>&1; then
  PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$MIGRATION_FILE" 2>/dev/null && \
    info "Migration executada com sucesso!" || warn "Erro ao executar migration — execute manualmente: psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $MIGRATION_FILE"
else
  warn "Migration não executada automaticamente."
  warn "Execute manualmente:"
  warn "  psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f $MIGRATION_FILE"
fi

# --------------------------------------------------------------
# Instalar dependências
# --------------------------------------------------------------
info "Instalando dependências npm"
npm install --prefix "$INSTALL_DIR" --production

# --------------------------------------------------------------
# PM2
# --------------------------------------------------------------
info "Registrando app no PM2 (usuário: $PM2_USER)"
$PM2_AS_USER pm2 delete "$PM2_APP_NAME" 2>/dev/null || true
$PM2_AS_USER pm2 start "$INSTALL_DIR/src/server.js" --name "$PM2_APP_NAME" && \
  $PM2_AS_USER pm2 save --force && \
  info "PM2: app registrado e salvo"

# --------------------------------------------------------------
# Nginx reload
# --------------------------------------------------------------
info "Testando e recarregando Nginx"
nginx -t && systemctl reload nginx && info "Nginx recarregado com sucesso!" || warn "Falha no nginx — execute manualmente: sudo nginx -t && sudo systemctl reload nginx"

INSTALL_OK=1

# --------------------------------------------------------------
# Final
# --------------------------------------------------------------
echo ""
info "==========================================="
info " Instalação concluída!"
info "==========================================="
echo ""
echo "  Domínio:   $APP_DOMAIN"
echo "  Location:  $APP_LOCATION"
echo "  Porta:     $APP_PORT"
echo "  PM2:       $PM2_APP_NAME"
echo ""
echo "  Endpoints da API:"
echo "    GET    ${APP_LOCATION}"
echo "    GET    ${APP_LOCATION}health"
echo "    POST   ${APP_LOCATION}auth/login"
echo "    GET    ${APP_LOCATION}settings"
echo ""
echo "  Tabelas (CRUD automático):"
echo "    GET    ${APP_LOCATION}animais"
echo "    GET    ${APP_LOCATION}adocoes"
echo "    GET    ${APP_LOCATION}castracoes"
echo "    GET    ${APP_LOCATION}doacoes"
echo "    GET    ${APP_LOCATION}eventos"
echo "    GET    ${APP_LOCATION}parcerias"
echo "    GET    ${APP_LOCATION}procura_se"
echo "    GET    ${APP_LOCATION}usuarios"
echo "    POST   ${APP_LOCATION}:tabela             (inserir)"
echo "    PUT    ${APP_LOCATION}:tabela/:id         (atualizar)"
echo "    DELETE ${APP_LOCATION}:tabela/:id         (excluir)"
echo ""
echo "  Portal da Transparência:"
echo "    GET    ${APP_LOCATION}transparencia"
echo "    POST   ${APP_LOCATION}transparencia"
echo ""
echo "  Relatório:"
echo "    GET    ${APP_LOCATION}relatorio/tabelas"
echo "    GET    ${APP_LOCATION}relatorio/backups"
echo "    POST   ${APP_LOCATION}relatorio/backup"
echo "    POST   ${APP_LOCATION}relatorio/restore"
echo "    POST   ${APP_LOCATION}relatorio/maintenance"
echo ""
echo "  Admin:  $ADMIN_EMAIL / $ADMIN_PASS"
echo ""
echo "  .env:  $INSTALL_DIR/.env"
echo "  PM2:   $PM2_USER (usuário do processo)"
echo "  Migration:  $MIGRATION_FILE"

info "Testando API..."
sleep 2
BASE="http://127.0.0.1:$APP_PORT${APP_LOCATION}"

health_resp=$(curl -s "${BASE}health" 2>/dev/null) || health_resp=""
if echo "$health_resp" | grep -q '"healthy"\|"connected"'; then
  info "Health:    ✓ $health_resp"
else
  warn "Health:    ✗ $health_resp"
fi

root_resp=$(curl -s "${BASE}" 2>/dev/null) || root_resp=""
if echo "$root_resp" | grep -q '"OK"\|"Running"'; then
  info "Root:      ✓ $root_resp"
else
  warn "Root:      ✗ $root_resp"
fi

settings_resp=$(curl -s "${BASE}settings" 2>/dev/null) || settings_resp=""
if echo "$settings_resp" | grep -q '"clinica_baixo"\|\[\]\|\[\|"chave"'; then
  info "Settings:  ✓ $settings_resp"
else
  warn "Settings:  ✗ $settings_resp"
fi

login_resp=$(curl -s -X POST "${BASE}auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"senha\":\"$ADMIN_PASS\"}" 2>/dev/null) || login_resp=""
if echo "$login_resp" | grep -q '"success":true\|"token"'; then
  info "Login:     ✓ autenticado"
else
  warn "Login:     ✗ $login_resp"
fi

echo ""
info "Testes concluídos!"

echo ""
echo "  Comandos PM2 (rodando como $PM2_USER — sem sudo do seu shell):"
echo "    status:  pm2 status"
echo "    logs:    pm2 logs $PM2_APP_NAME"
echo "    restart: pm2 restart $PM2_APP_NAME"
echo ""
