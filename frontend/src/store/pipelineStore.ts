import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type {
  PipelineNode,
  PipelineEdge,
  PipelineDefinition,
  NodeConfig,
  MedallionLayer,
} from '../types/pipeline.types'

// ─── Store Shape ──────────────────────────────────────────────────────────

interface PipelineState {
  pipelineName: string
  pipelineDescription: string
  schedule: string
  nodes: PipelineNode[]
  edges: PipelineEdge[]
  selectedNodeId: string | null
  isDirty: boolean
  isSaving: boolean
  saveError: string | null

  addNode: (node: PipelineNode) => void
  updateNode: (id: string, updates: Partial<PipelineNode>) => void
  updateNodeConfig: (id: string, config: Partial<NodeConfig>) => void
  updateNodePosition: (id: string, position: { x: number; y: number }) => void
  removeNode: (id: string) => void
  addEdge: (edge: PipelineEdge) => void
  removeEdge: (id: string) => void
  selectNode: (id: string | null) => void
  setPipelineName: (name: string) => void
  setPipelineDescription: (description: string) => void
  setSchedule: (schedule: string) => void
  getDefinition: () => PipelineDefinition
  setSaving: (isSaving: boolean) => void
  setSaveError: (error: string | null) => void
  resetDirty: () => void
  reset: () => void
}

// ─── ID Generator ─────────────────────────────────────────────────────────

export function generateId(): string {
  return `node_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

// ─── Initial State ────────────────────────────────────────────────────────

const initialState = {
  pipelineName: 'Nouveau pipeline',
  pipelineDescription: '',
  schedule: '',
  nodes: [] as PipelineNode[],
  edges: [] as PipelineEdge[],
  selectedNodeId: null,
  isDirty: false,
  isSaving: false,
  saveError: null,
}

// ─── Store ────────────────────────────────────────────────────────────────

export const usePipelineStore = create<PipelineState>()(
  devtools(
    (set, get) => ({
      ...initialState,

      addNode: (node) =>
        set((s) => ({ nodes: [...s.nodes, node], isDirty: true }), false, 'addNode'),

      updateNode: (id, updates) =>
        set(
          (s) => ({ nodes: s.nodes.map((n) => (n.id === id ? { ...n, ...updates } : n)), isDirty: true }),
          false, 'updateNode'
        ),

      updateNodeConfig: (id, config) =>
        set(
          (s) => ({
            nodes: s.nodes.map((n) =>
              n.id === id ? { ...n, config: { ...n.config, ...config }, isValid: undefined } : n
            ),
            isDirty: true,
          }),
          false, 'updateNodeConfig'
        ),

      updateNodePosition: (id, position) =>
        set(
          (s) => ({ nodes: s.nodes.map((n) => (n.id === id ? { ...n, position } : n)), isDirty: true }),
          false, 'updateNodePosition'
        ),

      removeNode: (id) =>
        set(
          (s) => ({
            nodes: s.nodes.filter((n) => n.id !== id),
            edges: s.edges.filter((e) => e.source !== id && e.target !== id),
            selectedNodeId: s.selectedNodeId === id ? null : s.selectedNodeId,
            isDirty: true,
          }),
          false, 'removeNode'
        ),

      addEdge: (edge) =>
        set(
          (s) => {
            const exists = s.edges.some((e) => e.source === edge.source && e.target === edge.target)
            if (exists) return s

            const sourceNode = s.nodes.find((n) => n.id === edge.source)
            const layer: MedallionLayer =
              sourceNode?.layer === 'bronze' ? 'silver'
              : sourceNode?.layer === 'silver' ? 'gold'
              : 'gold'

            const updatedNodes = s.nodes.map((n) =>
              n.id === edge.target ? { ...n, layer } : n
            )

            return { edges: [...s.edges, { ...edge, layer }], nodes: updatedNodes, isDirty: true }
          },
          false, 'addEdge'
        ),

      removeEdge: (id) =>
        set((s) => ({ edges: s.edges.filter((e) => e.id !== id), isDirty: true }), false, 'removeEdge'),

      selectNode: (id) => set({ selectedNodeId: id }, false, 'selectNode'),

      setPipelineName: (name) => set({ pipelineName: name, isDirty: true }, false, 'setPipelineName'),

      setPipelineDescription: (description) =>
        set({ pipelineDescription: description, isDirty: true }, false, 'setPipelineDescription'),

      setSchedule: (schedule) => set({ schedule, isDirty: true }, false, 'setSchedule'),

      getDefinition: (): PipelineDefinition => {
        const { pipelineName, pipelineDescription, nodes, edges, schedule } = get()
        return {
          name: pipelineName,
          description: pipelineDescription,
          nodes,
          edges,
          schedule: schedule || undefined,
        }
      },

      setSaving: (isSaving) => set({ isSaving }, false, 'setSaving'),
      setSaveError: (saveError) => set({ saveError }, false, 'setSaveError'),
      resetDirty: () => set({ isDirty: false }, false, 'resetDirty'),
      reset: () => set(initialState, false, 'reset'),
    }),
    { name: 'PipelineStore' }
  )
)

// ─── Selectors ────────────────────────────────────────────────────────────

export const selectSelectedNode = (s: PipelineState) =>
  s.nodes.find((n) => n.id === s.selectedNodeId) ?? null

export const selectIsCanvasEmpty = (s: PipelineState) => s.nodes.length === 0