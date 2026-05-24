import axios from 'axios'
import type { PipelineDefinition, CreatePipelineResponse, PipelineRun } from '../types/pipeline.types'
import { useAuthStore } from '../store/authStore'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Intercepteur automatique
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().user?.token
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ─── Pipelines ───────────────────────────────────────────────────────────────

export async function createPipeline(
  definition: PipelineDefinition
): Promise<CreatePipelineResponse> {
  const { data } = await api.post<CreatePipelineResponse>('/api/v1/pipelines', definition)
  return data
}

export async function savePipeline(
  definition: PipelineDefinition
): Promise<PipelineDefinition> {
  const { data } = await api.post<PipelineDefinition>('/api/v1/pipelines/save', definition)
  return data
}

export async function listPipelines(): Promise<PipelineDefinition[]> {
  const { data } = await api.get<PipelineDefinition[]>('/api/v1/pipelines')
  return data
}

// ─── Runs ────────────────────────────────────────────────────────────────────

export async function triggerRun(pipelineId: string): Promise<PipelineRun> {
  const { data } = await api.post<PipelineRun>(`/api/v1/pipelines/${pipelineId}/trigger`)
  return data
}

// ─── LocalStorage fallback ───────────────────────────────────────────────────

const LS_KEY = 'pipeline_drafts'

export function saveToLocalStorage(definition: PipelineDefinition): void {
  try {
    const existing = loadAllFromLocalStorage()
    const id = definition.id ?? `draft_${Date.now()}`
    const updated = {
      ...existing,
      [id]: { ...definition, id, updated_at: new Date().toISOString() },
    }
    localStorage.setItem(LS_KEY, JSON.stringify(updated))
  } catch (e) {
    console.error('LocalStorage save failed', e)
  }
}

export function loadAllFromLocalStorage(): Record<string, PipelineDefinition> {
  try {
    const raw = localStorage.getItem(LS_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}