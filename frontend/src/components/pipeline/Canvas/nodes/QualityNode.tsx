import React from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { MedallionLayer } from '../../../../types/pipeline.types'
import './nodes.css'

export default function QualityNode({ data, selected }: NodeProps) {
  const layer     = (data.layer as MedallionLayer) ?? 'silver'
  const rulesCount = (data.config as { rules?: unknown[] })?.rules?.length ?? 0

  return (
    <div className={`pipeline-node pipeline-node--quality pipeline-node--${layer}${selected ? ' pipeline-node--selected' : ''}`}>
      <Handle type="target" position={Position.Top}    className="pipeline-node__handle pipeline-node__handle--in" />
      <div className="pipeline-node__header">
        <span className="pipeline-node__icon">🔍</span>
        <span className="pipeline-node__label">{data.label as string}</span>
        <span className={`pipeline-node__layer-badge pipeline-node__layer-badge--${layer}`}>
          {layer.toUpperCase()}
        </span>
      </div>
      <div className="pipeline-node__subtype">
        {rulesCount > 0 ? `${rulesCount} règle${rulesCount > 1 ? 's' : ''}` : 'data_quality'}
      </div>
      <Handle type="source" position={Position.Bottom} className="pipeline-node__handle pipeline-node__handle--out" />
    </div>
  )
}