# ============================================================================
# Airflow + Spark + Delta Lake pour Orchestration
# ============================================================================

FROM apache/airflow:2.9.2-python3.11

LABEL maintainer="Rooldy Alphonse" \
      description="Airflow with Spark for Pipeline Orchestration" \
      project="data-pipeline-platform"

USER root

RUN apt-get update && apt-get install -y \
    openjdk-17-jdk-headless \
    wget curl procps \
    && rm -rf /var/lib/apt/lists/*

ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-arm64
ENV SPARK_VERSION=3.5.1
ENV SPARK_HOME=/opt/spark
ENV PATH=$JAVA_HOME/bin:$PATH:$SPARK_HOME/bin:$SPARK_HOME/sbin
ENV PYSPARK_PYTHON=python3

RUN wget -q https://archive.apache.org/dist/spark/spark-${SPARK_VERSION}/spark-${SPARK_VERSION}-bin-hadoop3.tgz \
    && tar -xzf spark-${SPARK_VERSION}-bin-hadoop3.tgz \
    && mv spark-${SPARK_VERSION}-bin-hadoop3 ${SPARK_HOME} \
    && rm spark-${SPARK_VERSION}-bin-hadoop3.tgz \
    && chown -R airflow:0 ${SPARK_HOME}

# JARs S3A pour MinIO
RUN wget -q https://repo1.maven.org/maven2/org/apache/hadoop/hadoop-aws/3.3.4/hadoop-aws-3.3.4.jar \
    -P ${SPARK_HOME}/jars/ && \
    wget -q https://repo1.maven.org/maven2/com/amazonaws/aws-java-sdk-bundle/1.12.262/aws-java-sdk-bundle-1.12.262.jar \
    -P ${SPARK_HOME}/jars/

RUN mkdir -p /data/bronze /data/silver /data/gold /data/checkpoints \
    && chown -R airflow:root /data \
    && chmod -R 775 /data

USER airflow
ENV PATH="/home/airflow/.local/bin:${PATH}"

# Uniquement les packages NON-Airflow
RUN pip install --no-cache-dir \
    --timeout 300 \
    --retries 5 \
    pyspark==3.5.1 \
    delta-spark==3.0.0 \
    pandas==2.1.4 \
    pyarrow==14.0.2 \
    psycopg2-binary==2.9.9 \
    python-dotenv==1.0.0 \
    loguru==0.7.2
RUN pip install --no-cache-dir --no-deps apache-airflow-providers-fab==1.0.4

RUN mkdir -p /home/airflow/.ivy2

RUN ${SPARK_HOME}/bin/spark-submit \
    --packages org.postgresql:postgresql:42.7.1,io.delta:delta-spark_2.12:3.0.0 \
    --conf spark.jars.ivy=/home/airflow/.ivy2 \
    --version > /dev/null 2>&1 || true

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD curl -f http://localhost:8080/health || exit 1

WORKDIR /opt/airflow
