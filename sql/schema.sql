-- ============================================================================
-- SCHEMA - DATA PIPELINE PLATFORM
-- ============================================================================
-- Base de données métier pour la gestion des pipelines
-- ============================================================================

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'analyst',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Table des pipelines
CREATE TABLE IF NOT EXISTS pipelines (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    layer VARCHAR(10) NOT NULL CHECK (layer IN ('bronze', 'silver', 'gold')),
    config JSONB NOT NULL,
    source_pipeline_id INTEGER REFERENCES pipelines(id),
    owner_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    schedule_cron VARCHAR(100)
);

-- Table des exécutions de pipelines
CREATE TABLE IF NOT EXISTS pipeline_runs (
    id SERIAL PRIMARY KEY,
    pipeline_id INTEGER REFERENCES pipelines(id),
    started_at TIMESTAMP NOT NULL,
    ended_at TIMESTAMP,
    duration_seconds INTEGER,
    status VARCHAR(20) NOT NULL,
    metrics JSONB,
    logs TEXT,
    error_message TEXT,
    airflow_dag_id VARCHAR(255),
    airflow_run_id VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table des connexions (credentials)
CREATE TABLE IF NOT EXISTS connections (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    credentials_encrypted TEXT NOT NULL,
    owner_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index
CREATE INDEX IF NOT EXISTS idx_pipelines_layer ON pipelines(layer);
CREATE INDEX IF NOT EXISTS idx_pipelines_owner ON pipelines(owner_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_pipeline ON pipeline_runs(pipeline_id);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_status ON pipeline_runs(status);

-- Commentaires
COMMENT ON TABLE pipelines IS 'Pipelines ETL créés par les utilisateurs';
COMMENT ON TABLE pipeline_runs IS 'Historique des exécutions de pipelines';
COMMENT ON COLUMN pipelines.layer IS 'Couche Medallion: bronze, silver ou gold';
COMMENT ON COLUMN pipelines.config IS 'Configuration JSON du pipeline (sources, transformations, destinations)';