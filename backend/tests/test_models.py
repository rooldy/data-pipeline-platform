"""
Tests des modèles Pydantic — PipelineDefinition, PipelineNode, etc.
"""
import pytest
from pydantic import ValidationError
from app.models.pipeline import (
    PipelineDefinition, PipelineNode, PipelineEdge,
    NodeKind, MedallionLayer
)


# ─── PipelineNode ─────────────────────────────────────────────────────────────

def test_pipeline_node_valid():
    node = PipelineNode(
        id="n1", kind=NodeKind.source, subtype="csv",
        label="CSV", layer=MedallionLayer.bronze,
        config={"path": "/data/test.csv"},
        position={"x": 100, "y": 100},
    )
    assert node.id == "n1"
    assert node.kind == NodeKind.source
    assert node.layer == MedallionLayer.bronze


def test_pipeline_node_invalid_kind():
    with pytest.raises(ValidationError):
        PipelineNode(
            id="n1", kind="invalid_kind", subtype="csv",
            label="CSV", layer="bronze",
            config={}, position={"x": 0, "y": 0},
        )


def test_pipeline_node_quality_kind():
    node = PipelineNode(
        id="q1", kind=NodeKind.quality, subtype="data_quality",
        label="Data Quality", layer=MedallionLayer.silver,
        config={"rules": [], "fail_on_error": True},
        position={"x": 200, "y": 200},
    )
    assert node.kind == NodeKind.quality


def test_pipeline_node_all_kinds():
    for kind in [NodeKind.source, NodeKind.transform, NodeKind.output, NodeKind.quality]:
        node = PipelineNode(
            id="n1", kind=kind, subtype="csv",
            label="Test", layer=MedallionLayer.bronze,
            config={}, position={"x": 0, "y": 0},
        )
        assert node.kind == kind


def test_pipeline_node_all_layers():
    for layer in [MedallionLayer.bronze, MedallionLayer.silver, MedallionLayer.gold]:
        node = PipelineNode(
            id="n1", kind=NodeKind.source, subtype="csv",
            label="Test", layer=layer,
            config={}, position={"x": 0, "y": 0},
        )
        assert node.layer == layer


# ─── PipelineEdge ─────────────────────────────────────────────────────────────

def test_pipeline_edge_valid():
    edge = PipelineEdge(
        id="e1", source="n1", target="n2", layer=MedallionLayer.bronze
    )
    assert edge.source == "n1"
    assert edge.target == "n2"


def test_pipeline_edge_optional_handles():
    edge = PipelineEdge(
        id="e1", source="n1", target="n2",
        layer=MedallionLayer.silver,
        sourceHandle="out", targetHandle="in",
    )
    assert edge.sourceHandle == "out"
    assert edge.targetHandle == "in"


# ─── PipelineDefinition ───────────────────────────────────────────────────────

def make_node(node_id: str, kind: str = "source") -> PipelineNode:
    return PipelineNode(
        id=node_id, kind=kind, subtype="csv",
        label=f"Node {node_id}", layer=MedallionLayer.bronze,
        config={"path": "/data/test.csv"},
        position={"x": 0, "y": 0},
    )


def test_pipeline_definition_valid():
    pipeline = PipelineDefinition(
        name="Test Pipeline",
        nodes=[make_node("n1"), make_node("n2", "output")],
        edges=[PipelineEdge(id="e1", source="n1", target="n2", layer=MedallionLayer.bronze)],
    )
    assert pipeline.name == "Test Pipeline"
    assert len(pipeline.nodes) == 2
    assert len(pipeline.edges) == 1


def test_pipeline_definition_empty_name():
    with pytest.raises(ValidationError):
        PipelineDefinition(name="", nodes=[], edges=[])


def test_pipeline_definition_with_schedule():
    pipeline = PipelineDefinition(
        name="Scheduled Pipeline",
        nodes=[make_node("n1")],
        edges=[],
        schedule="0 6 * * *",
    )
    assert pipeline.schedule == "0 6 * * *"


def test_pipeline_definition_optional_fields():
    pipeline = PipelineDefinition(
        name="Simple",
        nodes=[],
        edges=[],
    )
    assert pipeline.id is None
    assert pipeline.description is None
    assert pipeline.schedule is None