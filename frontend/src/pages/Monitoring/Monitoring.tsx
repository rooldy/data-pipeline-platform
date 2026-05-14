import React, { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  getMonitoringSummary, getPipelineRuns, getRunTasks,
  triggerPipeline, formatDuration, formatDate,
  type MonitoredPipeline, type PipelineRun, type TaskInstance,
} from '../../api/monitoring.api'
import './Monitoring.css'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATE_ICONS: Record<string, string> = {
  success: '✅', failed: '❌', running: '⏳', queued: '🕐',
}

function StateBadge({ state }: { state: string }) {
  return (
    <span className={`state-badge state-badge--${state ?? 'none'}`}>
      {STATE_ICONS[state] ?? '○'} {state ?? 'none'}
    </span>
  )
}

function RateBar({ rate }: { rate: number | null }) {
  if (rate === null) return <span style={{ color: '#9ca3af' }}>—</span>
  const cls = rate >= 80 ? '' : rate >= 50 ? 'rate-bar__fill--warning' : 'rate-bar__fill--danger'
  return (
    <div className="rate-bar">
      <div className="rate-bar__track">
        <div className={`rate-bar__fill ${cls}`} style={{ width: `${rate}%` }} />
      </div>
      <span className="rate-bar__text">{rate}%</span>
    </div>
  )
}

// ─── Task row ─────────────────────────────────────────────────────────────────

function TaskRow({ dagId, runId }: { dagId: string; runId: string }) {
  const [tasks, setTasks] = useState<TaskInstance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getRunTasks(dagId, runId)
      .then(setTasks)
      .finally(() => setLoading(false))
  }, [dagId, runId])

  return (
    <tr className="tasks-row">
      <td colSpan={5}>
        <div className="tasks-container">
          {loading ? (
            <span style={{ color: '#8b90a0', fontSize: '0.8125rem' }}>Chargement…</span>
          ) : tasks.length === 0 ? (
            <span style={{ color: '#8b90a0', fontSize: '0.8125rem' }}>Aucune tâche</span>
          ) : (
            tasks
              .filter(t => t.task_id !== 'start' && t.task_id !== 'end')
              .map((t) => (
                <div key={t.task_id} className={`task-chip state-badge--${t.state ?? 'none'}`}>
                  <span>{STATE_ICONS[t.state] ?? '○'}</span>
                  <span className="task-chip__name">{t.task_id}</span>
                  {t.duration_s !== null && (
                    <span className="task-chip__duration">{formatDuration(t.duration_s)}</span>
                  )}
                </div>
              ))
          )}
        </div>
      </td>
    </tr>
  )
}

// ─── Pipeline Card ────────────────────────────────────────────────────────────

function PipelineCard({ pipeline }: { pipeline: MonitoredPipeline }) {
  const [open, setOpen]               = useState(false)
  const [runs, setRuns]               = useState<PipelineRun[]>(pipeline.recent_runs)
  const [expandedRun, setExpandedRun] = useState<string | null>(null)
  const [triggering, setTriggering]   = useState(false)

  const handleTrigger = async (e: React.MouseEvent) => {
    e.stopPropagation()
    setTriggering(true)
    try {
      await triggerPipeline(pipeline.dag_id)
      setTimeout(async () => {
        const fresh = await getPipelineRuns(pipeline.dag_id)
        setRuns(fresh)
      }, 3000)
    } catch (err) {
      console.error(err)
    } finally {
      setTriggering(false)
    }
  }

  return (
    <div className="pipeline-card">
      <div
        className={`pipeline-card__header${open ? ' pipeline-card__header--open' : ''}`}
        onClick={() => setOpen(!open)}
      >
        <span style={{ fontSize: '1.25rem' }}>{open ? '▾' : '▸'}</span>
        <span className="pipeline-card__name">{pipeline.dag_id}</span>

        {pipeline.last_run && <StateBadge state={pipeline.last_run.state} />}

        <div className="pipeline-card__meta">
          <span>{pipeline.total_runs} run{pipeline.total_runs > 1 ? 's' : ''}</span>
          {pipeline.last_run?.duration_s != null && (
            <span>⏱ {formatDuration(pipeline.last_run.duration_s)}</span>
          )}
        </div>

        <RateBar rate={pipeline.success_rate} />

        <button
          className="mon-btn mon-btn--primary mon-btn--sm"
          onClick={handleTrigger}
          disabled={triggering}
        >
          {triggering ? '⏳' : '▶'} {triggering ? 'En cours…' : 'Déclencher'}
        </button>
      </div>

      {open && (
        <div>
          <table className="runs-table">
            <thead>
              <tr>
                <th>Run ID</th>
                <th>État</th>
                <th>Démarré le</th>
                <th>Durée</th>
                <th>Tâches</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((run) => (
                <React.Fragment key={run.run_id}>
                  <tr
                    style={{ cursor: 'pointer' }}
                    onClick={() => setExpandedRun(expandedRun === run.run_id ? null : run.run_id)}
                  >
                    <td className="runs-table__run-id">{run.run_id}</td>
                    <td><StateBadge state={run.state} /></td>
                    <td>{formatDate(run.start_date)}</td>
                    <td className="runs-table__duration">{formatDuration(run.duration_s)}</td>
                    <td style={{ color: '#9ca3af', fontSize: '0.8125rem' }}>
                      {expandedRun === run.run_id ? 'Masquer ▲' : 'Voir ▼'}
                    </td>
                  </tr>
                  {expandedRun === run.run_id && (
                    <TaskRow dagId={run.dag_id} runId={run.run_id} />
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Monitoring() {
  const [pipelines, setPipelines] = useState<MonitoredPipeline[]>([])
  const [loading, setLoading]     = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const load = useCallback(async () => {
    try {
      const data = await getMonitoringSummary()
      setPipelines(data.pipelines)
      setLastRefresh(new Date())
    } catch (err) {
      console.error('Monitoring load error', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [load])

  // KPIs
  const totalPipelines = pipelines.length
  const totalRuns      = pipelines.reduce((a, p) => a + p.total_runs, 0)
  const successCount   = pipelines.filter(p => p.last_run?.state === 'success').length
  const avgRate        = pipelines.length > 0
    ? Math.round(pipelines.reduce((a, p) => a + (p.success_rate ?? 0), 0) / pipelines.length)
    : null

  return (
    <div className="monitoring">
      <header className="monitoring__header">
        <div>
          <div className="monitoring__title">📊 Monitoring des Pipelines</div>
          <div className="monitoring__subtitle">
            Statuts temps réel · Airflow DAGs · Historique des runs
          </div>
        </div>
        <div className="monitoring__actions">
          <span className="monitoring__refresh-info">
            Actualisé à {lastRefresh.toLocaleTimeString('fr-FR')} · auto 30s
          </span>
          <button className="mon-btn mon-btn--ghost" onClick={load}>
            🔄 Rafraîchir
          </button>
          <Link to="/pipeline/new">
            <button className="mon-btn mon-btn--primary">⬡ Nouveau pipeline</button>
          </Link>
        </div>
      </header>

      <div className="monitoring__body">

        {/* KPI Bar */}
        <div className="kpi-bar">
          <div className="kpi-card">
            <span className="kpi-card__value">{totalPipelines}</span>
            <span className="kpi-card__label">Pipelines actifs</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-card__value kpi-card__value--success">{successCount}</span>
            <span className="kpi-card__label">Derniers runs ✅</span>
          </div>
          <div className="kpi-card">
            <span className="kpi-card__value">{totalRuns}</span>
            <span className="kpi-card__label">Total exécutions</span>
          </div>
          <div className="kpi-card">
            <span className={`kpi-card__value ${
              avgRate === null ? '' :
              avgRate >= 80 ? 'kpi-card__value--success' :
              avgRate >= 50 ? 'kpi-card__value--warning' : 'kpi-card__value--danger'
            }`}>
              {avgRate !== null ? `${avgRate}%` : '—'}
            </span>
            <span className="kpi-card__label">Taux de succès moyen</span>
          </div>
        </div>

        {/* Pipeline cards */}
        {loading ? (
          <div className="monitoring__loading">
            <div className="spinner" />
            <span>Chargement des données Airflow…</span>
          </div>
        ) : pipelines.length === 0 ? (
          <div className="monitoring__empty">
            <div className="monitoring__empty-icon">📭</div>
            <p className="monitoring__empty-text">
              Aucun pipeline déployé.<br />Créez votre premier pipeline depuis le Pipeline Builder.
            </p>
            <Link to="/pipeline/new">
              <button className="mon-btn mon-btn--primary">⬡ Créer un pipeline</button>
            </Link>
          </div>
        ) : (
          <div className="pipeline-cards">
            {pipelines.map((p) => (
              <PipelineCard key={p.dag_id} pipeline={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}