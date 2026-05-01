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
6. [Ce qui reste à faire](#reste)
7. [Accès aux Services](#acces)
8. [Commandes Utiles](#commandes)

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
- 🐳 **11 containers** Docker orchestrés
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
Phase 2 — Containerisation Docker         █████████████████░░░  85% 🔄
Phase 3 — Pipeline Builder (Frontend)     ████████░░░░░░░░░░░░  40% 🔄
Phase 4 — Backend API & DAG Generator     ██████████░░░░░░░░░░  50% 🔄
Phase 5 — Data Quality (Great Expectations)███░░░░░░░░░░░░░░░░  15% ⏳
Phase 6 — Monitoring & Observabilité      ███░░░░░░░░░░░░░░░░░  15% ⏳
Phase 7 — Tests & Documentation           █░░░░░░░░░░░░░░░░░░░   5% ⏳
Phase 8 — Déploiement Production          ░░░░░░░░░░░░░░░░░░░░   0% ⏳
```

---

## ✅ Ce qui a été fait <a name="fait"></a>

### 1. Documentation
- [x] Documentation complète générée en **PDF** (architecture, cas d'usage, benchmarks, ROI)
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
  *(Debian Trixie ne contient pas `openjdk-17` sur arm64)*
- Fix requirements : `COPY requirements/prod.txt` → `COPY requirements/` (dossier entier)  
  *(prod.txt référence `-r base.txt` non copié)*
- Build **10/10 étapes** réussi ✅

#### ✅ Airflow
- Upgrade de la version : `2.8.1` → `2.9.2`  
  *(2.8.1 nécessite `apache-airflow-providers-fab` incompatible avec ses propres contraintes)*
- Fix permissions : ajout de `USER root` + `chown` avant création des dossiers `/data`
- Fix PATH : `ENV PATH="/home/airflow/.local/bin:${PATH}"`
- Séparation des installations pip :
  - Packages Airflow natifs (sans toucher aux providers)
  - Packages externes (`pyspark`, `delta-spark`, `pandas`, etc.) séparément
- Fix timeout réseau : `--timeout 300 --retries 5` pour PySpark (317 MB)
- Build **3/3 services** réussi ✅ (webserver, worker, scheduler)

#### ✅ Infrastructure générale
- Fichier `.env` configuré depuis `config/.env.example`
- Conflit port 5432 résolu → PostgreSQL exposé sur le port `5435`
- Espace disque Docker Desktop augmenté (100 GB+)
- Cache build nettoyé (`docker builder prune`)

### 4. Services opérationnels

| Service | Status | Port |
|---------|--------|------|
| **Backend API** | ✅ Healthy | 8000 |
| **Frontend** | ✅ Running | 3000 |
| **PostgreSQL** | ✅ Healthy | 5435 |
| **Redis** | ✅ Healthy | 6379 |
| **MinIO** | ✅ Healthy | 9000-9001 |
| **Spark Master** | ✅ Running | 7077 / 8081 |
| **Spark Worker** | ✅ Running | — |
| **Airflow Scheduler** | 🔄 Starting | 8080 |
| **Airflow Webserver** | 🔄 Starting | 8080 |
| **Airflow Worker** | ⏳ En attente webserver | — |

---

## 🔧 Ce qui reste à faire <a name="reste"></a>

### Immédiat — Finaliser la containerisation

- [ ] **Vérifier Airflow webserver** après migration DB 2.8.1 → 2.9.2
  ```bash
  sleep 60 && docker compose ps
  docker compose logs pipeline-airflow-webserver --tail=20
  ```
- [ ] Si encore unhealthy → forcer la migration :
  ```bash
  docker compose exec pipeline-airflow-scheduler airflow db upgrade
  ```
- [ ] Corriger le healthcheck du **frontend** (Vite fonctionne mais statut `unhealthy`)
- [ ] Valider les 11 containers en `healthy` simultanément

### Court terme — Fonctionnalités Core

- [ ] **Pipeline Builder** (Frontend)
  - Interface drag-and-drop avec React Flow
  - Nœuds Source (CSV, PostgreSQL, API REST, S3)
  - Nœuds Transformation (Filter, Aggregate, Join, Cast)
  - Nœuds Destination (Delta Lake, PostgreSQL)
  - Panneau de configuration par nœud

- [ ] **DAG Generator** (Backend)
  - Endpoint `POST /api/v1/pipelines` → génération du DAG Airflow via Jinja2
  - Validation de la configuration (Pydantic)
  - Sauvegarde dans `/airflow/dags/generated/`

- [ ] **Connexion Airflow ↔ Backend**
  - Polling des statuts de DAGs via Airflow REST API
  - Endpoint `GET /api/v1/pipelines/{id}/runs`

### Moyen terme — Qualité & Monitoring

- [ ] **Data Quality avec Great Expectations**
  - Intégration dans les pipelines Silver
  - Règles : not_null, regex, range, in_set
  - Stockage des résultats en PostgreSQL

- [ ] **Dashboard de Monitoring**
  - Métriques temps réel (taux de succès, durée, lignes traitées)
  - Logs centralisés par pipeline
  - Alertes email/Slack

- [ ] **Data Lineage**
  - Tracking automatique Bronze → Silver → Gold
  - Visualisation graphique dans le frontend

### Long terme — Production Ready

- [ ] Tests unitaires et d'intégration (pytest, Jest)
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Authentification JWT (login / register)
- [ ] RBAC (rôles : admin, data engineer, analyste)
- [ ] Déploiement cloud (AWS ECS ou Kubernetes)
- [ ] Multi-tenancy
- [ ] Connecteur Snowflake / Databricks
- [ ] Streaming avec Kafka

---

## 🌐 Accès aux Services <a name="acces"></a>

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | — |
| **Backend API** | http://localhost:8000 | — |
| **Swagger Docs** | http://localhost:8000/docs | — |
| **Apache Airflow** | http://localhost:8080 | airflow / airflow |
| **MinIO Console** | http://localhost:9001 | minio / minio123 |
| **Spark UI** | http://localhost:8081 | — |
| **PostgreSQL** | localhost:5435 | airflow / airflow_local_dev |

---

## 💻 Commandes Utiles <a name="commandes"></a>

```bash
# Démarrer tous les services
cd infrastructure/docker
docker compose up -d

# Voir l'état de tous les containers
docker compose ps

# Voir les logs d'un service
docker compose logs -f pipeline-airflow-webserver

# Rebuilder un service spécifique
docker compose build --no-cache pipeline-backend

# Stopper tout
docker compose down

# Stopper et supprimer les volumes (⚠️ perd les données)
docker compose down -v

# Nettoyer l'espace Docker
docker builder prune -f
docker image prune -f
docker container prune -f

# Vérifier l'espace utilisé
docker system df

# Accéder au shell d'un container
docker compose exec pipeline-backend bash
docker compose exec pipeline-airflow-scheduler bash

# Forcer migration DB Airflow
docker compose exec pipeline-airflow-scheduler airflow db upgrade

# Voir les DAGs Airflow
docker compose exec pipeline-airflow-scheduler airflow dags list
```

---

## 🐛 Bugs Connus & Solutions Appliquées

| Bug | Cause | Solution |
|-----|-------|----------|
| `openjdk-17` non trouvé | Debian Trixie (arm64) | `python:3.11-slim-bookworm` |
| Contexte Docker 69 MB | `node_modules` inclus | `.dockerignore` par service |
| `base.txt` not found | `COPY` incomplet du dossier requirements | `COPY requirements/` (dossier entier) |
| `airflow: command not found` | PATH non exporté + pip corrompu | Séparation pip en 2 étapes |
| `providers.fab` not found | Version incompatible avec contraintes 2.8.1 | Upgrade vers Airflow 2.9.2 |
| Port 5432 déjà utilisé | Ancien container Docker actif | Exposé sur 5435 |
| `input/output error` sur JAR | Disque Docker Desktop plein | Augmentation à 100 GB |
| Timeout pip PySpark | PySpark = 317 MB, réseau instable | `--timeout 300 --retries 5` |
| DB needs upgrade | Migration 2.8.1 → 2.9.2 | `airflow db upgrade` |

---

*Document généré le 01/05/2026 — Data Pipeline Platform v0.1.0-dev*
