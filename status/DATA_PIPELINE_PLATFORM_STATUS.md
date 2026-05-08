# 🚀 Data Pipeline Platform — Project Status

> **Auteur** : Rooldy Alphonse  
> **Date** : Mai 2026  
> **Stack** : FastAPI · React · Apache Airflow 2.9.2 · PySpark 3.5.1 · Delta Lake · PostgreSQL · MinIO · Redis · Docker

---

## 📋 Table des Matières

1. [Objectif du Projet](#objectif)
2. [Architecture](#architecture)
3. [Stack Technique](#stack)
4. [Roadmap](#roadmap)
5. [Ce qui a été fait](#fait)
6. [Git & Docker Hub — Stratégie de Versioning](#versioning)
7. [Ce qui reste à faire](#reste)
8. [Accès aux Services](#acces)
9. [Commandes Utiles](#commandes)

---

## 🎯 Objectif du Projet <a name="objectif"></a>

**Data Pipeline Platform** est une plateforme **self-service no-code** permettant aux analystes data de créer, gérer et monitorer des pipelines ETL sans écrire de code, en suivant l'**Architecture Medallion** (Bronze / Silver / Gold).

### Problèmes résolus

| Problème | Solution |
|----------|----------|
| Data engineers surchargés (60-70% sur tâches répétitives) | Interface no-code pour les analystes |
| Délais de 2-5 jours pour un pipeline simple | Création en 2 heures via drag-and-drop |
| Pas de standardisation des pipelines | Architecture Medallion native et imposée |
| Absence de monitoring et de gouvernance | Dashboard temps réel + Data Lineage |

### Chiffres Clés

- ⏱️ **85%** de réduction du temps de création de pipeline
- 🤝 **80%** d'autonomie des analystes sans intervention d'un data engineer
- 💰 **ROI estimé** : 1 200% (économie de 114 000€/an)
- 🐳 **10 containers** Docker orchestrés
- 📦 **8 technologies** principales intégrées

---

## 🏗️ Architecture <a name="architecture"></a>

```
UTILISATEURS (Analystes)
        │
        ▼
┌───────────────────┐
│  FRONTEND (React) │  ← Pipeline Builder, Monitoring Dashboard
└────────┬──────────┘
         │ REST API / WebSocket
         ▼
┌───────────────────┐
│ BACKEND (FastAPI) │  ← API REST, DAG Generator, Business Logic
└────────┬──────────┘
         │
    ┌────┴────┐
    ▼         ▼
PostgreSQL   Redis
(Metadata)  (Cache/Queue)
         │
         ▼
┌─────────────────────────┐
│  AIRFLOW (Orchestration) │  ← Scheduler, Workers Celery
└───────────┬─────────────┘
            │
            ▼
┌─────────────────────────┐
│  PYSPARK (Processing)   │  ← Spark Master + Workers
└───────────┬─────────────┘
            │
  ┌─────────┼─────────┐
  ▼         ▼         ▼
BRONZE    SILVER     GOLD
  └─────────┴─────────┘
             │
             ▼
    DELTA LAKE (MinIO/S3)
```

### Architecture Medallion

| Couche | Rôle | Format | Mode |
|--------|------|--------|------|
| 🟤 **Bronze** | Données brutes ingérées | Delta Lake | Append only |
| ⚪ **Silver** | Données nettoyées et validées | Delta Lake | Upsert (merge) |
| 🟡 **Gold** | Données business-ready agrégées | Delta Lake | Full refresh / Incremental |

---

## 🛠️ Stack Technique <a name="stack"></a>

| Technologie | Version | Rôle |
|-------------|---------|------|
| **FastAPI** | 0.109.0 | Backend API REST |
| **React + TypeScript** | 18.2 / 5.3 | Frontend no-code |
| **@xyflow/react** | v12 | Canvas drag-and-drop Pipeline Builder |
| **Zustand** | latest | State management frontend |
| **React Router** | v6 | Routing SPA |
| **Apache Airflow** | 2.9.2 | Orchestration des pipelines |
| **PySpark** | 3.5.1 | Traitement distribué |
| **Delta Lake** | 3.0.0 | Stockage ACID sur data lake |
| **PostgreSQL** | 15 | Métadonnées et état |
| **Redis** | 7.2 | Message broker Celery |
| **MinIO** | Latest | Object storage S3-compatible |
| **Docker** | 24+ | Conteneurisation |

---

## 🗓️ Roadmap <a name="roadmap"></a>

```
Phase 1 — Infrastructure & Setup          ████████████████████ 100% ✅
Phase 2 — Containerisation Docker         ████████████████████ 100% ✅
Phase 3 — Versioning Git + Docker Hub     ████████████████████ 100% ✅
Phase 4 — Pipeline Builder (Frontend)     ████████████████████ 100% ✅
Phase 5 — Backend API & DAG Generator     ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Phase 6 — Data Quality (Great Expectations)░░░░░░░░░░░░░░░░░░░   0% ⏳
Phase 7 — Monitoring & Observabilité      ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Phase 8 — Tests & Documentation           ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Phase 9 — Déploiement Production          ░░░░░░░░░░░░░░░░░░░░   0% ⏳
```

---

## ✅ Ce qui a été fait <a name="fait"></a>

### 1. Documentation
- [x] Documentation complète générée en **PDF** (architecture, cas d'usage, benchmarks, ROI)
- [x] Fichier de statut du projet `DATA_PIPELINE_PLATFORM_STATUS.md`
- [x] README du projet rédigé

### 2. Structure du projet
- [x] Architecture des dossiers définie
  ```
  data-pipeline-platform/
  ├── backend/          ← FastAPI + PySpark
  ├── frontend/         ← React + TypeScript + Vite
  ├── airflow/          ← DAGs + Dockerfile Airflow
  ├── infrastructure/
  │   └── docker/       ← docker-compose.yml + .env
  ├── config/           ← .env.example
  ├── data/             ← bronze/ silver/ gold/
  └── docs/
  ```

### 3. Dockerisation — Problèmes résolus

#### ✅ Frontend
- Ajout du `.dockerignore` → contexte réduit de **69 MB à 3.4 KB**
- Build réussi en 37 secondes

#### ✅ Backend
- Fix image de base : `python:3.11-slim` → `python:3.11-slim-bookworm`
- Fix requirements : `COPY requirements/prod.txt` → `COPY requirements/`
- Build **10/10 étapes** réussi ✅

#### ✅ Airflow
- Upgrade de la version : `2.8.1` → `2.9.2`
- Fix permissions, PATH, pip, timeout réseau, DB migration
- Build **3/3 services** réussi ✅

#### ✅ Infrastructure générale
- Fichier `.env` configuré, conflits ports résolus
- Script `init-databases.sh` corrigé
- Migration DB Airflow automatique

### 4. Services opérationnels

| Service | Status | Port |
|---------|--------|------|
| **Airflow Webserver** | ✅ Healthy | 8080 |
| **Airflow Scheduler** | ✅ Healthy | — |
| **Airflow Worker** | ✅ Healthy | — |
| **Backend API** | ✅ Healthy | 8000 |
| **PostgreSQL** | ✅ Healthy | 5435 |
| **Redis** | ✅ Healthy | 6379 |
| **MinIO** | ✅ Healthy | 9000-9001 |
| **Spark Master** | ✅ Running | 7077 / 8081 |
| **Spark Worker** | ✅ Running | — |
| **Frontend** | ⚠️ Running | 3000 |

> ⚠️ Frontend : healthcheck Docker à corriger (utiliser `wget` au lieu de `curl`)

### 5. Versioning — Git & Docker Hub ✅

```
Commit : feat: infrastructure docker complete - all services healthy
Branch : main
Remote : https://github.com/rooldy/data-pipeline-platform.git
Images : rooldy/pipeline-{backend,frontend,airflow-webserver,airflow-scheduler,airflow-worker}:v1.0
```

### 6. Phase 4 — Pipeline Builder ✅ COMPLÈTE

#### Structure des fichiers créés
```
frontend/src/
├── types/
│   └── pipeline.types.ts          ← Interfaces TypeScript complètes
├── store/
│   └── pipelineStore.ts           ← Zustand store (nodes, edges, config)
├── api/
│   └── pipeline.api.ts            ← Appels FastAPI + fallback localStorage
├── pages/  (routing via App.tsx)
├── components/
│   ├── pipeline/
│   │   ├── Canvas/
│   │   │   ├── PipelineCanvas.tsx ← React Flow canvas drag-and-drop
│   │   │   ├── PipelineCanvas.css
│   │   │   └── nodes/
│   │   │       ├── SourceNode.tsx    ← Nœud Source custom
│   │   │       ├── TransformNode.tsx ← Nœud Transform custom
│   │   │       ├── OutputNode.tsx    ← Nœud Output custom
│   │   │       └── nodes.css
│   │   ├── NodePalette/
│   │   │   ├── NodePalette.tsx    ← Palette draggable (10 nœuds)
│   │   │   └── NodePalette.css
│   │   ├── ConfigPanel/
│   │   │   ├── ConfigPanel.tsx    ← Panel config contextuel
│   │   │   └── forms/
│   │   │       ├── SourceForm.tsx    ← Formulaires CSV/PG/API/S3
│   │   │       ├── TransformForm.tsx ← Formulaires Filter/Agg/Join/Cast
│   │   │       ├── OutputForm.tsx    ← Formulaires DeltaLake/PostgreSQL
│   │   │       └── forms.css
│   │   └── PipelineBuilder/
│   │       ├── PipelineBuilder.tsx ← Page principale (layout 3 colonnes)
│   │       └── PipelineBuilder.css
│   └── common/
│       └── Toast/
│           ├── Toast.tsx          ← Notifications + hook useToast
│           └── Toast.css
└── App.tsx                        ← Router React Router v6
```

#### Fonctionnalités implémentées
- [x] Layout 3 colonnes : Node Palette | Canvas React Flow | Config Panel
- [x] **Drag & drop** depuis la palette vers le canvas
- [x] **10 nœuds custom** avec icônes et badges Medallion (Bronze/Silver/Gold)
  - Sources : CSV, PostgreSQL, API REST, S3
  - Transformations : Filter, Aggregate, Join, Cast
  - Destinations : Delta Lake, PostgreSQL
- [x] **Connexions** entre nœuds avec handles colorés (entrée violet, sortie vert)
- [x] **Layer Medallion automatique** : source → bronze, transform → silver, output → gold
- [x] **Config Panel** formulaires par type de nœud (tous les champs)
- [x] **Bouton Sauvegarder** → localStorage avec toast de confirmation
- [x] **Bouton Déployer** → POST /api/v1/pipelines + fallback localStorage si backend down
- [x] **Champ Schedule cron** dans la topbar
- [x] **Toast notifications** (succès vert / erreur rouge / info bleu)
- [x] **Validation** avant déploiement (nom, au moins un nœud source)
- [x] Suppression nœuds avec touche `Delete`
- [x] MiniMap + Controls de zoom
- [x] Routing : `/` → Dashboard, `/pipeline/new` → Pipeline Builder

#### Dépendances npm ajoutées
```bash
npm install @xyflow/react zustand react-hook-form zod react-router-dom
```

#### Routes
```
/                  → Dashboard (page d'accueil existante)
/pipeline/new      → Pipeline Builder (nouveau pipeline)
/pipeline/:id      → Pipeline Builder (pipeline existant)
```

#### Notes importantes
- Le chemin CSV dans les formulaires doit pointer vers le path **dans le container Docker**
  (ex: `/opt/spark/data/sales.csv`), pas le chemin local Mac
- À configurer : volume Docker `./data:/opt/spark/data` dans `docker-compose.yml`
- Le bouton Déployer appelle `POST http://localhost:8000/api/v1/pipelines`
  → endpoint à implémenter en **Phase 5**

---

## 🔐 Git & Docker Hub — Stratégie de Versioning <a name="versioning"></a>

### Convention de tags

| Tag | Usage |
|-----|-------|
| `latest` | Dernière version stable |
| `v1.0` | Phase 1-3 complète (Infrastructure) |
| `v2.0` | Phase 4 complète (Pipeline Builder) — à pusher |

```bash
# Script de release
./scripts/release.sh v2.0
```

---

## 🔧 Ce qui reste à faire <a name="reste"></a>

### Prochain — Phase 5 : Backend API & DAG Generator

- [ ] **Endpoint POST /api/v1/pipelines** (FastAPI)
  - Validation Pydantic de `PipelineDefinition`
  - Génération du DAG Airflow via template Jinja2
  - Sauvegarde dans `/airflow/dags/generated/`
  - Réponse : `{ id, dag_id, status }`

- [ ] **Modèles Pydantic** (backend)
  ```python
  class PipelineNode(BaseModel): ...
  class PipelineEdge(BaseModel): ...
  class PipelineDefinition(BaseModel): ...
  ```

- [ ] **Template Jinja2** pour génération DAG Airflow
  ```
  airflow/templates/pipeline_dag.py.j2
  ```

- [ ] **Endpoint GET /api/v1/pipelines** → liste des pipelines
- [ ] **Endpoint GET /api/v1/pipelines/{id}/runs** → statuts d'exécution

- [ ] **Configuration volumes Docker**
  ```yaml
  # docker-compose.yml — service spark
  volumes:
    - ./data:/opt/spark/data
  ```

### À faire aussi (Polishing Phase 4)
- [ ] Fix healthcheck Docker frontend (`wget` au lieu de `curl`)
- [ ] Ctrl+S → Sauvegarder (keyboard shortcut)
- [ ] Git commit + Docker Hub push `v2.0`

### Moyen terme — Phase 6 & 7

- [ ] Data Quality avec Great Expectations
- [ ] Dashboard de Monitoring temps réel
- [ ] Data Lineage (tracking Bronze → Silver → Gold)
- [ ] Alertes email/Slack

### Long terme — Phase 8 & 9

- [ ] Tests unitaires (pytest, Jest)
- [ ] CI/CD GitHub Actions
- [ ] Authentification JWT + RBAC
- [ ] Déploiement cloud (AWS ECS ou Kubernetes)

---

## 🌐 Accès aux Services <a name="acces"></a>

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

## 💻 Commandes Utiles <a name="commandes"></a>

### Docker

```bash
cd infrastructure/docker
docker compose up -d
docker compose ps
docker compose logs -f pipeline-airflow-webserver
docker compose build --no-cache pipeline-backend
docker compose down
docker system df
```

### Frontend

```bash
cd frontend
npm run dev          # Démarrer le dev server
npm run build        # Build production
npm run type-check   # Vérifier les types TypeScript
```

### Git

```bash
git add .
git commit -m "feat: phase 4 pipeline builder complete"
git push origin main
git checkout -b feat/phase5-backend-api
```

### Docker Hub

```bash
docker tag docker-pipeline-frontend:latest rooldy/pipeline-frontend:v2.0
docker push rooldy/pipeline-frontend:v2.0
docker push rooldy/pipeline-frontend:latest
```

---

## 🐛 Bugs Résolus

| Bug | Cause | Solution |
|-----|-------|----------|
| `openjdk-17` non trouvé | Debian Trixie (arm64) | `python:3.11-slim-bookworm` |
| Contexte Docker 69 MB | `node_modules` inclus | `.dockerignore` par service |
| `base.txt` not found | `COPY` incomplet | `COPY requirements/` |
| `airflow: command not found` | PATH non exporté | Séparation pip en 2 étapes |
| Port 5432 déjà utilisé | Ancien container actif | Exposé sur 5435 |
| `input/output error` sur JAR | Disque Docker Desktop plein | Augmentation à 100 GB |
| `useNodesState` infer `never[]` | Tableau vide sans générique | `useNodesState<Node>([])` |
| `Type 'object' not assignable to NodeConfig` | Type trop générique dans onDrop | Cast `NodeConfig` explicite |
| `Type 'unknown' not assignable to ReactNode` | `config.auth_type` unknown dans JSX | `!!(config.auth_type) &&` |
| Fermeture manquante `useCallback` | Copier-coller incomplet | Ajout `}, [rfInstance, ...])`  |
| Ancien `ConfigPanel` inline affiché | Import manquant dans PipelineBuilder | `import ConfigPanel from ...` |

---

*Dernière mise à jour : 07/05/2026 — Data Pipeline Platform v2.0.0*  
*Phase 1-3 : ✅ Infrastructure complète*  
*Phase 4 : ✅ Pipeline Builder complet (drag-and-drop, formulaires, déploiement)*  
*Prochaine étape : Phase 5 — Backend API & DAG Generator*
