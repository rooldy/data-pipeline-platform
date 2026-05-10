# 🚀 Data Pipeline Platform — Project Status

> **Auteur** : Rooldy Alphonse  
> **Date** : Mai 2026  
> **Stack** : FastAPI · React · Apache Airflow 2.9.2 · PySpark 3.5.1 · Delta Lake · PostgreSQL · MinIO · Redis · Docker

---

## 🗓️ Roadmap

```
Phase 1 — Infrastructure & Setup          ████████████████████ 100% ✅
Phase 2 — Containerisation Docker         ████████████████████ 100% ✅
Phase 3 — Versioning Git + Docker Hub     ████████████████████ 100% ✅
Phase 4 — Pipeline Builder (Frontend)     ████████████████████ 100% ✅
Phase 5 — Backend API & DAG Generator     ████████████████████ 100% ✅
Phase 6 — Data Quality (Great Expectations)░░░░░░░░░░░░░░░░░░░   0% ⏳
Phase 7 — Monitoring & Observabilité      ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Phase 8 — Tests & Documentation           ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Phase 9 — Déploiement Production          ░░░░░░░░░░░░░░░░░░░░   0% ⏳
```

---

## ✅ Ce qui a été fait

### Phase 1-3 — Infrastructure ✅
- 10 containers Docker tous healthy
- Git pushé sur `main`, images Docker Hub v1.0
- Commit : `ad61934`

### Phase 4 — Pipeline Builder ✅

#### Structure des fichiers
```
frontend/src/
├── types/pipeline.types.ts
├── store/pipelineStore.ts
├── api/pipeline.api.ts
├── components/
│   ├── pipeline/
│   │   ├── Canvas/
│   │   │   ├── PipelineCanvas.tsx
│   │   │   └── nodes/
│   │   │       ├── SourceNode.tsx
│   │   │       ├── TransformNode.tsx
│   │   │       └── OutputNode.tsx
│   │   ├── NodePalette/NodePalette.tsx
│   │   ├── ConfigPanel/
│   │   │   ├── ConfigPanel.tsx
│   │   │   └── forms/
│   │   │       ├── SourceForm.tsx
│   │   │       ├── TransformForm.tsx
│   │   │       └── OutputForm.tsx
│   │   └── PipelineBuilder/PipelineBuilder.tsx
│   └── common/Toast/Toast.tsx
└── App.tsx
```

#### Fonctionnalités
- [x] Layout 3 colonnes : Node Palette | Canvas React Flow | Config Panel
- [x] Drag & drop depuis la palette vers le canvas
- [x] 10 nœuds custom avec badges Medallion (Bronze/Silver/Gold)
  - Sources : CSV, PostgreSQL, API REST, S3
  - Transformations : Filter, Aggregate, Join, Cast
  - Destinations : Delta Lake, PostgreSQL
- [x] Connexions entre nœuds avec handles colorés
- [x] Layer Medallion automatique
- [x] Config Panel formulaires par type de nœud
- [x] Bouton Sauvegarder → localStorage
- [x] Bouton Déployer → POST /api/v1/pipelines + fallback localStorage
- [x] Champ Schedule cron dans la topbar
- [x] Toast notifications (succès / erreur / info)
- [x] Validation avant déploiement
- [x] Routing : `/` Dashboard, `/pipeline/new` Pipeline Builder

#### Dépendances npm ajoutées
```bash
npm install @xyflow/react zustand react-hook-form zod react-router-dom
```

### Phase 5 — Backend API & DAG Generator ✅

#### Structure des fichiers
```
backend/
├── app/
│   ├── models/pipeline.py        ← Modèles Pydantic
│   ├── services/dag_generator.py ← Générateur DAG Jinja2
│   ├── api/v1/pipelines.py       ← Router FastAPI
│   └── main.py                   ← App FastAPI v0.2.0
└── templates/
    └── pipeline_dag.py.j2        ← Template DAG Airflow
```

#### Endpoints implémentés
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/v1/pipelines` | Créer et déployer un pipeline |
| `GET` | `/api/v1/pipelines` | Lister les pipelines générés |
| `DELETE` | `/api/v1/pipelines/{id}` | Supprimer un pipeline |

#### Fonctionnalités
- [x] Validation Pydantic de `PipelineDefinition`
- [x] Génération DAG Airflow via template Jinja2
- [x] Sauvegarde dans `/opt/airflow/dags/generated/`
- [x] Volume Docker partagé backend ↔ Airflow
- [x] DAGs visibles et exécutables dans Airflow UI ✅ Toutes tâches vertes
- [x] Fix CORS (`allow_origins=["*"]`, `allow_credentials=False`)
- [x] Fix `true` JSON → `json.loads()` Python
- [x] Fix tags Medallion → `{{ node.layer.value }}`

#### Fichier CSV de test
```
data/bronze/sales.csv
Colonnes : order_id, customer_id, customer_name, region, category,
           product, quantity, unit_price, total_amount, order_date, status
15 lignes de données de ventes
Accessible dans tous les containers via /data/bronze/sales.csv
```

#### Configuration Docker ajoutée
```yaml
# pipeline-backend volumes
- ../../airflow/dags:/opt/airflow/dags
```

#### Requirements ajoutés
```
jinja2==3.1.3
aiofiles==23.2.1
```

#### Git
```
Commit : e6e75e5 — feat: phase 5 backend api and dag generator complete
Branch : main
38 fichiers, 3964 insertions
```

---

## 🔧 Ce qui reste à faire

### Polishing Phase 4 & 5
- [ ] Fix healthcheck Docker frontend (`wget` au lieu de `curl`)
- [ ] Ctrl+S → Sauvegarder (keyboard shortcut)
- [ ] Docker Hub push `v2.0`

### Phase 6 — Data Quality (Great Expectations)
- [ ] Intégration Great Expectations dans les pipelines Silver
- [ ] Règles : not_null, regex, range, in_set
- [ ] Nœud "Data Quality" dans le Pipeline Builder
- [ ] Rapport de qualité dans le frontend

### Phase 7 — Monitoring & Observabilité
- [ ] Dashboard temps réel (métriques, durée, lignes traitées)
- [ ] `GET /api/v1/pipelines/{id}/runs` → statuts d'exécution
- [ ] Alertes email/Slack

### Phase 8 — Tests & Documentation
- [ ] Tests unitaires pytest (backend)
- [ ] Tests Jest (frontend)
- [ ] CI/CD GitHub Actions

### Phase 9 — Production
- [ ] Authentification JWT + RBAC
- [ ] Déploiement cloud (AWS ECS ou Kubernetes)

### À implémenter dans les DAGs générés
- [ ] Lecture CSV réelle avec PySpark
- [ ] Lecture PostgreSQL via JDBC
- [ ] Appel API REST
- [ ] Lecture/écriture S3/MinIO
- [ ] Transformations PySpark (Filter, Aggregate, Join, Cast)
- [ ] Écriture Delta Lake

---

## 🌐 Accès aux Services

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | — |
| **Pipeline Builder** | http://localhost:3000/pipeline/new | — |
| **Backend API** | http://localhost:8000 | — |
| **Swagger Docs** | http://localhost:8000/docs | — |
| **Apache Airflow** | http://localhost:8080 | airflow / airflow |
| **MinIO Console** | http://localhost:9001 | minio / minio123 |
| **Spark UI** | http://localhost:8081 | — |
| **PostgreSQL** | localhost:5435 | airflow / airflow |

---

## 💻 Commandes Utiles

### Docker
```bash
cd infrastructure/docker
docker compose up -d
docker compose ps
docker compose logs pipeline-backend --tail=30
docker compose build --no-cache pipeline-backend
docker compose up -d pipeline-spark-master pipeline-spark-worker
```

### Tester l'API
```bash
curl -X POST http://localhost:8000/api/v1/pipelines \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test_pipeline",
    "nodes": [
      {"id":"n1","kind":"source","subtype":"csv","label":"CSV",
       "layer":"bronze","config":{"path":"/data/bronze/sales.csv"},"position":{"x":100,"y":100}},
      {"id":"n2","kind":"output","subtype":"delta_lake","label":"Delta Lake",
       "layer":"gold","config":{"path":"s3a://bucket/gold","table_name":"gold.test","mode":"append"},"position":{"x":100,"y":300}}
    ],
    "edges":[{"id":"e1","source":"n1","target":"n2","layer":"bronze"}]
  }'
```

### DAGs générés
```bash
ls -la airflow/dags/generated/
rm airflow/dags/generated/pipeline_test_pipeline.py
```

### Git
```bash
git add .
git commit -m "feat: description"
git push origin main
```

### Docker Hub (prochaine release v2.0)
```bash
docker tag docker-pipeline-backend:latest rooldy/pipeline-backend:v2.0
docker tag docker-pipeline-frontend:latest rooldy/pipeline-frontend:v2.0
docker push rooldy/pipeline-backend:v2.0
docker push rooldy/pipeline-frontend:v2.0
```

---

## 🐛 Bugs Résolus

| Bug | Cause | Solution |
|-----|-------|----------|
| `openjdk-17` non trouvé | Debian Trixie (arm64) | `python:3.11-slim-bookworm` |
| Contexte Docker 69 MB | `node_modules` inclus | `.dockerignore` |
| Port 5432 déjà utilisé | Ancien container actif | Exposé sur 5435 |
| `useNodesState` infer `never[]` | Tableau vide sans générique | `useNodesState<Node>([])` |
| `Type 'object' not assignable to NodeConfig` | Type trop générique | Cast `NodeConfig` explicite |
| `Type 'unknown' not assignable to ReactNode` | `config.auth_type` unknown | `!!(config.auth_type) &&` |
| Fermeture manquante `useCallback` | Copier-coller incomplet | Ajout `}, [rfInstance, ...])` |
| Ancien `ConfigPanel` inline affiché | Import manquant | `import ConfigPanel from ...` |
| `OPTIONS 400 Bad Request` (CORS) | Origins trop restrictives | `allow_origins=["*"]` |
| `NameError: name 'true' is not defined` | `tojson` génère JSON dans Python | `json.loads('{{ config\|tojson }}')` |
| `MedallionLayer.bronze` dans les tags | Enum sans `.value` | `{{ node.layer.value }}` |
| Spark Master non running | Container arrêté | `docker compose up -d pipeline-spark-master` |

---

*Dernière mise à jour : 08/05/2026 — Data Pipeline Platform v2.0.0*
*Phase 1-5 : ✅ Complètes*
*Git : ✅ Commit e6e75e5 pushé sur main*
*Prochaine étape : Phase 6 — Data Quality (Great Expectations)*
