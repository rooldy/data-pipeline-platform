"""
Générateur de DAGs Airflow à partir d'une PipelineDefinition
Utilise Jinja2 pour rendre le template
"""
import os
import re
import json
import logging
from datetime import datetime
from pathlib import Path
from jinja2 import Environment, FileSystemLoader, select_autoescape

from app.models.pipeline import PipelineDefinition

logger = logging.getLogger(__name__)

# Dossier de sortie des DAGs générés (partagé avec Airflow via volume Docker)
DAGS_OUTPUT_DIR = Path(os.getenv("DAGS_OUTPUT_DIR", "/opt/airflow/dags/generated"))

# Dossier des templates Jinja2
TEMPLATES_DIR = Path(__file__).parent.parent.parent / "templates"


def slugify(text: str) -> str:
    """Convertit un nom en dag_id valide pour Airflow"""
    text = text.lower().strip()
    text = re.sub(r'[^\w\s-]', '', text)
    text = re.sub(r'[\s_-]+', '_', text)
    return re.sub(r'^-+|-+$', '', text)


def generate_dag(pipeline: PipelineDefinition) -> tuple[str, str]:
    """
    Génère un fichier DAG Airflow depuis une PipelineDefinition.
    Retourne (dag_id, dag_file_path)
    """
    dag_id   = f"pipeline_{slugify(pipeline.name)}"
    filename = f"{dag_id}.py"

    # Préparer le contexte Jinja2
    context = {
        "dag_id":      dag_id,
        "pipeline":    pipeline,
        "nodes":       pipeline.nodes,
        "edges":       pipeline.edges,
        "schedule":    pipeline.schedule or None,
        "description": pipeline.description or f"Pipeline généré : {pipeline.name}",
        "generated_at": datetime.utcnow().isoformat(),
        "node_configs": {n.id: n.config for n in pipeline.nodes},
    }

    # Rendre le template
    env = Environment(
        loader=FileSystemLoader(str(TEMPLATES_DIR)),
        autoescape=select_autoescape(disabled_extensions=("py.j2",)),
        trim_blocks=True,
        lstrip_blocks=True,
    )
    template = env.get_template("pipeline_dag.py.j2")
    dag_content = template.render(**context)

    # Écrire le fichier DAG
    DAGS_OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    output_path = DAGS_OUTPUT_DIR / filename
    output_path.write_text(dag_content, encoding="utf-8")

    logger.info(f"✅ DAG généré : {output_path}")
    return dag_id, str(output_path)


def list_generated_dags() -> list[dict]:
    """Liste les DAGs générés dans le dossier de sortie"""
    if not DAGS_OUTPUT_DIR.exists():
        return []

    dags = []
    for f in DAGS_OUTPUT_DIR.glob("pipeline_*.py"):
        stat = f.stat()
        dags.append({
            "dag_id":     f.stem,
            "filename":   f.name,
            "created_at": datetime.fromtimestamp(stat.st_ctime).isoformat(),
            "size_bytes": stat.st_size,
        })
    return sorted(dags, key=lambda x: x["created_at"], reverse=True)


def delete_dag(dag_id: str) -> bool:
    """Supprime un DAG généré"""
    dag_file = DAGS_OUTPUT_DIR / f"{dag_id}.py"
    if dag_file.exists():
        dag_file.unlink()
        logger.info(f"🗑️ DAG supprimé : {dag_file}")
        return True
    return False