import { Handle, Position, type NodeProps } from '@xyflow/react'
import type { MedallionLayer } from '../../../../types/pipeline.types'
import './nodes.css'

const ICONS: Record<string, string> = {
  filter: '🔽', aggregate: '∑', join: '⋈', cast: '🔄',
}

export default function TransformNode({ data, selected }: NodeProps) {
  const layer = (data.layer as MedallionLayer) ?? 'silver'

  return (
    <div className={`pipeline-node pipeline-node--transform pipeline-node--${layer}${selected ? ' pipeline-node--selected' : ''}`}>
      <Handle type="target" position={Position.Top}    className="pipeline-node__handle pipeline-node__handle--in" />
      <div className="pipeline-node__header">
        <span className="pipeline-node__icon">{ICONS[data.subtype as string] ?? '⚙️'}</span>
        <span className="pipeline-node__label">{data.label as string}</span>
        <span className={`pipeline-node__layer-badge pipeline-node__layer-badge--${layer}`}>{layer.toUpperCase()}</span>
      </div>
      <div className="pipeline-node__subtype">{data.subtype as string}</div>
      <Handle type="source" position={Position.Bottom} className="pipeline-node__handle pipeline-node__handle--out" />
    </div>
  )
}