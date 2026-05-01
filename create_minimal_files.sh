#!/bin/bash

set -e

PROJECT_ROOT="."
COLORS_GREEN='\033[0;32m'
COLORS_BLUE='\033[0;34m'
COLORS_YELLOW='\033[1;33m'
COLORS_NC='\033[0m'

echo -e "${COLORS_BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS_NC}"
echo -e "${COLORS_BLUE}🚀 CRÉATION DES FICHIERS MINIMAUX - DATA PIPELINE PLATFORM${COLORS_NC}"
echo -e "${COLORS_BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS_NC}"
echo ""

# ============================================================================
# BACKEND - Requirements
# ============================================================================

echo -e "${COLORS_YELLOW}📦 Création des requirements backend...${COLORS_NC}"

mkdir -p backend/requirements

cat > backend/requirements/base.txt << 'EOF'
# Core
fastapi==0.109.0
uvicorn[standard]==0.27.0
pydantic==2.5.0
pydantic-settings==2.1.0

# Database
sqlalchemy==2.0.25
alembic==1.13.1
psycopg2-binary==2.9.9
asyncpg==0.29.0

# PySpark & Delta
pyspark==3.5.1
delta-spark==3.0.0

# Data Processing
pandas==2.1.4
pyarrow==14.0.2
great-expectations==0.18.8

# Auth & Security
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6

# Utils
redis==5.0.1
loguru==0.7.2
python-dotenv==1.0.0
EOF

cat > backend/requirements/prod.txt << 'EOF'
-r base.txt

# Production
gunicorn==21.2.0
EOF

cat > backend/requirements/dev.txt << 'EOF'
-r base.txt

# Development
black==23.12.1
isort==5.13.2
flake8==7.0.0
mypy==1.8.0

# Testing
pytest==7.4.4
pytest-cov==4.1.0
pytest-asyncio==0.23.3
httpx==0.26.0
faker==22.0.0

# Tools
ipython==8.20.0
EOF

cat > backend/requirements/test.txt << 'EOF'
-r base.txt

pytest==7.4.4
pytest-cov==4.1.0
pytest-asyncio==0.23.3
httpx==0.26.0
faker==22.0.0
EOF

echo -e "${COLORS_GREEN}✓ Requirements créés${COLORS_NC}"

# ============================================================================
# BACKEND - Application
# ============================================================================

echo -e "${COLORS_YELLOW}🔧 Création de l'application backend...${COLORS_NC}"

mkdir -p backend/app

cat > backend/app/__init__.py << 'EOF'
"""Data Pipeline Platform - Backend Application"""

__version__ = "0.1.0"
EOF

cat > backend/app/main.py << 'EOF'
"""
FastAPI Application - Data Pipeline Platform
Main entry point for the API
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Data Pipeline Platform API",
    description="API pour la création de pipelines ETL no-code avec architecture Medallion",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8000",
        "http://pipeline-frontend:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Actions au démarrage"""
    logger.info("🚀 Starting Data Pipeline Platform API...")
    logger.info("📊 Version: 0.1.0")
    logger.info("🏗️  Architecture: Medallion (Bronze/Silver/Gold)")

@app.on_event("shutdown")
async def shutdown_event():
    """Actions à l'arrêt"""
    logger.info("🛑 Shutting down Data Pipeline Platform API...")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Data Pipeline Platform API",
        "version": "0.1.0",
        "status": "running",
        "architecture": "Medallion (Bronze/Silver/Gold)",
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "pipelines": "/api/v1/pipelines"
        }
    }

@app.get("/health")
async def health():
    """Health check endpoint for Docker"""
    return {
        "status": "healthy",
        "service": "backend-api",
        "version": "0.1.0"
    }

@app.get("/api/v1/pipelines")
async def list_pipelines():
    """Liste des pipelines (placeholder)"""
    return {
        "pipelines": [],
        "total": 0,
        "message": "No pipelines yet. Start creating your first pipeline!"
    }

@app.get("/api/v1/layers")
async def list_layers():
    """Liste des couches Medallion"""
    return {
        "layers": [
            {
                "name": "bronze",
                "description": "Raw data ingestion layer",
                "color": "#CD7F32"
            },
            {
                "name": "silver",
                "description": "Cleaned and validated data layer",
                "color": "#C0C0C0"
            },
            {
                "name": "gold",
                "description": "Business-ready aggregated data layer",
                "color": "#FFD700"
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
EOF

echo -e "${COLORS_GREEN}✓ Application backend créée${COLORS_NC}"

# ============================================================================
# FRONTEND - Package.json
# ============================================================================

echo -e "${COLORS_YELLOW}🎨 Création du frontend...${COLORS_NC}"

mkdir -p frontend/src

cat > frontend/package.json << 'EOF'
{
  "name": "data-pipeline-platform-frontend",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx",
    "format": "prettier --write 'src/**/*.{ts,tsx,css}'"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.21.0",
    "axios": "^1.6.5"
  },
  "devDependencies": {
    "@types/react": "^18.2.47",
    "@types/react-dom": "^18.2.18",
    "@vitejs/plugin-react": "^4.2.1",
    "vite": "^5.0.11",
    "typescript": "^5.3.3"
  }
}
EOF

cat > frontend/tsconfig.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
EOF

cat > frontend/tsconfig.node.json << 'EOF'
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
EOF

cat > frontend/vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    watch: {
      usePolling: true,
    },
    proxy: {
      '/api': {
        target: 'http://pipeline-backend:8000',
        changeOrigin: true,
      },
    },
  },
})
EOF

cat > frontend/index.html << 'EOF'
<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Data Pipeline Platform</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
EOF

cat > frontend/src/vite-env.d.ts << 'EOF'
/// <reference types="vite/client" />
EOF

cat > frontend/src/main.tsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

cat > frontend/src/App.tsx << 'EOF'
import React, { useEffect, useState } from 'react'
import axios from 'axios'

interface ApiInfo {
  message: string
  version: string
  status: string
  architecture: string
}

function App() {
  const [apiInfo, setApiInfo] = useState<ApiInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchApiInfo = async () => {
      try {
        const response = await axios.get('http://localhost:8000/')
        setApiInfo(response.data)
        setLoading(false)
      } catch (err) {
        setError('Failed to connect to backend')
        setLoading(false)
      }
    }

    fetchApiInfo()
  }, [])

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🚀 Data Pipeline Platform</h1>
        <p style={styles.subtitle}>Architecture Medallion - Bronze / Silver / Gold</p>
      </header>

      <main style={styles.main}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Status</h2>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p style={styles.error}>{error}</p>
          ) : (
            <ul style={styles.statusList}>
              <li>✅ Frontend: Running</li>
              <li>✅ Backend: Connected (v{apiInfo?.version})</li>
              <li>✅ Architecture: {apiInfo?.architecture}</li>
            </ul>
          )}
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Medallion Layers</h2>
          <div style={styles.layers}>
            <div style={styles.layer}>
              <span style={styles.layerIcon}>🥉</span>
              <div>
                <strong>Bronze</strong>
                <p style={styles.layerDesc}>Raw data ingestion</p>
              </div>
            </div>
            <div style={styles.layer}>
              <span style={styles.layerIcon}>🥈</span>
              <div>
                <strong>Silver</strong>
                <p style={styles.layerDesc}>Cleaned & validated data</p>
              </div>
            </div>
            <div style={styles.layer}>
              <span style={styles.layerIcon}>🥇</span>
              <div>
                <strong>Gold</strong>
                <p style={styles.layerDesc}>Business-ready aggregations</p>
              </div>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Next Steps</h2>
          <ol style={styles.stepsList}>
            <li>Create your first Bronze pipeline</li>
            <li>Add transformations in Silver layer</li>
            <li>Build business metrics in Gold layer</li>
            <li>Monitor and schedule your pipelines</li>
          </ol>
        </div>
      </main>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    padding: '3rem 2rem',
    textAlign: 'center' as const,
    color: 'white',
  },
  title: {
    fontSize: '3rem',
    margin: '0 0 0.5rem 0',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: '1.2rem',
    margin: 0,
    opacity: 0.9,
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  },
  cardTitle: {
    margin: '0 0 1.5rem 0',
    fontSize: '1.5rem',
    color: '#333',
  },
  statusList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    fontSize: '1.1rem',
    lineHeight: '2',
  },
  error: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
  layers: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  layer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    background: '#f8f9fa',
    borderRadius: '8px',
  },
  layerIcon: {
    fontSize: '2rem',
  },
  layerDesc: {
    margin: '0.25rem 0 0 0',
    color: '#666',
    fontSize: '0.9rem',
  },
  stepsList: {
    paddingLeft: '1.5rem',
    lineHeight: '2',
    color: '#555',
  },
}

export default App
EOF

cat > frontend/src/index.css << 'EOF'
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
EOF

echo -e "${COLORS_GREEN}✓ Frontend créé${COLORS_NC}"

# ============================================================================
# AIRFLOW - Requirements
# ============================================================================

echo -e "${COLORS_YELLOW}✈️  Création des requirements Airflow...${COLORS_NC}"

cat > airflow/requirements.txt << 'EOF'
# Airflow providers
apache-airflow-providers-celery==3.6.0
apache-airflow-providers-postgres==5.10.0

# PySpark & Delta
pyspark==3.5.1
delta-spark==3.0.0

# Data Processing
pandas==2.1.4
pyarrow==14.0.2
great-expectations==0.18.8

# Database
psycopg2-binary==2.9.9

# Utils
python-dotenv==1.0.0
loguru==0.7.2
EOF

echo -e "${COLORS_GREEN}✓ Requirements Airflow créés${COLORS_NC}"

# ============================================================================
# SQL - Init Script
# ============================================================================

echo -e "${COLORS_YELLOW}🗄️  Création des scripts SQL...${COLORS_NC}"

mkdir -p sql

cat > sql/init-databases.sh << 'EOF'
#!/bin/bash
set -e

echo "🔧 Creating databases..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Création de la base de données métier
    CREATE DATABASE ${POSTGRES_DB_METIER};
    GRANT ALL PRIVILEGES ON DATABASE ${POSTGRES_DB_METIER} TO ${POSTGRES_USER};
EOSQL

echo "✅ Database '${POSTGRES_DB_METIER}' created successfully"
EOF

chmod +x sql/init-databases.sh

cat > sql/schema.sql << 'EOF'
-- ============================================================================
-- SCHEMA - DATA PIPELINE PLATFORM
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

-- Table des exécutions
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

-- Index
CREATE INDEX IF NOT EXISTS idx_pipelines_layer ON pipelines(layer);
CREATE INDEX IF NOT EXISTS idx_pipeline_runs_pipeline ON pipeline_runs(pipeline_id);

COMMENT ON TABLE pipelines IS 'Pipelines ETL avec architecture Medallion';
COMMENT ON COLUMN pipelines.layer IS 'bronze, silver ou gold';
EOF

echo -e "${COLORS_GREEN}✓ Scripts SQL créés${COLORS_NC}"

# ============================================================================
# CONFIG - .env
# ============================================================================

echo -e "${COLORS_YELLOW}⚙️  Copie du fichier .env...${COLORS_NC}"

if [ ! -f config/.env ]; then
    cp config/.env.example config/.env
    echo -e "${COLORS_GREEN}✓ Fichier .env créé${COLORS_NC}"
else
    echo -e "${COLORS_YELLOW}⚠️  Fichier .env existe déjà (non modifié)${COLORS_NC}"
fi

# ============================================================================
# RÉSUMÉ
# ============================================================================

echo ""
echo -e "${COLORS_BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS_NC}"
echo -e "${COLORS_GREEN}✅ TOUS LES FICHIERS MINIMAUX ONT ÉTÉ CRÉÉS !${COLORS_NC}"
echo -e "${COLORS_BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS_NC}"
echo ""

echo -e "${COLORS_YELLOW}📋 Fichiers créés:${COLORS_NC}"
echo "  Backend:"
echo "    ✓ requirements/base.txt"
echo "    ✓ requirements/dev.txt"
echo "    ✓ requirements/test.txt"
echo "    ✓ requirements/prod.txt"
echo "    ✓ app/__init__.py"
echo "    ✓ app/main.py"
echo ""
echo "  Frontend:"
echo "    ✓ package.json"
echo "    ✓ tsconfig.json"
echo "    ✓ vite.config.ts"
echo "    ✓ index.html"
echo "    ✓ src/main.tsx"
echo "    ✓ src/App.tsx"
echo "    ✓ src/index.css"
echo ""
echo "  Airflow:"
echo "    ✓ requirements.txt"
echo ""
echo "  SQL:"
echo "    ✓ init-databases.sh"
echo "    ✓ schema.sql"
echo ""
echo "  Config:"
echo "    ✓ .env"
echo ""

echo -e "${COLORS_GREEN}🚀 Prochaines étapes:${COLORS_NC}"
echo ""
echo "  1. Installer les dépendances frontend:"
echo "     cd frontend && npm install && cd .."
echo ""
echo "  2. Démarrer les services Docker:"
echo "     cd infrastructure/docker"
echo "     docker-compose up -d"
echo ""
echo "  3. Vérifier les services:"
echo "     docker-compose ps"
echo ""
echo "  4. Accéder aux interfaces:"
echo "     - Frontend:  http://localhost:3000"
echo "     - Backend:   http://localhost:8000/docs"
echo "     - Airflow:   http://localhost:8080 (airflow/airflow)"
echo "     - MinIO:     http://localhost:9001 (minio/minio123)"
echo ""
echo -e "${COLORS_BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${COLORS_NC}"