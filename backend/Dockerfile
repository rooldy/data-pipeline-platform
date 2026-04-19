# ============================================================================
# Backend FastAPI + PySpark + Delta Lake
# ============================================================================

FROM python:3.11-slim

LABEL maintainer="Rooldy Alphonse" \
      description="FastAPI Backend with PySpark for Medallion Architecture" \
      project="data-pipeline-platform"

USER root

# ============================================================================
# INSTALLATION JAVA + OUTILS SYSTÈME
# ============================================================================

RUN apt-get update && apt-get install -y \
    openjdk-17-jdk-headless \
    wget \
    curl \
    procps \
    git \
    && rm -rf /var/lib/apt/lists/*

# Java Path (adapté ARM64 pour Mac M1/M2/M3)
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-arm64
ENV PATH=$JAVA_HOME/bin:$PATH

# ============================================================================
# SPARK CONFIGURATION
# ============================================================================

ENV SPARK_VERSION=3.5.1
ENV SPARK_HOME=/opt/spark
ENV PATH=$PATH:$SPARK_HOME/bin:$SPARK_HOME/sbin
ENV PYSPARK_PYTHON=python3
ENV PYTHONPATH=/opt/spark/python:$PYTHONPATH

# Téléchargement et installation de Spark
RUN wget -q https://archive.apache.org/dist/spark/spark-${SPARK_VERSION}/spark-${SPARK_VERSION}-bin-hadoop3.tgz \
    && tar -xzf spark-${SPARK_VERSION}-bin-hadoop3.tgz \
    && mv spark-${SPARK_VERSION}-bin-hadoop3 ${SPARK_HOME} \
    && rm spark-${SPARK_VERSION}-bin-hadoop3.tgz

# ============================================================================
# PRÉ-TÉLÉCHARGEMENT DRIVERS
# ============================================================================

RUN mkdir -p /root/.ivy2

# PostgreSQL + Delta Lake JARs
RUN ${SPARK_HOME}/bin/spark-submit \
    --packages org.postgresql:postgresql:42.7.1,io.delta:delta-spark_2.12:3.0.0 \
    --conf spark.jars.ivy=/root/.ivy2 \
    --version > /dev/null 2>&1 || true

# ============================================================================
# PYTHON DEPENDENCIES
# ============================================================================

WORKDIR /app

# Copie des requirements
COPY requirements/prod.txt /tmp/requirements.txt

RUN pip install --no-cache-dir --upgrade pip \
    && pip install --no-cache-dir -r /tmp/requirements.txt

# ============================================================================
# APPLICATION CODE
# ============================================================================

COPY . /app

# ============================================================================
# CRÉATION RÉPERTOIRES DATA
# ============================================================================

RUN mkdir -p /data/bronze \
             /data/silver \
             /data/gold \
             /data/checkpoints \
             /app/logs

# ============================================================================
# HEALTHCHECK
# ============================================================================

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

# ============================================================================
# EXPOSITION PORT
# ============================================================================

EXPOSE 8000

# ============================================================================
# DÉMARRAGE
# ============================================================================

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]