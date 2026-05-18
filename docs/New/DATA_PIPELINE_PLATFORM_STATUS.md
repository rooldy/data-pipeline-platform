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
Phase 8 — Tests & Documentation           ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Phase 9 — Déploiement Production          ░░░░░░░░░░░░░░░░░░░░   0% ⏳
```

---

## ✅ Ce qui a été fait

### Phase 1-3 — Infrastructure ✅
- 10 containers Docker tous **healthy**
- Git pushé sur `main`, images Docker Hub v1.0 et v2.0
- Derniers commits : `1c10c55` (data quality) + chore gitignore

### Phase 4 — Pipeline Builder ✅

```
frontend/src/
├── types/pipeline.types.ts          ← NodeKind inclut 'quality'
├── store/pipelineStore.ts
├── api/pipeline.api.ts
├── api/monitoring.api.ts            ← Phase 7
├── components/
│   ├── pipeline/
│   │   ├── Canvas/
│   │   │   ├── PipelineCanvas.tsx   ← nodeTypes inclut QualityNode
│   │   │   └── nodes/
│   │   │       ├── SourceNode.tsx
│   │   │       ├── TransformNode.tsx
│   │   │       ├── OutputNode.tsx
│   │   │       └── QualityNode.tsx  ← Phase 6
│   │   ├── NodePalette/NodePalette.tsx  ← section Qualité
│   │   ├── ConfigPanel/
│   │   │   ├── ConfigPanel.tsx
│   │   │   └── forms/
│   │   │       ├── SourceForm.tsx
│   │   │       ├── TransformForm.tsx
│   │   │       ├── OutputForm.tsx
│   │   │       └── QualityForm.tsx  ← Phase 6
│   │   └── PipelineBuilder/PipelineBuilder.tsx
│   └── common/Toast/Toast.tsx
├── pages/
│   └── Monitoring/Monitoring.tsx    ← Phase 7
└── App.tsx                          ← routes /pipeline/new + /monitoring
```

- [x] 11 nœuds custom : Sources (4) + Transformations (4) + Destinations (2) + **DataQuality (1)**
- [x] Drag & drop + Config Panel formulaires par type
- [x] Bouton Sauvegarder (localStorage) + Ctrl+S
- [x] Bouton Déployer → POST /api/v1/pipelines
- [x] Toast notifications + validation
- [x] Routes : `/` Dashboard, `/pipeline/new` Builder, `/monitoring` Monitoring

### Phase 5 — Backend API & DAG Generator ✅

```
backend/
├── app/
│   ├── models/pipeline.py           ← NodeKind inclut 'quality'
│   ├── services/dag_generator.py
│   ├── services/airflow_client.py
│   ├── api/v1/
│   │   ├── pipelines.py
│   │   └── monitoring.py
│   └── main.py
└── templates/pipeline_dag.py.j2    ← bloc quality intégré
```

#### Endpoints complets
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/v1/pipelines` | Créer et déployer un pipeline |
| `GET` | `/api/v1/pipelines` | Lister les pipelines |
| `DELETE` | `/api/v1/pipelines/{id}` | Supprimer un pipeline |
| `GET` | `/api/v1/monitoring/summary` | Résumé global tous pipelines |
| `GET` | `/api/v1/monitoring/pipelines/{id}/runs` | Historique runs |
| `GET` | `/api/v1/monitoring/pipelines/{id}/runs/{run_id}/tasks` | Tâches d'un run |
| `POST` | `/api/v1/monitoring/pipelines/{id}/trigger` | Déclencher un pipeline |

### Phase 5b — PySpark + S3A/MinIO ✅

```
airflow/plugins/spark_tasks.py   ← 11 fonctions PySpark
```

Pipeline testé : `CSV → PySpark → Delta Lake → s3a://gold/sales` ✅

### Phase 6 — Data Quality ✅

```
airflow/plugins/quality_tasks.py   ← validation PySpark natif
```

#### 4 règles implémentées
| Règle | Description | Paramètres |
|-------|-------------|------------|
| `not_null` | Valeurs non nulles | column, threshold (%) |
| `regex` | Pattern regex | column, pattern, threshold (%) |
| `range` | Intervalle numérique | column, min_value, max_value, threshold (%) |
| `in_set` | Ensemble de valeurs | column, values[], threshold (%) |

#### Pipeline testé avec succès ✅
```
CSV (/data/bronze/sales.csv)
  → Data Quality (3 règles)
      ✅ [not_null]  order_id     → 15/15 (100%)
      ✅ [range]     total_amount → 15/15 dans [0, 10000] (100%)
      ✅ [in_set]    status       → 15/15 (100%)
      📊 PASS — 3/3 règles
  → Delta Lake → s3a://gold/sales_quality
```

#### Rapport qualité JSON
Sauvegardé dans `/data/quality/{dag_id}/{node_id}.json`
Exclu du git via `.gitignore`

#### Fix colonne avec espace
- `column.strip()` dans chaque fonction `_check_*`
- `e.target.value.trim()` dans `QualityForm.tsx`

### Phase 7 — Monitoring & Observabilité ✅

- [x] KPI Bar (pipelines actifs, succès, total runs, taux moyen)
- [x] Pipeline Cards avec état, durée, taux de succès
- [x] Tableau des runs expandable par clic
- [x] Détail des tâches avec chips colorés
- [x] Bouton Déclencher depuis le frontend
- [x] Polling auto toutes les 30 secondes

---

## 🔧 Ce qui reste à faire

### Quick wins
- [ ] Docker Hub push v3.0 (toutes les images)
- [ ] Afficher les rapports Data Quality dans le Monitoring

### Phase 8 — Tests & Documentation
- [ ] Tests unitaires pytest (backend)
- [ ] Tests Jest (frontend)
- [ ] CI/CD GitHub Actions
- [ ] Coverage > 80%

### Phase 9 — Production
- [ ] JWT + RBAC multi-tenant
- [ ] Déploiement AWS ECS ou Kubernetes
- [ ] Monitoring Prometheus + Grafana

---

## 🌐 Accès aux Services

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | — |
| **Pipeline Builder** | http://localhost:3000/pipeline/new | — |
| **Monitoring** | http://localhost:3000/monitoring | — |
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
```

### Tester la Data Quality
```bash
# Voir le rapport qualité
cat data/quality/pipeline_nouveau_pipeline/*.json | python3 -m json.tool

# Vérifier le plugin
docker exec pipeline-airflow-worker python -c "
import sys; sys.path.insert(0, '/opt/airflow/plugins')
from quality_tasks import run_quality_checks
print('✅ quality_tasks OK')
"
```

### Git
```bash
git add .
git commit -m "feat: description"
git push origin main
```

### Docker Hub (release v3.0)
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

---

## 🐛 Bugs Résolus

| Bug | Cause | Solution |
|-----|-------|----------|
| `openjdk-17` non trouvé | Debian Trixie arm64 | `python:3.11-slim-bookworm` |
| Frontend `unhealthy` | `localhost` → IPv6 Alpine | Healthcheck sur `127.0.0.1` |
| `OPTIONS 400 CORS` | Origins restrictives | `allow_origins=["*"]` |
| `NameError: true` dans DAG | `tojson` JSON dans Python | `json.loads('{{ config\|tojson }}')` |
| `TABLE_OR_VIEW_NOT_FOUND` | TempViews non partagées | Checkpoints Parquet inter-tâches |
| `S3AFileSystem not found` | JARs hadoop-aws manquants | Ajout JARs dans Dockerfile Airflow |
| Build Docker I/O error | Disque Docker Desktop plein | `docker builder prune -a` |
| `NodeKind 422` | Enum Pydantic sans 'quality' | Ajout `quality` dans `NodeKind` |
| Colonne avec espace | Input sans trim | `.strip()` dans quality_tasks + `.trim()` dans QualityForm |

---

*Dernière mise à jour : 16/05/2026 — Data Pipeline Platform v3.0.0*
*Phases 1-8 (sauf tests) : ✅ Complètes*
*Pipeline réel : CSV → DataQuality → Delta Lake → MinIO ✅*
*Prochaine étape : Phase 8 Tests ou Docker Hub v3.0*
