import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const api = axios.create({ baseURL: BASE_URL, timeout: 10000 })

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PipelineRun {
  run_id:     string
  dag_id:     string
  state:      'success' | 'failed' | 'running' | 'queued'
  run_type:   string
  start_date: string | null
  end_date:   string | null
  duration_s: number | null
}

export interface TaskInstance {
  task_id:    string
  state:      string
  start_date: string | null
  end_date:   string | null
  duration_s: number | null
  try_number: number
}

export interface MonitoredPipeline {
  dag_id:       string
  is_paused:    boolean
  is_active:    boolean
  schedule:     string | null
  tags:         string[]
  last_parsed:  string | null
  last_run:     PipelineRun | null
  success_rate: number | null
  total_runs:   number
  recent_runs:  PipelineRun[]
}

export interface MonitoringSummary {
  pipelines: MonitoredPipeline[]
  total:     number
}

// ─── API calls ────────────────────────────────────────────────────────────────

export async function getMonitoringSummary(): Promise<MonitoringSummary> {
  const { data } = await api.get<MonitoringSummary>('/api/v1/monitoring/summary')
  return data
}

export async function getPipelineRuns(dagId: string, limit = 10): Promise<PipelineRun[]> {
  const { data } = await api.get<PipelineRun[]>(`/api/v1/monitoring/pipelines/${dagId}/runs`, {
    params: { limit },
  })
  return data
}

export async function getRunTasks(dagId: string, runId: string): Promise<TaskInstance[]> {
  const { data } = await api.get<TaskInstance[]>(
    `/api/v1/monitoring/pipelines/${dagId}/runs/${encodeURIComponent(runId)}/tasks`
  )
  return data
}

export async function triggerPipeline(dagId: string): Promise<{ run_id: string; state: string }> {
  const { data } = await api.post(`/api/v1/monitoring/pipelines/${dagId}/trigger`)
  return data
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function formatDuration(seconds: number | null): string {
  if (seconds === null) return '—'
  if (seconds < 60)  return `${seconds}s`
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ${seconds % 60}s`
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`
}

export function formatDate(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}