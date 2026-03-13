from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import os

app = Flask(__name__)
CORS(app)
DB_NAME = "database.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS projetos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            descricao TEXT,
            status TEXT DEFAULT 'planejamento',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS atividades (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            projeto_id INTEGER,
            titulo TEXT NOT NULL,
            descricao TEXT,
            status TEXT DEFAULT 'pendente',
            data_inicio TEXT,
            data_fim TEXT,
            FOREIGN KEY (projeto_id) REFERENCES projetos(id)
        )
    ''')
    
    conn.commit()
    conn.close()

def row_to_dict(cursor, row):
    columns = [description[0] for description in cursor.description]
    return dict(zip(columns, row))

@app.route('/api/projetos', methods=['GET'])
def get_projetos():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM projetos ORDER BY created_at DESC")
    projetos = [row_to_dict(cursor, row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(projetos)

@app.route('/api/projetos', methods=['POST'])
def create_projeto():
    data = request.json
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO projetos (nome, descricao, status) VALUES (?, ?, ?)",
        (data.get('nome'), data.get('descricao'), data.get('status', 'planejamento'))
    )
    conn.commit()
    projeto_id = cursor.lastrowid
    conn.close()
    return jsonify({"id": projeto_id, "message": "Projeto criado"}), 201

@app.route('/api/projetos/<int:id>', methods=['PUT'])
def update_projeto(id):
    data = request.json
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE projetos SET nome=?, descricao=?, status=? WHERE id=?",
        (data.get('nome'), data.get('descricao'), data.get('status'), id)
    )
    conn.commit()
    conn.close()
    return jsonify({"message": "Projeto atualizado"})

@app.route('/api/projetos/<int:id>', methods=['DELETE'])
def delete_projeto(id):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute("DELETE FROM projetos WHERE id=?", (id,))
    conn.commit()
    conn.close()
    return jsonify({"message": "Projeto excluído"})

@app.route('/api/projetos/<int:projeto_id>/atividades', methods=['GET'])
def get_atividades(projeto_id):
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM atividades WHERE projeto_id=?", (projeto_id,))
    atividades = [row_to_dict(cursor, row) for row in cursor.fetchall()]
    conn.close()
    return jsonify(atividades)

@app.route('/api/projetos/<int:projeto_id>/atividades', methods=['POST'])
def create_atividade(projeto_id):
    data = request.json
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO atividades (projeto_id, titulo, descricao, status, data_inicio, data_fim) VALUES (?, ?, ?, ?, ?, ?)",
        (projeto_id, data.get('titulo'), data.get('descricao'), data.get('status', 'pendente'), data.get('data_inicio'), data.get('data_fim'))
    )
    conn.commit()
    atividade_id = cursor.lastrowid
    conn.close()
    return jsonify({"id": atividade_id, "message": "Atividade criada"}), 201

if __name__ == '__main__':
    if not os.path.exists(DB_NAME):
        init_db()
        print("Banco de dados criado!")
    app.run(debug=True, port=5000)
