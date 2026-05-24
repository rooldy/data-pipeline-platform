"""
Router FastAPI — Pipelines
POST /api/v1/pipelines        → créer et déployer un pipeline
GET  /api/v1/pipelines        → lister les pipelines
DELETE /api/v1/pipelines/{id} → supprimer un pipeline
"""
import uuid
import logging
from fastapi import APIRouter, HTTPException, Depends

from app.models.pipeline import (
    PipelineDefinition,
    CreatePipelineResponse,
    PipelineListItem,
)
from app.services.dag_generator import generate_dag, list_generated_dags, delete_dag
from app.auth.jwt import get_current_user

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/v1/pipelines", tags=["Pipelines"])


@router.post("", response_model=CreatePipelineResponse, status_code=201)
async def create_pipeline(pipeline: PipelineDefinition):
    """
    Reçoit une PipelineDefinition depuis le frontend,
    génère le DAG Airflow et le sauvegarde dans /opt/airflow/dags/generated/
    """
    current_user: dict = Depends(get_current_user)
    try:
        # Générer un ID si absent
        if not pipeline.id:
            pipeline.id = str(uuid.uuid4())

        # Validation minimale
        if not pipeline.nodes:
            raise HTTPException(status_code=422, detail="Le pipeline doit contenir au moins un nœud")

        has_source = any(n.kind == "source" for n in pipeline.nodes)
        if not has_source:
            raise HTTPException(status_code=422, detail="Le pipeline doit avoir au moins une source")

        # Générer le DAG
        dag_id, dag_path = generate_dag(pipeline)

        logger.info(f"Pipeline créé : {pipeline.name} → DAG : {dag_id}")

        return CreatePipelineResponse(
            id=pipeline.id,
            dag_id=dag_id,
            status="created",
            message=f"DAG '{dag_id}' généré et déployé dans Airflow",
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur génération DAG : {e}")
        raise HTTPException(status_code=500, detail=f"Erreur lors de la génération du DAG : {str(e)}")


@router.get("", response_model=list[PipelineListItem])
async def list_pipelines(
    current_user: dict = Depends(get_current_user),  # ← dans la signature
):
    dags = list_generated_dags()
    return [
        PipelineListItem(
            id=d["dag_id"],
            name=d["dag_id"].replace("pipeline_", "").replace("_", " ").title(),
            dag_id=d["dag_id"],
            node_count=0,
            schedule=None,
            created_at=d["created_at"],
        )
        for d in dags
    ]


@router.delete("/{dag_id}", status_code=204)
async def delete_pipeline(
    dag_id: str,
    current_user: dict = Depends(get_current_user),  # ← dans la signature
):
    deleted = delete_dag(dag_id)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Pipeline '{dag_id}' introuvable")