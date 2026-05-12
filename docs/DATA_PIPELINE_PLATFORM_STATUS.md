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
Phase 5b— PySpark DAG Execution           ████████████████████ 100% ✅
Phase 6 — Data Quality (Great Expectations)░░░░░░░░░░░░░░░░░░░   0% ⏳
Phase 7 — Monitoring & Observabilité      ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Phase 8 — Tests & Documentation           ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Phase 9 — Déploiement Production          ░░░░░░░░░░░░░░░░░░░░   0% ⏳
```

---

## ✅ Ce qui a été fait

### Phase 1-3 — Infrastructure ✅
- 10 containers Docker tous **healthy** (dont frontend enfin healthy ✅)
- Git pushé sur `main`, images Docker Hub v1.0 et **v2.0**
- Commits : `ad61934` → `44d8ba5` → `96706f9`

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

- [x] Drag & drop 10 nœuds custom (Sources/Transformations/Destinations)
- [x] Config Panel formulaires par type
- [x] Bouton Sauvegarder (localStorage) + Ctrl+S
- [x] Bouton Déployer → POST /api/v1/pipelines
- [x] Toast notifications + validation
- [x] Routing `/` Dashboard, `/pipeline/new` Builder

### Phase 5 — Backend API & DAG Generator ✅

```
backend/
├── app/
│   ├── models/pipeline.py        ← Pydantic models
│   ├── services/dag_generator.py ← Jinja2 generator
│   ├── api/v1/pipelines.py       ← FastAPI router
│   └── main.py                   ← v0.2.0
└── templates/pipeline_dag.py.j2  ← DAG template
```

- [x] `POST /api/v1/pipelines` → génère DAG Airflow
- [x] `GET /api/v1/pipelines` → liste pipelines
- [x] Volume Docker partagé backend ↔ Airflow
- [x] DAGs visibles dans Airflow UI

### Phase 5b — PySpark DAG Execution ✅

```
airflow/plugins/spark_tasks.py   ← fonctions PySpark réutilisables
```

#### Fonctions implémentées
| Fonction | Description |
|----------|-------------|
| `get_spark_session()` | SparkSession + Delta Lake + S3A config |
| `read_csv()` | Lecture CSV avec PySpark |
| `read_postgresql()` | Lecture PostgreSQL via JDBC |
| `apply_filter()` | Filtre sur colonne |
| `apply_aggregate()` | GroupBy + agrégations |
| `apply_join()` | Jointure deux DataFrames |
| `apply_cast()` | Conversion de types |
| `write_delta_lake()` | Écriture Delta Lake (append/overwrite/merge) |
| `write_postgresql()` | Écriture PostgreSQL via JDBC |
| `write_checkpoint()` | Sauvegarde inter-tâches en Parquet |
| `read_checkpoint()` | Lecture checkpoint Parquet |

#### Architecture inter-tâches
Chaque tâche Airflow tourne dans son propre processus → les TempViews Spark ne sont pas partagées. Solution : **checkpoints Parquet** dans `/data/checkpoints/{dag_id}/{node_id}/`

#### Pipeline testé avec succès ✅
```
CSV (/data/bronze/sales.csv)
  → PySpark read_csv() → 15 lignes
  → write_checkpoint()
  → read_checkpoint()
  → write_delta_lake() → /data/gold/sales/
    ├── part-00000-....snappy.parquet  ✅
    └── _delta_log/                   ✅ (ACID)
```

#### Fichier CSV de test
```
/data/bronze/sales.csv
Colonnes : order_id, customer_id, customer_name, region, category,
           product, quantity, unit_price, total_amount, order_date, status
15 lignes de données de ventes
```

#### Notes importantes
- **S3A/MinIO non disponible** dans Spark (JARs hadoop-aws manquants)
- Utiliser **chemins locaux** `/data/gold/...` au lieu de `s3a://...`
- Pour activer S3A plus tard, ajouter dans le Dockerfile Airflow :
  ```dockerfile
  RUN wget -q https://repo1.maven.org/maven2/org/apache/hadoop/hadoop-aws/3.3.4/hadoop-aws-3.3.4.jar \
      -P ${SPARK_HOME}/jars/ && \
      wget -q https://repo1.maven.org/maven2/com/amazonaws/aws-java-sdk-bundle/1.12.262/aws-java-sdk-bundle-1.12.262.jar \
      -P ${SPARK_HOME}/jars/
  ```

#### Git
```
Commit : 96706f9 — feat: pyspark dag execution - csv to delta lake pipeline working
Branch : main
Docker Hub : v2.0 (frontend + backend)
```

---

## 🔧 Ce qui reste à faire

### Quick wins
- [ ] Ajouter `data/checkpoints/` et `data/gold/` au `.gitignore`
- [ ] Ajouter JARs S3A/MinIO dans Dockerfile Airflow (rebuild)

### Phase 6 — Data Quality (Great Expectations)
- [ ] Intégration Great Expectations dans les pipelines Silver
- [ ] Règles : not_null, regex, range, in_set
- [ ] Nœud "Data Quality" dans le Pipeline Builder
- [ ] Rapport de qualité dans le frontend

### Phase 7 — Monitoring & Observabilité
- [ ] Dashboard temps réel (métriques, durée, lignes traitées)
- [ ] `GET /api/v1/pipelines/{id}/runs` → statuts d'exécution
- [ ] Polling statuts DAGs via Airflow REST API
- [ ] Alertes email/Slack

### Phase 8 — Tests & Documentation
- [ ] Tests unitaires pytest (backend)
- [ ] Tests Jest (frontend)
- [ ] CI/CD GitHub Actions

### Phase 9 — Production
- [ ] Authentification JWT + RBAC
- [ ] Déploiement cloud (AWS ECS ou Kubernetes)

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
docker compose logs pipeline-airflow-worker --tail=30
docker compose build --no-cache pipeline-airflow-webserver pipeline-airflow-scheduler pipeline-airflow-worker
```

### Vérifier les données générées
```bash
docker exec pipeline-airflow-worker ls -la /data/gold/sales/
docker exec pipeline-airflow-worker ls -la /data/checkpoints/
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
       "layer":"gold","config":{"path":"/data/gold/test","table_name":"gold.test","mode":"append"},"position":{"x":100,"y":300}}
    ],
    "edges":[{"id":"e1","source":"n1","target":"n2","layer":"bronze"}]
  }'
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
| Frontend `unhealthy` | `localhost` → IPv6 dans Alpine | Healthcheck sur `127.0.0.1` |
| `OPTIONS 400 Bad Request` CORS | Origins restrictives | `allow_origins=["*"]` |
| `NameError: true` dans DAG | `tojson` génère JSON dans Python | `json.loads('{{ config\|tojson }}')` |
| `MedallionLayer.bronze` dans tags | Enum sans `.value` | `{{ node.layer.value }}` |
| `TABLE_OR_VIEW_NOT_FOUND` | TempViews non partagées entre process | Checkpoints Parquet inter-tâches |
| `S3AFileSystem not found` | JARs hadoop-aws manquants | Chemins locaux `/data/gold/...` |

---

*Dernière mise à jour : 10/05/2026 — Data Pipeline Platform v2.0.0*
*Phases 1-5b : ✅ Infrastructure + Builder + API + PySpark end-to-end*
*Pipeline réel : CSV → PySpark → Delta Lake ✅ (15 lignes écrites)*
*Prochaine étape : Phase 6 — Data Quality ou Phase 7 — Monitoring*
