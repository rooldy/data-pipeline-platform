import React from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { MedallionLayer } from '../../../../types/pipeline.types'
import './nodes.css'

const ICONS: Record<string, string> = {
  csv: '📄', postgresql: '🐘', api_rest: '🌐', s3: '☁️',
}

export default function SourceNode({ data, selected }: NodeProps) {
  const layer = (data.layer as MedallionLayer) ?? 'bronze'

  return (
    <div className={`pipeline-node pipeline-node--source pipeline-node--${layer}${selected ? ' pipeline-node--selected' : ''}`}>
      <div className="pipeline-node__header">
        <span className="pipeline-node__icon">{ICONS[data.subtype as string] ?? '📦'}</span>
        <span className="pipeline-node__label">{data.label as string}</span>
        <span className={`pipeline-node__layer-badge pipeline-node__layer-badge--${layer}`}>{layer.toUpperCase()}</span>
      </div>
      <div className="pipeline-node__subtype">{data.subtype as string}</div>
      <Handle type="source" position={Position.Bottom} className="pipeline-node__handle pipeline-node__handle--out" />
    </div>
  )
}