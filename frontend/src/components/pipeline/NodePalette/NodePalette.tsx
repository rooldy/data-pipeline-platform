import type { NodePaletteItem } from '../../../types/pipeline.types'
import './NodePalette.css'
import type { DragEvent } from 'react'

const PALETTE_ITEMS: NodePaletteItem[] = [
  {
    kind: 'source', subtype: 'csv', label: 'CSV',
    description: 'Lire un fichier CSV local', icon: '📄',
    defaultLayer: 'bronze', defaultConfig: { path: '', delimiter: ',', has_header: true },
  },
  {
    kind: 'source', subtype: 'postgresql', label: 'PostgreSQL',
    description: 'Lire depuis une table PostgreSQL', icon: '🐘',
    defaultLayer: 'bronze', defaultConfig: { host: 'localhost', port: 5432, database: '', schema: 'public', table: '' },
  },
  {
    kind: 'source', subtype: 'api_rest', label: 'API REST',
    description: 'Appeler un endpoint HTTP', icon: '🌐',
    defaultLayer: 'bronze', defaultConfig: { url: '', method: 'GET', auth_type: 'none' },
  },
  {
    kind: 'source', subtype: 's3', label: 'S3',
    description: 'Lire depuis un bucket S3', icon: '☁️',
    defaultLayer: 'bronze', defaultConfig: { bucket: '', prefix: '', region: 'eu-west-1', file_format: 'parquet' },
  },
  {
    kind: 'transform', subtype: 'filter', label: 'Filter',
    description: 'Filtrer les lignes selon une condition', icon: '🔽',
    defaultLayer: 'silver', defaultConfig: { column: '', operator: '==', value: '' },
  },
  {
    kind: 'transform', subtype: 'aggregate', label: 'Aggregate',
    description: 'Grouper et agréger les données', icon: '∑',
    defaultLayer: 'silver', defaultConfig: { group_by: [], aggregations: [] },
  },
  {
    kind: 'transform', subtype: 'join', label: 'Join',
    description: 'Joindre deux flux de données', icon: '⋈',
    defaultLayer: 'silver', defaultConfig: { join_type: 'inner', left_key: '', right_key: '' },
  },
  {
    kind: 'transform', subtype: 'cast', label: 'Cast',
    description: 'Convertir les types de colonnes', icon: '🔄',
    defaultLayer: 'silver', defaultConfig: { columns: [] },
  },
  {
    kind: 'output', subtype: 'delta_lake', label: 'Delta Lake',
    description: 'Écrire dans une table Delta', icon: '△',
    defaultLayer: 'gold', defaultConfig: { path: '', table_name: '', mode: 'append' },
  },
  {
    kind: 'output', subtype: 'postgresql', label: 'PostgreSQL',
    description: 'Écrire dans une table PostgreSQL', icon: '🐘',
    defaultLayer: 'gold', defaultConfig: { host: 'localhost', port: 5432, database: '', schema: 'public', table: '', mode: 'append' },
  },
  {
  kind: 'quality', subtype: 'data_quality', label: 'Data Quality',
  description: 'Valider la qualité des données', icon: '🔍',
  defaultLayer: 'silver',
  defaultConfig: { rules: [], fail_on_error: true },
},
]

const SECTIONS = [
  { label: 'Sources',         kind: 'source'    as const },
  { label: 'Transformations', kind: 'transform' as const },
  { label: 'Destinations',    kind: 'output'    as const },
  { label: 'Qualité', kind: 'quality' as const },
]

function NodeCard({ item }: { item: NodePaletteItem }) {
  const onDragStart = (e: DragEvent) => {
    e.dataTransfer.setData('application/pipeline-node', JSON.stringify(item))
    e.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      className={`palette-card palette-card--${item.kind}`}
      draggable
      onDragStart={onDragStart}
      title={item.description}
    >
      <span className="palette-card__icon">{item.icon}</span>
      <div className="palette-card__body">
        <span className="palette-card__label">{item.label}</span>
        <span className="palette-card__desc">{item.description}</span>
      </div>
      <span className="palette-card__drag-handle">⠿</span>
    </div>
  )
}

export default function NodePalette() {
  return (
    <aside className="node-palette" aria-label="Node Palette">
      <div className="node-palette__header">
        <span className="node-palette__title">Nodes</span>
        <span className="node-palette__hint">Glisser → canvas</span>
      </div>
      {SECTIONS.map((section) => (
        <div key={section.kind} className="node-palette__section">
          <p className="node-palette__section-label">{section.label}</p>
          {PALETTE_ITEMS
            .filter((item) => item.kind === section.kind)
            .map((item) => (
              <NodeCard key={item.subtype} item={item} />
            ))}
        </div>
      ))}
    </aside>
  )
}