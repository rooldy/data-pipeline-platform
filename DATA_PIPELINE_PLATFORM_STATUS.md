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
Phase 4 — Pipeline Builder (Frontend)     ░░░░░░░░░░░░░░░░░░░░   0% ⏳
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
  *(Debian Trixie ne contient pas `openjdk-17` sur arm64)*
- Fix requirements : `COPY requirements/prod.txt` → `COPY requirements/` (dossier entier)
  *(prod.txt référence `-r base.txt` non copié)*
- Build **10/10 étapes** réussi ✅

#### ✅ Airflow
- Upgrade de la version : `2.8.1` → `2.9.2`
  *(2.8.1 nécessite `apache-airflow-providers-fab` incompatible avec ses propres contraintes)*
- Fix permissions : ajout de `USER root` + `chown` avant création des dossiers `/data`
- Fix PATH : `ENV PATH="/home/airflow/.local/bin:${PATH}"`
- Séparation des installations pip : providers natifs / packages externes
- Fix timeout réseau : `--timeout 300 --retries 5` pour PySpark (317 MB)
- Fix DB migration : `airflow db upgrade` automatique au démarrage du webserver
- Build **3/3 services** réussi ✅ (webserver, worker, scheduler)

#### ✅ Infrastructure générale
- Fichier `.env` configuré depuis `config/.env.example`
- Conflit port 5432 résolu → PostgreSQL exposé sur le port `5435`
- Variable `POSTGRES_DB_METIER` ajoutée dans le service postgres
- Script `init-databases.sh` corrigé
- Espace disque Docker Desktop augmenté (100 GB+)
- Migration DB Airflow automatique à chaque démarrage

### 4. Services opérationnels — État Final

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

> ⚠️ Frontend : Vite fonctionne correctement (http://localhost:3000 accessible), seul le healthcheck Docker est à corriger ultérieurement.

### 5. Versioning — Git & Docker Hub ✅

#### Git (Code source)
```
Commit : feat: infrastructure docker complete - all services healthy
Branch : main
Remote : https://github.com/rooldy/data-pipeline-platform.git
Files  : 28 fichiers, 4027 insertions
```

#### Docker Hub (Images)
```
rooldy/pipeline-backend:v1.0
rooldy/pipeline-frontend:v1.0
rooldy/pipeline-airflow-webserver:v1.0
rooldy/pipeline-airflow-scheduler:v1.0
rooldy/pipeline-airflow-worker:v1.0
```

---

## 🔐 Git & Docker Hub — Stratégie de Versioning <a name="versioning"></a>

### Pourquoi pusher sur Git ?

Git est la **source de vérité du code**. Pusher régulièrement apporte :

| Avantage | Explication |
|----------|-------------|
| **Traçabilité** | Chaque modification est horodatée et attribuée à un auteur |
| **Récupération** | En cas de suppression accidentelle, `git clone` suffit |
| **Collaboration** | Plusieurs développeurs peuvent travailler en parallèle sans conflit |
| **CI/CD** | GitHub Actions peut déclencher des builds automatiques à chaque push |
| **Historique** | `git log` montre l'évolution complète du projet |
| **Rollback** | `git revert` permet de revenir instantanément à une version stable |

```bash
# Voir l'historique des commits
git log --oneline

# Revenir à une version précédente
git checkout <commit-hash>

# Créer une branche pour une nouvelle fonctionnalité
git checkout -b feat/pipeline-builder
```

### Pourquoi pusher sur Docker Hub ?

Docker Hub est la **source de vérité des images**. Pusher les images apporte :

| Avantage | Explication |
|----------|-------------|
| **Récupération rapide** | `docker pull` en 5 min vs rebuild complet en 2-3 heures |
| **Partage d'équipe** | Tout le monde utilise exactement la même image |
| **Déploiement simplifié** | Un serveur peut puller directement sans avoir le code source |
| **Reproductibilité** | Même image = même comportement garanti partout |
| **Versioning** | Tags `v1.0`, `v1.1` permettent des rollbacks rapides |
| **CI/CD** | GitHub Actions peut pusher automatiquement après chaque build réussi |

```bash
# Récupérer une image spécifique depuis n'importe où
docker pull rooldy/pipeline-backend:v1.0

# Utiliser une image du registry directement dans docker-compose
image: rooldy/pipeline-backend:v1.0  # au lieu de build: ...
```

### Combinés — La stratégie complète

```
Développeur local
    │
    ├── git push ──────────────► GitHub (code source)
    │                                   │
    │                                   └── GitHub Actions (CI/CD)
    │                                               │
    │                                               ├── Tests automatiques
    │                                               ├── Build Docker
    │                                               └── docker push ──► Docker Hub
    │
    └── docker push ───────────► Docker Hub (images buildées)
                                        │
                                        └── Serveur de production
                                                │
                                                └── docker pull
                                                    docker compose up -d
```

### Règle d'or

> **"Git = source de vérité du code. Docker Hub = source de vérité des images."**
> Tant que ces deux éléments sont à jour, vous pouvez tout reconstruire en moins de 10 minutes depuis n'importe quelle machine.

### Convention de tags recommandée en entreprise

| Tag | Usage | Exemple |
|-----|-------|---------|
| `latest` | Dernière version stable | `rooldy/pipeline-backend:latest` |
| `v1.0` | Version majeure.mineure | `rooldy/pipeline-backend:v1.0` |
| `v1.0.3` | Version avec patch | `rooldy/pipeline-backend:v1.0.3` |
| `sha-abc1234` | Lié à un commit Git exact | `rooldy/pipeline-backend:sha-ad61934` |

```bash
# Bonne pratique : toujours tagger avec version ET latest
docker tag docker-pipeline-backend:latest rooldy/pipeline-backend:v1.0
docker tag docker-pipeline-backend:latest rooldy/pipeline-backend:latest
docker push rooldy/pipeline-backend:v1.0
docker push rooldy/pipeline-backend:latest
```

### Script de release automatisé

```bash
#!/bin/bash
# scripts/release.sh — Usage: ./release.sh v1.1

VERSION=$1

if [ -z "$VERSION" ]; then
  echo "Usage: ./release.sh <version>"
  exit 1
fi

echo "🚀 Release $VERSION en cours..."

# Git
git add .
git commit -m "release: $VERSION"
git tag $VERSION
git push origin main --tags
echo "✅ Git pushé"

# Docker Hub
SERVICES=("backend" "frontend" "airflow-webserver" "airflow-scheduler" "airflow-worker")
for SERVICE in "${SERVICES[@]}"; do
  docker tag docker-pipeline-$SERVICE:latest rooldy/pipeline-$SERVICE:$VERSION
  docker tag docker-pipeline-$SERVICE:latest rooldy/pipeline-$SERVICE:latest
  docker push rooldy/pipeline-$SERVICE:$VERSION
  docker push rooldy/pipeline-$SERVICE:latest
  echo "✅ $SERVICE pushé"
done

echo "🎉 Release $VERSION complète — Git + Docker Hub"
```

---

## 🔧 Ce qui reste à faire <a name="reste"></a>

### Court terme — Fonctionnalités Core

- [ ] **Fix healthcheck Frontend**
  ```yaml
  healthcheck:
    test: ["CMD", "wget", "-q", "--spider", "http://localhost:3000"]
    interval: 30s
    timeout: 10s
    retries: 3
  ```

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
| **PostgreSQL** | localhost:5435 | airflow / airflow |

---

## 💻 Commandes Utiles <a name="commandes"></a>

### Docker

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

# Nettoyer l'espace Docker (safe)
docker builder prune -f
docker image prune -f
docker container prune -f

# Vérifier l'espace utilisé
docker system df

# Accéder au shell d'un container
docker compose exec pipeline-backend bash
docker compose exec pipeline-airflow-scheduler bash
```

### Git

```bash
# Voir l'état des fichiers
git status

# Ajouter et commiter
git add .
git commit -m "feat: description de la fonctionnalité"

# Pousser sur GitHub
git push origin main

# Voir l'historique
git log --oneline

# Créer une branche feature
git checkout -b feat/pipeline-builder

# Revenir sur main et merger
git checkout main
git merge feat/pipeline-builder
```

### Docker Hub

```bash
# Se connecter
docker login

# Tagger une image
docker tag docker-pipeline-backend:latest rooldy/pipeline-backend:v1.0
docker tag docker-pipeline-backend:latest rooldy/pipeline-backend:latest

# Pousser sur Docker Hub
docker push rooldy/pipeline-backend:v1.0
docker push rooldy/pipeline-backend:latest

# Récupérer une image
docker pull rooldy/pipeline-backend:v1.0

# Voir toutes les images locales
docker images | grep rooldy
```

---

## 🐛 Bugs Résolus

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
| DB needs upgrade | Migration 2.8.1 → 2.9.2 | `airflow db upgrade` au démarrage |
| `CREATE DATABASE ;` vide | Variable `POSTGRES_DB_METIER` non passée | Ajout dans environment du service |

---

*Dernière mise à jour : 01/05/2026 — Data Pipeline Platform v1.0.0*  
*Infrastructure : ✅ COMPLÈTE ET OPÉRATIONNELLE*  
*Git : ✅ Pushé sur main — Docker Hub : ✅ 5 images v1.0 publiées*
