"""
Tests des endpoints FastAPI — /api/v1/pipelines
"""
import pytest
from httpx import AsyncClient, ASGITransport
from unittest.mock import patch, AsyncMock
from app.main import app


BASE = "http://test"


def minimal_pipeline_payload():
    return {
        "name": "test pipeline",
        "nodes": [
            {
                "id": "n1", "kind": "source", "subtype": "csv",
                "label": "CSV", "layer": "bronze",
                "config": {"path": "/data/bronze/sales.csv"},
                "position": {"x": 100, "y": 100},
            },
            {
                "id": "n2", "kind": "output", "subtype": "delta_lake",
                "label": "Delta Lake", "layer": "gold",
                "config": {"path": "/data/gold/test", "table_name": "gold.test", "mode": "append"},
                "position": {"x": 100, "y": 300},
            },
        ],
        "edges": [
            {"id": "e1", "source": "n1", "target": "n2", "layer": "bronze"}
        ],
    }


# ─── GET / ────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_root_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as client:
        r = await client.get("/")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "running"
    assert "version" in data


# ─── GET /health ──────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_health_endpoint():
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as client:
        r = await client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "healthy"


# ─── POST /api/v1/pipelines ───────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_create_pipeline_success():
    with patch("app.api.v1.pipelines.generate_dag") as mock_gen:
        mock_gen.return_value = ("pipeline_test_pipeline", "/tmp/test.py")
        async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as client:
            r = await client.post("/api/v1/pipelines", json=minimal_pipeline_payload())

    assert r.status_code == 201
    data = r.json()
    assert data["status"] == "created"
    assert "dag_id" in data
    assert data["dag_id"] == "pipeline_test_pipeline"


@pytest.mark.asyncio
async def test_create_pipeline_empty_name():
    payload = minimal_pipeline_payload()
    payload["name"] = ""
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as client:
        r = await client.post("/api/v1/pipelines", json=payload)
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_create_pipeline_no_nodes():
    payload = minimal_pipeline_payload()
    payload["nodes"] = []
    with patch("app.api.v1.pipelines.generate_dag") as mock_gen:
        mock_gen.return_value = ("pipeline_test", "/tmp/test.py")
        async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as client:
            r = await client.post("/api/v1/pipelines", json=payload)
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_create_pipeline_no_source_node():
    payload = minimal_pipeline_payload()
    payload["nodes"] = [payload["nodes"][1]]  # seulement le nœud output
    payload["edges"] = []
    with patch("app.api.v1.pipelines.generate_dag") as mock_gen:
        mock_gen.return_value = ("pipeline_test", "/tmp/test.py")
        async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as client:
            r = await client.post("/api/v1/pipelines", json=payload)
    assert r.status_code == 422


@pytest.mark.asyncio
async def test_create_pipeline_with_quality_node():
    payload = minimal_pipeline_payload()
    quality_node = {
        "id": "q1", "kind": "quality", "subtype": "data_quality",
        "label": "Data Quality", "layer": "silver",
        "config": {
            "rules": [{"id": "r1", "column": "order_id", "rule_type": "not_null", "threshold": 100}],
            "fail_on_error": True,
        },
        "position": {"x": 100, "y": 200},
    }
    payload["nodes"].insert(1, quality_node)
    payload["edges"] = [
        {"id": "e1", "source": "n1", "target": "q1", "layer": "bronze"},
        {"id": "e2", "source": "q1", "target": "n2", "layer": "silver"},
    ]
    with patch("app.api.v1.pipelines.generate_dag") as mock_gen:
        mock_gen.return_value = ("pipeline_test_pipeline", "/tmp/test.py")
        async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as client:
            r = await client.post("/api/v1/pipelines", json=payload)
    assert r.status_code == 201


# ─── GET /api/v1/pipelines ────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_list_pipelines():
    with patch("app.api.v1.pipelines.list_generated_dags") as mock_list:
        mock_list.return_value = [
            {"dag_id": "pipeline_test", "filename": "pipeline_test.py",
             "created_at": "2026-05-16T10:00:00", "size_bytes": 1234}
        ]
        async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as client:
            r = await client.get("/api/v1/pipelines")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# ─── DELETE /api/v1/pipelines/{id} ───────────────────────────────────────────

@pytest.mark.asyncio
async def test_delete_pipeline_found():
    with patch("app.api.v1.pipelines.delete_dag") as mock_del:
        mock_del.return_value = True
        async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as client:
            r = await client.delete("/api/v1/pipelines/pipeline_test")
    assert r.status_code == 204


@pytest.mark.asyncio
async def test_delete_pipeline_not_found():
    with patch("app.api.v1.pipelines.delete_dag") as mock_del:
        mock_del.return_value = False
        async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE) as client:
            r = await client.delete("/api/v1/pipelines/nonexistent")
    assert r.status_code == 404