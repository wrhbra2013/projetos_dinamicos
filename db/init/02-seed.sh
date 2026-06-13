#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    INSERT INTO settings (chave, valor) VALUES ('clinica_baixo', 'E O BICHO') ON CONFLICT (chave) DO NOTHING;
    INSERT INTO settings (chave, valor) VALUES ('clinica_pets', 'E O BICHO') ON CONFLICT (chave) DO NOTHING;

    INSERT INTO usuarios (nome, email, senha, tipo)
    VALUES ('${ADMIN_NOME:-admin}', '${ADMIN_EMAIL:-admin@amoranimal.ong.br}', '${ADMIN_PASS:-@admin}', 'admin')
    ON CONFLICT (email) DO NOTHING;
EOSQL
