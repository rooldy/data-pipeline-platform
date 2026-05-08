import React, { useState } from 'react'
import { usePipelineStore } from '../../../store/pipelineStore'
import SourceForm    from './forms/SourceForm'
import TransformForm from './forms/TransformForm'
import OutputForm    from './forms/OutputForm'
import './forms/forms.css'

export default function ConfigPanel() {
  const [saved, setSaved] = useState(false)

  const selectedNode     = usePipelineStore((s) => s.nodes.find((n) => n.id === s.selectedNodeId))
  const updateNodeConfig = usePipelineStore((s) => s.updateNodeConfig)

  const handleChange = (config: Record<string, unknown>) => {
    if (!selectedNode) return
    updateNodeConfig(selectedNode.id, config)
    setSaved(false)
  }

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <aside className="config-panel builder-sidebar--right" aria-label="Configuration">
      <div className="config-panel__header">
        <span className="config-panel__title">Configuration</span>
        {selectedNode && (
          <span className={`config-panel__badge config-panel__badge--${selectedNode.kind}`}>
            {selectedNode.subtype}
          </span>
        )}
      </div>

      {selectedNode ? (
        <>
          <div className="config-panel__body">
            <div className="config-form">
              {selectedNode.kind === 'source' && (
                <SourceForm
                  subtype={selectedNode.subtype}
                  config={selectedNode.config as Record<string, unknown>}
                  onChange={handleChange}
                />
              )}
              {selectedNode.kind === 'transform' && (
                <TransformForm
                  subtype={selectedNode.subtype}
                  config={selectedNode.config as Record<string, unknown>}
                  onChange={handleChange}
                />
              )}
              {selectedNode.kind === 'output' && (
                <OutputForm
                  subtype={selectedNode.subtype}
                  config={selectedNode.config as Record<string, unknown>}
                  onChange={handleChange}
                />
              )}
            </div>
          </div>
          <div className="config-panel__footer">
            <button
              className={`config-save-btn${saved ? ' config-save-btn--saved' : ''}`}
              onClick={handleSave}
            >
              {saved ? '✓ Sauvegardé' : 'Appliquer la configuration'}
            </button>
          </div>
        </>
      ) : (
        <div className="config-panel__empty">
          <span className="config-panel__empty-icon">⚙️</span>
          <p className="config-panel__empty-text">
            Sélectionne un nœud pour configurer ses paramètres
          </p>
        </div>
      )}
    </aside>
  )
}