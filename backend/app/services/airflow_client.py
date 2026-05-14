"""
Client Airflow REST API
Proxy entre le backend FastAPI et l'API interne Airflow
"""
import os
import logging
from datetime import datetime
from typing import Optional
import httpx

logger = logging.getLogger(__name__)

AIRFLOW_URL  = os.getenv("AIRFLOW_API_URL", "http://pipeline-airflow-webserver:8080")
AIRFLOW_USER = os.getenv("AIRFLOW_USER", "airflow")
AIRFLOW_PASS = os.getenv("AIRFLOW_PASSWORD", "airflow")
TIMEOUT      = 10.0


def _duration(start: Optional[str], end: Optional[str]) -> Optional[int]:
    """Calcule la durée en secondes entre deux dates ISO"""
    if not start or not end:
        return None
    try:
        fmt = "%Y-%m-%dT%H:%M:%S.%f+00:00"
        s = datetime.strptime(start[:26] + "+00:00", fmt)
        e = datetime.strptime(end[:26]   + "+00:00", fmt)
        return max(0, int((e - s).total_seconds()))
    except Exception:
        return None


async def get_dags() -> list[dict]:
    """Liste tous les DAGs générés par la plateforme"""
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        r = await client.get(
            f"{AIRFLOW_URL}/api/v1/dags",
            auth=(AIRFLOW_USER, AIRFLOW_PASS),
            params={"tags": "generated"},
        )
        r.raise_for_status()
        dags = r.json().get("dags", [])
        return [
            {
                "dag_id":      d["dag_id"],
                "is_paused":   d["is_paused"],
                "is_active":   d["is_active"],
                "schedule":    d.get("timetable_description"),
                "tags":        [t["name"] for t in d.get("tags", [])],
                "last_parsed": d.get("last_parsed_time"),
            }
            for d in dags
        ]


async def get_dag_runs(dag_id: str, limit: int = 10) -> list[dict]:
    """Retourne les derniers runs d'un DAG"""
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        r = await client.get(
            f"{AIRFLOW_URL}/api/v1/dags/{dag_id}/dagRuns",
            auth=(AIRFLOW_USER, AIRFLOW_PASS),
            params={"limit": limit, "order_by": "-execution_date"},
        )
        r.raise_for_status()
        runs = r.json().get("dag_runs", [])
        return [
            {
                "run_id":     run["dag_run_id"],
                "dag_id":     run["dag_id"],
                "state":      run["state"],
                "run_type":   run["run_type"],
                "start_date": run.get("start_date"),
                "end_date":   run.get("end_date"),
                "duration_s": _duration(run.get("start_date"), run.get("end_date")),
            }
            for run in runs
        ]


async def get_task_instances(dag_id: str, run_id: str) -> list[dict]:
    """Retourne les tâches d'un run spécifique"""
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        r = await client.get(
            f"{AIRFLOW_URL}/api/v1/dags/{dag_id}/dagRuns/{run_id}/taskInstances",
            auth=(AIRFLOW_USER, AIRFLOW_PASS),
        )
        r.raise_for_status()
        tasks = r.json().get("task_instances", [])
        return [
            {
                "task_id":    t["task_id"],
                "state":      t.get("state", "none"),
                "start_date": t.get("start_date"),
                "end_date":   t.get("end_date"),
                "duration_s": _duration(t.get("start_date"), t.get("end_date")),
                "try_number": t.get("try_number", 1),
            }
            for t in tasks
        ]


async def trigger_dag(dag_id: str) -> dict:
    """Déclenche manuellement un DAG"""
    async with httpx.AsyncClient(timeout=TIMEOUT) as client:
        r = await client.post(
            f"{AIRFLOW_URL}/api/v1/dags/{dag_id}/dagRuns",
            auth=(AIRFLOW_USER, AIRFLOW_PASS),
            json={"conf": {}},
        )
        r.raise_for_status()
        run = r.json()
        return {
            "run_id": run["dag_run_id"],
            "state":  run["state"],
        }


async def get_monitoring_summary() -> dict:
    """Résumé global de tous les pipelines pour le dashboard"""
    dags = await get_dags()
    summary = []
    for dag in dags:
        runs = await get_dag_runs(dag["dag_id"], limit=5)
        last_run = runs[0] if runs else None
        total    = len(runs)
        success  = sum(1 for r in runs if r["state"] == "success")
        summary.append({
            **dag,
            "last_run":       last_run,
            "success_rate":   round(success / total * 100) if total else None,
            "total_runs":     total,
            "recent_runs":    runs[:5],
        })
    return {"pipelines": summary, "total": len(summary)}