# ============================================================================
# Airflow + Spark + Delta Lake pour Orchestration
# ============================================================================

FROM apache/airflow:2.8.1-python3.11

LABEL maintainer="Rooldy Alphonse" \
      description="Airflow with Spark for Pipeline Orchestration" \
      project="data-pipeline-platform" \
      spark.version="3.5.1" \
      delta.version="3.0.0"

USER root

# ============================================================================
# INSTALLATION JAVA + OUTILS
# ============================================================================

RUN apt-get update && apt-get install -y \
    openjdk-17-jdk-headless \
    wget \
    curl \
    procps \
    && rm -rf /var/lib/apt/lists/*

# Java Path
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

# Téléchargement et installation Spark
RUN wget -q https://archive.apache.org/dist/spark/spark-${SPARK_VERSION}/spark-${SPARK_VERSION}-bin-hadoop3.tgz \
    && tar -xzf spark-${SPARK_VERSION}-bin-hadoop3.tgz \
    && mv spark-${SPARK_VERSION}-bin-hadoop3 ${SPARK_HOME} \
    && rm spark-${SPARK_VERSION}-bin-hadoop3.tgz \
    && chown -R airflow:0 ${SPARK_HOME}

# ============================================================================
# PRÉ-TÉLÉCHARGEMENT DRIVERS (PostgreSQL + Delta Lake)
# ============================================================================

USER airflow

RUN mkdir -p /home/airflow/.ivy2

RUN ${SPARK_HOME}/bin/spark-submit \
    --packages org.postgresql:postgresql:42.7.1,io.delta:delta-spark_2.12:3.0.0 \
    --conf spark.jars.ivy=/home/airflow/.ivy2 \
    --version > /dev/null 2>&1 || true

RUN echo "✅ Vérification drivers..." && \
    find /home/airflow/.ivy2 -name "*.jar" -ls || echo "⚠️ JARs non trouvés"

# ============================================================================
# PYTHON DEPENDENCIES
# ============================================================================

COPY --chown=airflow:airflow requirements.txt /tmp/requirements.txt
RUN pip install --no-cache-dir -r /tmp/requirements.txt

# ============================================================================
# CRÉATION RÉPERTOIRES
# ============================================================================

RUN mkdir -p /opt/airflow/dags \
             /opt/airflow/dags/generated \
             /opt/airflow/logs \
             /opt/airflow/plugins \
             /opt/airflow/config \
             /data/bronze \
             /data/silver \
             /data/gold \
             /data/checkpoints

# ============================================================================
# HEALTHCHECK
# ============================================================================

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

WORKDIR /opt/airflow