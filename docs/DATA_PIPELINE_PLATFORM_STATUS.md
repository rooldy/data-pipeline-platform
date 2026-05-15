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
Phase 7 — Monitoring & Observabilité      ████████████████████ 100% ✅
Phase 6 — Data Quality (Great Expectations)░░░░░░░░░░░░░░░░░░░   0% ⏳
Phase 8 — Tests & Documentation           ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Phase 9 — Déploiement Production          ░░░░░░░░░░░░░░░░░░░░   0% ⏳
```

---

## ✅ Ce qui a été fait

### Phase 1-3 — Infrastructure ✅
- 10 containers Docker tous **healthy** (dont frontend ✅)
- Git pushé sur `main`, images Docker Hub v1.0 et v2.0
- Commits : `ad61934` → `44d8ba5` → `96706f9` → dernier commit monitoring

### Phase 4 — Pipeline Builder ✅

```
frontend/src/
├── types/pipeline.types.ts
├── store/pipelineStore.ts
├── api/pipeline.api.ts
├── components/
│   ├── pipeline/
│   │   ├── Canvas/PipelineCanvas.tsx + nodes/ (Source/Transform/Output)
│   │   ├── NodePalette/NodePalette.tsx
│   │   ├── ConfigPanel/ConfigPanel.tsx + forms/ (Source/Transform/Output)
│   │   └── PipelineBuilder/PipelineBuilder.tsx
│   └── common/Toast/Toast.tsx
└── App.tsx
```

- [x] Drag & drop 10 nœuds custom (Sources / Transformations / Destinations)
- [x] Config Panel formulaires par type de nœud
- [x] Bouton Sauvegarder (localStorage) + Ctrl+S
- [x] Bouton Déployer → POST /api/v1/pipelines
- [x] Toast notifications + validation
- [x] Routing : `/` Dashboard, `/pipeline/new` Builder, `/monitoring` Monitoring

### Phase 5 — Backend API & DAG Generator ✅

```
backend/
├── app/
│   ├── models/pipeline.py
│   ├── services/dag_generator.py
│   ├── services/airflow_client.py  ← nouveau Phase 7
│   ├── api/v1/
│   │   ├── pipelines.py
│   │   └── monitoring.py           ← nouveau Phase 7
│   └── main.py
└── templates/pipeline_dag.py.j2
```

#### Endpoints
| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/api/v1/pipelines` | Créer et déployer un pipeline |
| `GET` | `/api/v1/pipelines` | Lister les pipelines |
| `DELETE` | `/api/v1/pipelines/{id}` | Supprimer un pipeline |
| `GET` | `/api/v1/monitoring/summary` | Résumé global tous pipelines |
| `GET` | `/api/v1/monitoring/pipelines` | Liste DAGs avec statuts |
| `GET` | `/api/v1/monitoring/pipelines/{id}/runs` | Historique runs |
| `GET` | `/api/v1/monitoring/pipelines/{id}/runs/{run_id}/tasks` | Tâches d'un run |
| `POST` | `/api/v1/monitoring/pipelines/{id}/trigger` | Déclencher un pipeline |

### Phase 5b — PySpark + S3A/MinIO ✅

```
airflow/plugins/spark_tasks.py   ← 11 fonctions PySpark
```

#### Pipeline testé avec succès ✅
```
CSV (/data/bronze/sales.csv) 15 lignes, 11 colonnes
  → PySpark read_csv()
  → write_checkpoint() → /data/checkpoints/
  → read_checkpoint()
  → write_delta_lake() → s3a://gold/sales  ✅ (MinIO)
    ├── part-00000-....snappy.parquet
    └── _delta_log/  (ACID transactions)
```

#### JARs S3A dans Airflow Dockerfile
```dockerfile
RUN wget -q https://repo1.maven.org/maven2/org/apache/hadoop/hadoop-aws/3.3.4/hadoop-aws-3.3.4.jar \
    -P ${SPARK_HOME}/jars/ && \
    wget -q https://repo1.maven.org/maven2/com/amazonaws/aws-java-sdk-bundle/1.12.262/aws-java-sdk-bundle-1.12.262.jar \
    -P ${SPARK_HOME}/jars/
```

#### Notes importantes
- Pour les chemins Delta Lake utiliser `s3a://bucket/path` (MinIO) ✅
- Les checkpoints Parquet transitent par `/data/checkpoints/{dag_id}/{node_id}/`
- Chaque tâche Airflow = processus séparé → TempViews non partagées → solution checkpoints

### Phase 7 — Monitoring & Observabilité ✅

```
frontend/src/
├── api/monitoring.api.ts          ← types + appels API + helpers formatDuration/formatDate
└── pages/Monitoring/
    ├── Monitoring.tsx             ← dashboard complet
    └── Monitoring.css             ← styles

backend/app/
├── services/airflow_client.py    ← client Airflow REST API (httpx async)
└── api/v1/monitoring.py          ← router FastAPI monitoring
```

#### Fonctionnalités Monitoring
- [x] **KPI Bar** — Pipelines actifs, Derniers runs ✅, Total exécutions, Taux de succès moyen
- [x] **Pipeline Cards** — une carte par DAG avec état, durée, taux de succès
- [x] **Tableau des runs** — état, date, durée, expandable par clic
- [x] **Détail des tâches** — chips colorés avec durée par tâche (filtré start/end)
- [x] **Bouton Déclencher** — trigger manuel depuis le frontend via Airflow REST API
- [x] **Polling auto** — rafraîchissement toutes les 30 secondes
- [x] **Bouton Rafraîchir** manuel
- [x] Route `/monitoring` ajoutée dans App.tsx
- [x] Lien "📊 Ouvrir le Monitoring" dans le Dashboard

#### Données affichées (exemple réel)
```
pipeline_nouveau_pipeline
├── 1 pipeline actif
├── 60% taux de succès (3/5 runs)
├── Dernier run : ✅ success — 1m 51s
└── Historique : 6 runs (3 success, 3 failed)
```

---

## 🔧 Ce qui reste à faire

### Quick wins
- [ ] Docker Hub push v3.0 (frontend + backend + airflow avec JARs S3A)
- [ ] Ajouter `httpx` dans `requirements/prod.txt` si absent

### Phase 6 — Data Quality (Great Expectations)
- [ ] Intégration Great Expectations dans la couche Silver
- [ ] Nœud "DataQuality" dans le Pipeline Builder
- [ ] 4 règles : not_null, regex, range, in_set
- [ ] Rapport de qualité dans le frontend
- [ ] Stockage résultats en PostgreSQL

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
docker compose logs pipeline-backend --tail=30
docker compose build --no-cache pipeline-airflow-webserver pipeline-airflow-scheduler pipeline-airflow-worker
```

### Tester le Monitoring API
```bash
curl http://localhost:8000/api/v1/monitoring/summary | python3 -m json.tool
curl http://localhost:8000/api/v1/monitoring/pipelines/pipeline_nouveau_pipeline/runs | python3 -m json.tool
```

### Tester l'API Pipeline
```bash
curl -X POST http://localhost:8000/api/v1/pipelines \
  -H "Content-Type: application/json" \
  -d '{
    "name": "test_pipeline",
    "nodes": [
      {"id":"n1","kind":"source","subtype":"csv","label":"CSV",
       "layer":"bronze","config":{"path":"/data/bronze/sales.csv"},"position":{"x":100,"y":100}},
      {"id":"n2","kind":"output","subtype":"delta_lake","label":"Delta Lake",
       "layer":"gold","config":{"path":"s3a://gold/sales","table_name":"gold.sales","mode":"append"},"position":{"x":100,"y":300}}
    ],
    "edges":[{"id":"e1","source":"n1","target":"n2","layer":"bronze"}]
  }'
```

### Vérifier les données MinIO
```bash
# Voir les buckets créés
curl -u minio:minio123 http://localhost:9000
# Ou via l'UI MinIO : http://localhost:9001
```

### Git
```bash
git add .
git commit -m "feat: description"
git push origin main
```

### Docker Hub (prochaine release v3.0)
```bash
docker tag docker-pipeline-frontend:latest rooldy/pipeline-frontend:v3.0
docker tag docker-pipeline-backend:latest rooldy/pipeline-backend:v3.0
docker tag docker-pipeline-airflow-webserver:latest rooldy/pipeline-airflow-webserver:v3.0
docker tag docker-pipeline-airflow-scheduler:latest rooldy/pipeline-airflow-scheduler:v3.0
docker tag docker-pipeline-airflow-worker:latest rooldy/pipeline-airflow-worker:v3.0
# Push all
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
| `OPTIONS 400 Bad Request` CORS | Origins restrictives | `allow_origins=["*"]` |
| `NameError: true` dans DAG | `tojson` génère JSON dans Python | `json.loads('{{ config\|tojson }}')` |
| `MedallionLayer.bronze` dans tags | Enum sans `.value` | `{{ node.layer.value }}` |
| `TABLE_OR_VIEW_NOT_FOUND` | TempViews non partagées entre process | Checkpoints Parquet inter-tâches |
| `S3AFileSystem not found` | JARs hadoop-aws manquants | Ajout JARs dans Dockerfile Airflow |
| Build Docker échoue (I/O error) | Disque Docker Desktop plein | `docker builder prune -a` + augmenter disque |
| `useNodesState` infer `never[]` | Tableau vide sans générique | `useNodesState<Node>([])` |

---

*Dernière mise à jour : 14/05/2026 — Data Pipeline Platform v3.0.0*
*Phases 1-5b + 7 : ✅ Complètes*
*Pipeline réel : CSV → PySpark → Delta Lake → MinIO s3a:// ✅*
*Monitoring : Airflow REST API → Dashboard temps réel ✅*
*Prochaine étape : Phase 6 — Data Quality (Great Expectations) ou Phase 8 — Tests*
