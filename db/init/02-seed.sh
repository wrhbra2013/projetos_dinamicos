#!/bin/bash
set -e

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    INSERT INTO login (usuario, senha, isadmin)
    VALUES ('${ADMIN_EMAIL:-admin@amoranimal.ong.br}', '${ADMIN_PASS:-@admin}', true)
    ON CONFLICT (usuario) DO NOTHING;
EOSQL
