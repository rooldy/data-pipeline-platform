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
Phase 5b— PySpark + S3A/MinIO             ████████████████████ 100% ✅
Phase 6 — Data Quality (PySpark natif)    ████████████████████ 100% ✅
Phase 7 — Monitoring & Observabilité      ████████████████████ 100% ✅
Phase 8 — Tests & CI/CD                   ████████████████████ 100% ✅
Phase 9 — Déploiement Production          ░░░░░░░░░░░░░░░░░░░░   0% ⏳
```

---

## ✅ Ce qui a été fait

### Phase 1-3 — Infrastructure ✅
- 10 containers Docker tous **healthy**
- Git pushé sur `main`
- Images Docker Hub v1.0 et v2.0

### Phase 4 — Pipeline Builder ✅

```
frontend/src/
├── types/pipeline.types.ts
├── store/pipelineStore.ts
├── api/pipeline.api.ts
├── api/monitoring.api.ts
├── components/pipeline/
│   ├── Canvas/PipelineCanvas.tsx + nodes/
│   │   ├── SourceNode.tsx
│   │   ├── TransformNode.tsx
│   │   ├── OutputNode.tsx
│   │   └── QualityNode.tsx
│   ├── NodePalette/NodePalette.tsx
│   ├── ConfigPanel/ConfigPanel.tsx + forms/
│   │   ├── SourceForm.tsx
│   │   ├── TransformForm.tsx
│   │   ├── OutputForm.tsx
│   │   └── QualityForm.tsx
│   └── PipelineBuilder/PipelineBuilder.tsx
├── common/Toast/Toast.tsx
└── pages/Monitoring/Monitoring.tsx
```

- [x] 11 nœuds : Sources (4) + Transformations (4) + Destinations (2) + DataQuality (1)
- [x] Drag & drop + Config Panel formulaires
- [x] Bouton Sauvegarder (localStorage) + Ctrl+S
- [x] Bouton Déployer → POST /api/v1/pipelines
- [x] Toast notifications + validation
- [x] Routes : `/` Dashboard · `/pipeline/new` Builder · `/monitoring` Monitoring

### Phase 5 — Backend API & DAG Generator ✅

```
backend/
├── app/
│   ├── models/pipeline.py           ← NodeKind: source/transform/output/quality
│   ├── services/dag_generator.py
│   ├── services/airflow_client.py
│   ├── api/v1/pipelines.py
│   └── api/v1/monitoring.py
└── templates/pipeline_dag.py.j2
```

#### Endpoints
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/v1/pipelines` | Créer et déployer |
| `GET` | `/api/v1/pipelines` | Lister |
| `DELETE` | `/api/v1/pipelines/{id}` | Supprimer |
| `GET` | `/api/v1/monitoring/summary` | Résumé global |
| `GET` | `/api/v1/monitoring/pipelines/{id}/runs` | Historique |
| `GET` | `/api/v1/monitoring/pipelines/{id}/runs/{run_id}/tasks` | Tâches |
| `POST` | `/api/v1/monitoring/pipelines/{id}/trigger` | Déclencher |

### Phase 5b — PySpark + S3A/MinIO ✅

```
airflow/plugins/spark_tasks.py   ← 13 fonctions PySpark
```

Pipeline : `CSV → PySpark → Delta Lake → s3a://gold/sales` ✅ (MinIO)

### Phase 6 — Data Quality ✅

```
airflow/plugins/quality_tasks.py   ← validation PySpark natif
```

#### 4 règles
| Règle | Description |
|-------|-------------|
| `not_null` | Valeurs non nulles avec seuil % |
| `regex` | Pattern regex avec seuil % |
| `range` | Intervalle numérique avec seuil % |
| `in_set` | Ensemble de valeurs autorisées |

Pipeline testé : `CSV → DataQuality (3 règles ✅) → Delta Lake` ✅

### Phase 7 — Monitoring ✅

- KPI Bar · Pipeline Cards · Tableau des runs · Détail tâches
- Bouton Déclencher depuis le frontend
- Polling auto 30 secondes
- Route `/monitoring`

### Phase 8 — Tests & CI/CD ✅

```
backend/tests/
├── test_models.py          ← 11 tests Pydantic
├── test_dag_generator.py   ← 8 tests génération DAG
├── test_pipelines_api.py   ← 14 tests endpoints FastAPI
└── test_quality_tasks.py   ← tests Data Quality (PySpark mocké)

.github/workflows/ci.yml    ← GitHub Actions CI/CD
backend/pytest.ini
backend/requirements/test_light.txt
```

#### Résultats
```
✅ 33/33 tests passent en 0.79s
📊 66% couverture de code
   models/pipeline.py    : 100%
   api/v1/pipelines.py   :  91%
   main.py               :  77%
   dag_generator.py      :  70%
```

#### CI/CD GitHub Actions — 3 jobs
```
✅ backend-tests      → pytest 33 tests
✅ frontend-typecheck → tsc --noEmit 0 erreur
✅ docker-build       → images buildées
```

#### Corrections TypeScript
- Suppression de tous les `import React from 'react'` inutiles (react-jsx)
- Suppression des types importés non utilisés
- Fix `event.dataTransfer` possibly null
- Fix `on_event` deprecated → `lifespan` context manager

#### Sécurité
- `infos.rtf` supprimé du repo (contenait un token GitHub)
- `.gitignore` mis à jour
- Token révoqué et régénéré

---

## 🔧 Ce qui reste à faire

### Immédiat
- [ ] Docker Hub push **v3.0** (5 images)

### Phase 9 — Production
- [ ] JWT + RBAC multi-tenant
- [ ] Déploiement AWS ECS ou Kubernetes
- [ ] Monitoring Prometheus + Grafana
- [ ] SSL/TLS + domaine custom
- [ ] Backup automatique PostgreSQL + MinIO

---

## 🌐 Accès aux Services

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | — |
| **Pipeline Builder** | http://localhost:3000/pipeline/new | — |
| **Monitoring** | http://localhost:3000/monitoring | — |
| **Backend API** | http://localhost:8000 | — |
| **Swagger** | http://localhost:8000/docs | — |
| **Airflow** | http://localhost:8080 | airflow / airflow |
| **MinIO** | http://localhost:9001 | minio / minio123 |
| **Spark UI** | http://localhost:8081 | — |
| **PostgreSQL** | localhost:5435 | airflow / airflow |

---

## 💻 Commandes Utiles

### Tests
```bash
cd backend
source .venv/bin/activate
.venv/bin/pytest tests/test_models.py tests/test_dag_generator.py tests/test_pipelines_api.py -v
.venv/bin/pytest tests/ -v --cov=app --cov-report=term-missing
```

### TypeScript check
```bash
cd frontend && npx tsc --noEmit
```

### Docker
```bash
cd infrastructure/docker
docker compose up -d
docker compose ps
```

### Docker Hub push v3.0
```bash
docker tag docker-pipeline-frontend:latest rooldy/pipeline-frontend:v3.0
docker tag docker-pipeline-backend:latest rooldy/pipeline-backend:v3.0
docker tag docker-pipeline-airflow-webserver:latest rooldy/pipeline-airflow-webserver:v3.0
docker tag docker-pipeline-airflow-scheduler:latest rooldy/pipeline-airflow-scheduler:v3.0
docker tag docker-pipeline-airflow-worker:latest rooldy/pipeline-airflow-worker:v3.0
docker push rooldy/pipeline-frontend:v3.0
docker push rooldy/pipeline-backend:v3.0
docker push rooldy/pipeline-airflow-webserver:v3.0
docker push rooldy/pipeline-airflow-scheduler:v3.0
docker push rooldy/pipeline-airflow-worker:v3.0
```

### Git
```bash
git add .
git commit -m "feat: description"
git push origin main
```

---

## 🐛 Bugs Résolus

| Bug | Cause | Solution |
|-----|-------|----------|
| `openjdk-17` non trouvé | Debian Trixie arm64 | `python:3.11-slim-bookworm` |
| Frontend `unhealthy` | `localhost` → IPv6 Alpine | Healthcheck `127.0.0.1` |
| `OPTIONS 400 CORS` | Origins restrictives | `allow_origins=["*"]` |
| `NameError: true` DAG | `tojson` JSON dans Python | `json.loads('{{ config\|tojson }}')` |
| `TABLE_OR_VIEW_NOT_FOUND` | TempViews non partagées | Checkpoints Parquet |
| `S3AFileSystem not found` | JARs manquants | Ajout dans Dockerfile Airflow |
| Build Docker I/O error | Disque plein | `docker builder prune -a` |
| `NodeKind 422` | Enum sans `quality` | Ajout dans Pydantic + TypeScript |
| Colonne avec espace | Input sans trim | `.strip()` + `.trim()` |
| `React` unused TS6133 | `react-jsx` pas besoin d'import | Suppression imports inutiles |
| `on_event` deprecated | FastAPI nouveau standard | Migration vers `lifespan` |
| Token GitHub exposé | `infos.rtf` dans le repo | `git rm --cached` + révocation |
| CI pytest timeout | PySpark 300MB en CI | `test_light.txt` sans PySpark |

---

*Dernière mise à jour : 19/05/2026 — Data Pipeline Platform v3.0.0*
*Phases 1-8 : ✅ Toutes complètes*
*CI/CD : ✅ GitHub Actions — 3 jobs verts*
*Prochaine étape : Docker Hub v3.0 + Phase 9 Production*
