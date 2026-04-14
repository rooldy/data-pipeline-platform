# 🚀 Data Pipeline Platform - Medallion Architecture

**Plateforme self-service no-code pour créer des pipelines ETL avec architecture Bronze/Silver/Gold.**

## 🎯 Objectif

Permettre aux analystes data de créer et gérer des pipelines de données sans écrire de code.

## 🏗️ Architecture

- **Bronze Layer** : Ingestion de données brutes
- **Silver Layer** : Nettoyage et standardisation
- **Gold Layer** : Agrégations et KPIs business

## 🛠️ Stack Technique

- **Backend**: Python 3.11, FastAPI, PySpark, Apache Airflow
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Data**: Delta Lake, PostgreSQL, Redis
- **Infrastructure**: Docker, Kubernetes, Terraform

## 🚀 Quick Start

```bash
# Configuration
cp config/.env.example config/.env

# Démarrage
make start

# Initialisation
make init-db
make create-admin
```

## 📚 Documentation

Voir le dossier `docs/` pour la documentation complète.

## 👤 Auteur

Rooldy Alphonse - [@rooldy](https://github.com/rooldy)

## 📄 License

MIT License
