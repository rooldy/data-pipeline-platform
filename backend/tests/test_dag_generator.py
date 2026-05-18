"""
Tests du générateur de DAGs Jinja2
"""
import pytest
from pathlib import Path
from unittest.mock import patch, MagicMock
from app.models.pipeline import (
    PipelineDefinition, PipelineNode, PipelineEdge,
    NodeKind, MedallionLayer
)
from app.services.dag_generator import slugify, generate_dag


# ─── slugify ──────────────────────────────────────────────────────────────────

def test_slugify_basic():
    assert slugify("Mon Pipeline") == "mon_pipeline"


def test_slugify_special_chars():
    assert slugify("Pipeline #1 (test)") == "pipeline_1_test"


def test_slugify_accents():
    result = slugify("Données Ventes")
    assert " " not in result
    assert result.islower()


def test_slugify_already_valid():
    assert slugify("simple_pipeline") == "simple_pipeline"


def test_slugify_numbers():
    result = slugify("pipeline2024")
    assert "2024" in result


# ─── generate_dag ─────────────────────────────────────────────────────────────

def make_csv_node(node_id: str = "n1") -> PipelineNode:
    return PipelineNode(
        id=node_id, kind=NodeKind.source, subtype="csv",
        label="CSV", layer=MedallionLayer.bronze,
        config={"path": "/data/bronze/sales.csv", "delimiter": ",", "has_header": True},
        position={"x": 100, "y": 100},
    )


def make_delta_node(node_id: str = "n2") -> PipelineNode:
    return PipelineNode(
        id=node_id, kind=NodeKind.output, subtype="delta_lake",
        label="Delta Lake", layer=MedallionLayer.gold,
        config={"path": "/data/gold/sales", "table_name": "gold.sales", "mode": "append"},
        position={"x": 100, "y": 300},
    )


def make_quality_node(node_id: str = "q1") -> PipelineNode:
    return PipelineNode(
        id=node_id, kind=NodeKind.quality, subtype="data_quality",
        label="Data Quality", layer=MedallionLayer.silver,
        config={
            "rules": [
                {"id": "r1", "column": "order_id", "rule_type": "not_null", "threshold": 100},
                {"id": "r2", "column": "total_amount", "rule_type": "range",
                 "min_value": 0, "max_value": 10000, "threshold": 95},
            ],
            "fail_on_error": True,
        },
        position={"x": 100, "y": 200},
    )


def make_simple_pipeline() -> PipelineDefinition:
    return PipelineDefinition(
        name="test pipeline",
        nodes=[make_csv_node(), make_delta_node()],
        edges=[PipelineEdge(id="e1", source="n1", target="n2", layer=MedallionLayer.bronze)],
    )


@patch("app.services.dag_generator.DAGS_OUTPUT_DIR")
def test_generate_dag_creates_file(mock_dir, tmp_path):
    mock_dir.__truediv__ = lambda self, x: tmp_path / x
    mock_dir.mkdir = MagicMock()

    pipeline = make_simple_pipeline()

    with patch("app.services.dag_generator.DAGS_OUTPUT_DIR", tmp_path):
        dag_id, dag_path = generate_dag(pipeline)

    assert dag_id == "pipeline_test_pipeline"
    assert Path(dag_path).exists()


@patch("app.services.dag_generator.DAGS_OUTPUT_DIR")
def test_generate_dag_content_has_imports(mock_dir, tmp_path):
    with patch("app.services.dag_generator.DAGS_OUTPUT_DIR", tmp_path):
        dag_id, dag_path = generate_dag(make_simple_pipeline())

    content = Path(dag_path).read_text()
    assert "from airflow import DAG" in content
    assert "from airflow.operators.python import PythonOperator" in content
    assert "import json" in content


@patch("app.services.dag_generator.DAGS_OUTPUT_DIR")
def test_generate_dag_contains_node_functions(mock_dir, tmp_path):
    with patch("app.services.dag_generator.DAGS_OUTPUT_DIR", tmp_path):
        dag_id, dag_path = generate_dag(make_simple_pipeline())

    content = Path(dag_path).read_text()
    assert "def task_n1" in content
    assert "def task_n2" in content


@patch("app.services.dag_generator.DAGS_OUTPUT_DIR")
def test_generate_dag_no_raw_true(mock_dir, tmp_path):
    """Vérifie qu'il n'y a pas de 'true' JSON non wrappé dans le DAG Python"""
    with patch("app.services.dag_generator.DAGS_OUTPUT_DIR", tmp_path):
        dag_id, dag_path = generate_dag(make_simple_pipeline())

    content = Path(dag_path).read_text()
    # json.loads doit être utilisé pour les configs booléennes
    assert "json.loads(" in content


@patch("app.services.dag_generator.DAGS_OUTPUT_DIR")
def test_generate_dag_with_quality_node(mock_dir, tmp_path):
    pipeline = PipelineDefinition(
        name="quality pipeline",
        nodes=[make_csv_node(), make_quality_node(), make_delta_node()],
        edges=[
            PipelineEdge(id="e1", source="n1", target="q1", layer=MedallionLayer.bronze),
            PipelineEdge(id="e2", source="q1", target="n2", layer=MedallionLayer.silver),
        ],
    )
    with patch("app.services.dag_generator.DAGS_OUTPUT_DIR", tmp_path):
        dag_id, dag_path = generate_dag(pipeline)

    content = Path(dag_path).read_text()
    assert "run_quality_checks" in content
    assert "fail_on_error" in content


@patch("app.services.dag_generator.DAGS_OUTPUT_DIR")
def test_generate_dag_with_schedule(mock_dir, tmp_path):
    pipeline = make_simple_pipeline()
    pipeline.schedule = "0 6 * * *"

    with patch("app.services.dag_generator.DAGS_OUTPUT_DIR", tmp_path):
        dag_id, dag_path = generate_dag(pipeline)

    content = Path(dag_path).read_text()
    assert "0 6 * * *" in content


@patch("app.services.dag_generator.DAGS_OUTPUT_DIR")
def test_generate_dag_unique_id_per_name(mock_dir, tmp_path):
    p1 = PipelineDefinition(name="pipeline alpha", nodes=[], edges=[])
    p2 = PipelineDefinition(name="pipeline beta",  nodes=[], edges=[])

    with patch("app.services.dag_generator.DAGS_OUTPUT_DIR", tmp_path):
        id1, _ = generate_dag(p1)
        id2, _ = generate_dag(p2)

    assert id1 != id2