const { Pool } = require('pg');
const express = require('express');

const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = new Pool({
    host: process.env.DB_HOST || 'db',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'amoranimal_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || 'postgres'
});

pool.on('error', (err) => console.error('DB Error:', err));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

function gerarTicket(tipo, seq) {
    const prefixo = tipo === 'mutirao' ? 'M' : tipo === 'pets_rua' ? 'R' : 'B';
    return prefixo + String(seq).padStart(3, '0');
}

async function tabelaExiste(tabela) {
    const result = await pool.query(
        `SELECT EXISTS(SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1)`,
        [tabela]
    );
    return result.rows[0].exists;
}

async function garantirColunas(tabela, data) {
    const chaves = Object.keys(data);
    if (chaves.length === 0) return;
    try {
        const result = await pool.query(
            `SELECT column_name FROM information_schema.columns WHERE table_name = $1`,
            [tabela]
        );
        const colunasExistentes = new Set(result.rows.map(r => r.column_name));
        const novas = chaves.filter(k => !colunasExistentes.has(k));
        for (const coluna of novas) {
            await pool.query(`ALTER TABLE "${tabela}" ADD COLUMN "${coluna}" TEXT`);
            console.log(`Coluna "${coluna}" criada em "${tabela}"`);
        }
    } catch (err) {
        console.error('Erro ao garantir colunas:', err.message);
    }
}

async function garantirTabela(tabela, data) {
    if (await tabelaExiste(tabela)) return;
    const cols = Object.keys(data)
        .filter(k => k !== 'id')
        .map(k => `"${k}" TEXT`)
        .join(', ');
    await pool.query(`
        CREATE TABLE IF NOT EXISTS "${tabela}" (
            id SERIAL PRIMARY KEY,
            ${cols},
            created_at TIMESTAMP DEFAULT NOW()
        )
    `);
    console.log(`Tabela "${tabela}" criada dinamicamente`);
}

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

app.post('/auth/login', async (req, res) => {
    const { usuario, senha } = req.body;
    if (!usuario || !senha) {
        return res.status(400).json({ error: 'Usuário e senha são obrigatórios' });
    }
    try {
        const result = await pool.query(
            'SELECT id, usuario, isadmin FROM login WHERE usuario = $1 AND senha = $2',
            [usuario, senha]
        );
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Usuário ou senha inválidos' });
        }
        const user = result.rows[0];
        const token = crypto.createHash('sha256')
            .update(user.usuario + Date.now() + 'amoranimal_secret')
            .digest('hex');
        res.json({ success: true, token, usuario: user });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/settings', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM home ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/settings', async (req, res) => {
    const { titulo, mensagem, link, arquivo } = req.body;
    if (!titulo) {
        return res.status(400).json({ error: 'titulo é obrigatório' });
    }
    try {
        const result = await pool.query(
            `INSERT INTO home (titulo, mensagem, link, arquivo) VALUES ($1, $2, $3, $4) RETURNING *`,
            [titulo, mensagem || null, link || null, arquivo || null]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/:tabela', async (req, res) => {
    const { tabela } = req.params;
    if (!(await tabelaExiste(tabela))) {
        return res.status(404).json({ error: 'Tabela não encontrada' });
    }
    try {
        const result = await pool.query(`SELECT * FROM "${tabela}" ORDER BY id DESC LIMIT 500`);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/:tabela', async (req, res) => {
    const { tabela } = req.params;
    const data = req.body;
    try {
        await garantirTabela(tabela, data);
        await garantirColunas(tabela, data);

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

app.put('/:tabela/:id', async (req, res) => {
    const { tabela, id } = req.params;
    if (!(await tabelaExiste(tabela))) {
        return res.status(404).json({ error: 'Tabela não encontrada' });
    }
    const data = req.body;
    try {
        await garantirColunas(tabela, data);

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

app.delete('/:tabela/:id', async (req, res) => {
    const { tabela, id } = req.params;
    if (!(await tabelaExiste(tabela))) {
        return res.status(404).json({ error: 'Tabela não encontrada' });
    }
    try {
        await pool.query(`DELETE FROM "${tabela}" WHERE id = $1`, [id]);
        res.json({ success: true, message: 'Registro excluído' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/transparencia', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM transparencia ORDER BY ano DESC, origem DESC');
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
            case '1':
                logs.push('Docker: git pull not supported inside container');
                break;
            case '3':
                logs.push('Docker: git pull not supported inside container');
                break;
            case '4':
                execSync('npm install --prefix ' + path.join(__dirname, '..') + ' 2>&1', { timeout: 60000 });
                logs.push('Dependências instaladas');
                break;
            case '5':
                logs.push('Docker: reinicie o container: docker-compose restart api');
                break;
            default:
                logs.push('Opção não implementada: ' + option);
        }
        res.json({ success: true, log: logs.join('\n') });
    } catch (err) {
        res.status(500).json({ success: false, log: logs.join('\n') + '\nErro: ' + err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
