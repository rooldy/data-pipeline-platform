"""
Router FastAPI — Monitoring
Expose les données Airflow au frontend
"""
import logging
from fastapi import APIRouter, HTTPException, Depends
from app.services.airflow_client import (
    get_dags, get_dag_runs, get_task_instances,
    trigger_dag, get_monitoring_summary
)
from app.auth.jwt import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/monitoring", tags=["Monitoring"])


@router.get("/summary")
async def monitoring_summary(current_user: dict = Depends(get_current_user)):
    """Résumé global — tous les pipelines avec leur dernier run"""
    try:
        return await get_monitoring_summary()
    except Exception as e:
        logger.error(f"Monitoring summary error: {e}")
        raise HTTPException(status_code=503, detail=f"Airflow indisponible : {str(e)}")


@router.get("/pipelines")
async def list_monitored_pipelines(current_user: dict = Depends(get_current_user)):
    """Liste des DAGs avec statuts"""
    try:
        return await get_dags()
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.get("/pipelines/{dag_id}/runs")
async def get_pipeline_runs(dag_id: str, limit: int = 10, current_user: dict = Depends(get_current_user)):
    """Historique des runs d'un pipeline"""
    try:
        return await get_dag_runs(dag_id, limit)
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.get("/pipelines/{dag_id}/runs/{run_id}/tasks")
async def get_run_tasks(dag_id: str, run_id: str, current_user: dict = Depends(get_current_user)):
    """Détail des tâches d'un run"""
    try:
        return await get_task_instances(dag_id, run_id)
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))


@router.post("/pipelines/{dag_id}/trigger")
async def trigger_pipeline(dag_id: str, current_user: dict = Depends(get_current_user)):
    """Déclenche manuellement un pipeline depuis le frontend"""
    try:
        result = await trigger_dag(dag_id)
        return {"message": f"Pipeline '{dag_id}' déclenché", **result}
    except Exception as e:
        raise HTTPException(status_code=503, detail=str(e))