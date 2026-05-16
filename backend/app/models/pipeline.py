"""
Modèles Pydantic pour les pipelines ETL
"""
from pydantic import BaseModel, Field
from typing import Optional, Any
from enum import Enum


class NodeKind(str, Enum):
    source    = "source"
    transform = "transform"
    output    = "output"
    quality   = "quality"


class MedallionLayer(str, Enum):
    bronze = "bronze"
    silver = "silver"
    gold   = "gold"


class PipelineNode(BaseModel):
    id:       str
    kind:     NodeKind
    subtype:  str
    label:    str
    layer:    MedallionLayer
    config:   dict[str, Any] = Field(default_factory=dict)
    position: dict[str, float] = Field(default_factory=dict)


class PipelineEdge(BaseModel):
    id:           str
    source:       str
    target:       str
    layer:        MedallionLayer
    sourceHandle: Optional[str] = None
    targetHandle: Optional[str] = None


class PipelineDefinition(BaseModel):
    id:          Optional[str] = None
    name:        str           = Field(..., min_length=1, max_length=100)
    description: Optional[str] = None
    nodes:       list[PipelineNode]
    edges:       list[PipelineEdge]
    schedule:    Optional[str] = None  # cron expression


class CreatePipelineResponse(BaseModel):
    id:      str
    dag_id:  str
    status:  str
    message: Optional[str] = None


class PipelineListItem(BaseModel):
    id:          str
    name:        str
    dag_id:      str
    node_count:  int
    schedule:    Optional[str]
    created_at:  str