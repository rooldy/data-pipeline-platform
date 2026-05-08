import React, { useState } from 'react'
import { ReactFlowProvider } from '@xyflow/react'
import PipelineCanvas from '../Canvas/PipelineCanvas'
import NodePalette    from '../NodePalette/NodePalette'
import ConfigPanel    from '../ConfigPanel/ConfigPanel'
import { ToastContainer, useToast } from '../../common/Toast/Toast'
import { usePipelineStore } from '../../../store/pipelineStore'
import { createPipeline, saveToLocalStorage } from '../../../api/pipeline.api'
import './PipelineBuilder.css'

interface TopbarProps {
  onSave:   () => void
  onDeploy: () => void
  isSaving: boolean
}

function PipelineTopbar({ onSave, onDeploy, isSaving }: TopbarProps) {
  const name        = usePipelineStore((s) => s.pipelineName)
  const setName     = usePipelineStore((s) => s.setPipelineName)
  const schedule    = usePipelineStore((s) => s.schedule)
  const setSchedule = usePipelineStore((s) => s.setSchedule)
  const isDirty     = usePipelineStore((s) => s.isDirty)
  const nodeCount   = usePipelineStore((s) => s.nodes.length)
  const edgeCount   = usePipelineStore((s) => s.edges.length)

  return (
    <header className="builder-topbar">
      <div className="builder-topbar__left">
        <span className="builder-topbar__logo">⬡</span>
        <input
          className="builder-topbar__name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          aria-label="Nom du pipeline"
        />
        {isDirty && <span className="builder-topbar__dirty">●</span>}
      </div>

      <div className="builder-topbar__schedule">
        <span className="builder-topbar__schedule-label">⏱</span>
        <input
          className="builder-topbar__schedule-input"
          placeholder="Cron : 0 6 * * *"
          value={schedule}
          onChange={(e) => setSchedule(e.target.value)}
          title="Expression cron (ex: 0 6 * * * = tous les jours à 6h)"
        />
      </div>

      <div className="builder-topbar__stats">
        <span className="builder-topbar__stat">
          <span className="builder-topbar__stat-value">{nodeCount}</span>
          <span className="builder-topbar__stat-label">nœuds</span>
        </span>
        <span className="builder-topbar__stat">
          <span className="builder-topbar__stat-value">{edgeCount}</span>
          <span className="builder-topbar__stat-label">connexions</span>
        </span>
      </div>

      <div className="builder-topbar__actions">
        <button
          className="builder-btn builder-btn--ghost"
          onClick={onSave}
          disabled={nodeCount === 0}
        >
          💾 Sauvegarder
        </button>
        <button
          className="builder-btn builder-btn--primary"
          onClick={onDeploy}
          disabled={isSaving || nodeCount === 0}
        >
          {isSaving
            ? <><span className="builder-btn__spinner" />Déploiement…</>
            : '🚀 Déployer'
          }
        </button>
      </div>
    </header>
  )
}

export default function PipelineBuilder() {
  const { toasts, success, error, info } = useToast()

  const getDefinition = usePipelineStore((s) => s.getDefinition)
  const pipelineName  = usePipelineStore((s) => s.pipelineName)
  const isSaving      = usePipelineStore((s) => s.isSaving)
  const setSaving     = usePipelineStore((s) => s.setSaving)
  const setSaveError  = usePipelineStore((s) => s.setSaveError)
  const resetDirty    = usePipelineStore((s) => s.resetDirty)

  const validate = (): string | null => {
    const def = getDefinition()
    if (!def.name.trim())       return 'Donne un nom au pipeline'
    if (def.nodes.length === 0) return 'Ajoute au moins un nœud'
    if (!def.nodes.some((n) => n.kind === 'source'))
                                return 'Le pipeline doit avoir au moins une source'
    return null
  }

  const handleSave = () => {
    const err = validate()
    if (err) { error(err); return }
    try {
      saveToLocalStorage(getDefinition())
      resetDirty()
      success(`"${pipelineName}" sauvegardé localement`)
    } catch {
      error('Échec de la sauvegarde locale')
    }
  }

  const handleDeploy = async () => {
    const validationError = validate()
    if (validationError) { error(validationError); return }

    setSaving(true)
    setSaveError(null)
    info(`Déploiement de "${pipelineName}"…`)

    try {
      const response = await createPipeline(getDefinition())
      resetDirty()
      success(`Pipeline déployé ! DAG ID : ${response.dag_id}`)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Erreur inconnue'
      if (msg.includes('Network') || msg.includes('ECONNREFUSED') || msg.includes('timeout')) {
        saveToLocalStorage(getDefinition())
        resetDirty()
        error('Backend indisponible — sauvegardé localement')
      } else {
        setSaveError(msg)
        error(`Erreur : ${msg}`)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <ReactFlowProvider>
      <div className="pipeline-builder">
        <PipelineTopbar onSave={handleSave} onDeploy={handleDeploy} isSaving={isSaving} />
        <div className="pipeline-builder__body">
          <NodePalette />
          <main className="pipeline-builder__canvas">
            <PipelineCanvas />
          </main>
          <ConfigPanel />
        </div>
      </div>
      <ToastContainer toasts={toasts} />
    </ReactFlowProvider>
  )
}