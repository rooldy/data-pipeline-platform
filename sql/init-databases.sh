#!/bin/bash
set -e

echo "🔧 Creating databases..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Création de la base de données métier
    CREATE DATABASE ${POSTGRES_DB_METIER};
    GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB_METIER} TO ${POSTGRES_USER};
EOSQL

echo "✅ Database '${POSTGRES_DB_METIER}' created successfully"