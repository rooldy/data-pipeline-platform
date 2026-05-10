"""
PySpark Task Functions — Data Pipeline Platform
Fonctions réutilisables par tous les DAGs générés
"""
import os
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# ─── Configuration ────────────────────────────────────────────────────────────

MINIO_ENDPOINT   = os.getenv("MINIO_ENDPOINT",   "pipeline-minio:9000")
MINIO_ACCESS_KEY = os.getenv("MINIO_ACCESS_KEY", "minio")
MINIO_SECRET_KEY = os.getenv("MINIO_SECRET_KEY", "minio123")

POSTGRES_HOST = os.getenv("POSTGRES_HOST", "pipeline-postgres")
POSTGRES_PORT = os.getenv("POSTGRES_PORT", "5432")
POSTGRES_USER = os.getenv("POSTGRES_USER", "airflow")
POSTGRES_PASS = os.getenv("POSTGRES_PASSWORD", "airflow")


# ─── SparkSession ─────────────────────────────────────────────────────────────

def get_spark_session(app_name: str = "DataPipelinePlatform"):
    """Crée une SparkSession avec Delta Lake + MinIO (S3A)"""
    from pyspark.sql import SparkSession
    from delta import configure_spark_with_delta_pip

    builder = (
        SparkSession.builder
        .appName(app_name)
        .master("local[*]")

        # ── Delta Lake ──
        .config("spark.sql.extensions", "io.delta.sql.DeltaSparkSessionExtension")
        .config("spark.sql.catalog.spark_catalog", "org.apache.spark.sql.delta.catalog.DeltaCatalog")

        # ── MinIO / S3A ──
        .config("spark.hadoop.fs.s3a.endpoint",          f"http://{MINIO_ENDPOINT}")
        .config("spark.hadoop.fs.s3a.access.key",         MINIO_ACCESS_KEY)
        .config("spark.hadoop.fs.s3a.secret.key",         MINIO_SECRET_KEY)
        .config("spark.hadoop.fs.s3a.path.style.access",  "true")
        .config("spark.hadoop.fs.s3a.impl",               "org.apache.hadoop.fs.s3a.S3AFileSystem")
        .config("spark.hadoop.fs.s3a.connection.ssl.enabled", "false")

        # ── Performance ──
        .config("spark.sql.adaptive.enabled", "true")
        .config("spark.driver.memory", "1g")
        .config("spark.executor.memory", "1g")
    )

    spark = configure_spark_with_delta_pip(builder).getOrCreate()
    spark.sparkContext.setLogLevel("WARN")
    logger.info(f"✅ SparkSession créée : {app_name}")
    return spark


# ─── Sources ──────────────────────────────────────────────────────────────────

def read_csv(spark, config: dict):
    """Lit un fichier CSV et retourne un DataFrame"""
    path       = config.get("path", "")
    delimiter  = config.get("delimiter", ",")
    has_header = config.get("has_header", True)

    logger.info(f"📄 Lecture CSV : {path}")
    df = (
        spark.read
        .option("header", str(has_header).lower())
        .option("delimiter", delimiter)
        .option("inferSchema", "true")
        .csv(path)
    )
    logger.info(f"✅ CSV chargé : {df.count()} lignes, {len(df.columns)} colonnes")
    return df


def read_postgresql(spark, config: dict):
    """Lit une table PostgreSQL et retourne un DataFrame"""
    host     = config.get("host", POSTGRES_HOST)
    port     = config.get("port", 5432)
    database = config.get("database", "")
    schema   = config.get("schema", "public")
    table    = config.get("table", "")
    query    = config.get("query", "")

    url = f"jdbc:postgresql://{host}:{port}/{database}"
    dbtable = f"({query}) AS q" if query else f"{schema}.{table}"

    logger.info(f"🐘 Lecture PostgreSQL : {url} → {dbtable}")
    df = (
        spark.read
        .format("jdbc")
        .option("url", url)
        .option("dbtable", dbtable)
        .option("user", POSTGRES_USER)
        .option("password", POSTGRES_PASS)
        .option("driver", "org.postgresql.Driver")
        .load()
    )
    logger.info(f"✅ PostgreSQL chargé : {df.count()} lignes")
    return df


# ─── Transformations ──────────────────────────────────────────────────────────

def apply_filter(df, config: dict):
    """Applique un filtre sur le DataFrame"""
    from pyspark.sql import functions as F

    column   = config.get("column", "")
    operator = config.get("operator", "==")
    value    = config.get("value", "")

    logger.info(f"🔽 Filter : {column} {operator} {value}")

    col = F.col(column)

    op_map = {
        "==":          col == value,
        "!=":          col != value,
        ">":           col > float(value),
        ">=":          col >= float(value),
        "<":           col < float(value),
        "<=":          col <= float(value),
        "is_null":     col.isNull(),
        "is_not_null": col.isNotNull(),
        "in":          col.isin(value.split(",")) if isinstance(value, str) else col.isin(value),
    }

    condition = op_map.get(operator)
    if condition is None:
        logger.warning(f"Opérateur inconnu : {operator}")
        return df

    filtered = df.filter(condition)
    logger.info(f"✅ Filter appliqué : {filtered.count()} lignes restantes")
    return filtered


def apply_aggregate(df, config: dict):
    """Applique un groupBy + agrégations sur le DataFrame"""
    from pyspark.sql import functions as F

    group_by     = config.get("group_by", [])
    aggregations = config.get("aggregations", [])

    logger.info(f"∑ Aggregate : group by {group_by}")

    fn_map = {
        "sum":           F.sum,
        "avg":           F.avg,
        "count":         F.count,
        "min":           F.min,
        "max":           F.max,
        "count_distinct": F.countDistinct,
    }

    agg_exprs = []
    for agg in aggregations:
        fn = fn_map.get(agg.get("function", "count"))
        if fn:
            expr = fn(agg["column"]).alias(agg.get("alias", agg["column"]))
            agg_exprs.append(expr)

    if not agg_exprs:
        logger.warning("Aucune agrégation définie")
        return df

    result = df.groupBy(*group_by).agg(*agg_exprs)
    logger.info(f"✅ Aggregate : {result.count()} groupes")
    return result


def apply_join(df_left, df_right, config: dict):
    """Joint deux DataFrames"""
    join_type = config.get("join_type", "inner")
    left_key  = config.get("left_key", "")
    right_key = config.get("right_key", "")

    logger.info(f"⋈ Join : {join_type} sur {left_key} = {right_key}")

    if left_key == right_key:
        result = df_left.join(df_right, on=left_key, how=join_type)
    else:
        result = df_left.join(
            df_right,
            df_left[left_key] == df_right[right_key],
            how=join_type
        )

    logger.info(f"✅ Join : {result.count()} lignes")
    return result


def apply_cast(df, config: dict):
    """Caste les colonnes vers les types cibles"""
    columns = config.get("columns", [])

    type_map = {
        "string":    "string",
        "integer":   "integer",
        "float":     "double",
        "boolean":   "boolean",
        "date":      "date",
        "timestamp": "timestamp",
    }

    logger.info(f"🔄 Cast : {len(columns)} colonnes")
    for col_def in columns:
        name        = col_def.get("name", "")
        target_type = type_map.get(col_def.get("target_type", "string"), "string")
        df = df.withColumn(name, df[name].cast(target_type))
        logger.info(f"  → {name} : {target_type}")

    return df


# ─── Destinations ─────────────────────────────────────────────────────────────

def write_delta_lake(df, config: dict):
    """Écrit le DataFrame dans une table Delta Lake (MinIO)"""
    path       = config.get("path", "")
    table_name = config.get("table_name", "")
    mode       = config.get("mode", "append")
    merge_key  = config.get("merge_key", None)

    logger.info(f"△ Écriture Delta Lake : {table_name} → {path} (mode: {mode})")

    if mode == "merge" and merge_key:
        from delta.tables import DeltaTable
        from pyspark.sql import functions as F

        if DeltaTable.isDeltaTable(df.sparkSession, path):
            delta_table = DeltaTable.forPath(df.sparkSession, path)
            delta_table.alias("target").merge(
                df.alias("source"),
                f"target.{merge_key} = source.{merge_key}"
            ).whenMatchedUpdateAll().whenNotMatchedInsertAll().execute()
        else:
            df.write.format("delta").mode("overwrite").save(path)
    else:
        df.write.format("delta").mode(mode).save(path)

    logger.info(f"✅ Delta Lake écrit : {df.count()} lignes → {path}")


def write_postgresql(df, config: dict):
    """Écrit le DataFrame dans une table PostgreSQL"""
    host       = config.get("host", POSTGRES_HOST)
    port       = config.get("port", 5432)
    database   = config.get("database", "")
    schema     = config.get("schema", "public")
    table      = config.get("table", "")
    mode       = config.get("mode", "append")

    url = f"jdbc:postgresql://{host}:{port}/{database}"
    logger.info(f"🐘 Écriture PostgreSQL : {schema}.{table} (mode: {mode})")

    (
        df.write
        .format("jdbc")
        .option("url", url)
        .option("dbtable", f"{schema}.{table}")
        .option("user", POSTGRES_USER)
        .option("password", POSTGRES_PASS)
        .option("driver", "org.postgresql.Driver")
        .mode(mode)
        .save()
    )
    logger.info(f"✅ PostgreSQL écrit : {schema}.{table}")

# ─── Checkpoints inter-tâches ─────────────────────────────────────────────────

CHECKPOINT_DIR = "/data/checkpoints"

def write_checkpoint(df, dag_id: str, node_id: str) -> str:
    """Sauvegarde un DataFrame en Parquet entre deux tâches"""
    path = f"{CHECKPOINT_DIR}/{dag_id}/{node_id}"
    df.write.mode("overwrite").parquet(path)
    logger.info(f"💾 Checkpoint écrit : {path} ({df.count()} lignes)")
    return path

def read_checkpoint(spark, dag_id: str, node_id: str):
    """Lit un DataFrame depuis un checkpoint Parquet"""
    path = f"{CHECKPOINT_DIR}/{dag_id}/{node_id}"
    logger.info(f"📂 Checkpoint lu : {path}")
    return spark.read.parquet(path)