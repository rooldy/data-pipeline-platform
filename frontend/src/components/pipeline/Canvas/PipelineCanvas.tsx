import React, { useCallback, useRef } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
  type OnConnect,
  type Connection,
  type Node,
  type Edge,
  type ReactFlowInstance,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { usePipelineStore, generateId } from '../../../store/pipelineStore'
import type { PipelineNode, PipelineEdge, MedallionLayer, NodeConfig } from '../../../types/pipeline.types'
import SourceNode    from './nodes/SourceNode'
import TransformNode from './nodes/TransformNode'
import OutputNode    from './nodes/OutputNode'
import './PipelineCanvas.css'

const nodeTypes = {
  source:    SourceNode,
  transform: TransformNode,
  output:    OutputNode,
}

const LAYER_COLORS: Record<MedallionLayer, string> = {
  bronze: '#a16207',
  silver: '#6b7280',
  gold:   '#d97706',
}

function EmptyCanvasHint() {
  return (
    <div className="canvas-empty-hint" aria-hidden="true">
      <div className="canvas-empty-hint__icon">⬡</div>
      <p className="canvas-empty-hint__text">
        Glisse un nœud depuis la palette pour commencer
      </p>
    </div>
  )
}

export default function PipelineCanvas() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [rfInstance, setRfInstance] = React.useState<ReactFlowInstance | null>(null)

  const storeNodes   = usePipelineStore((s) => s.nodes)
  const addStoreNode = usePipelineStore((s) => s.addNode)
  const addStoreEdge = usePipelineStore((s) => s.addEdge)
  const removeNode   = usePipelineStore((s) => s.removeNode)
  const removeEdge   = usePipelineStore((s) => s.removeEdge)
  const selectNode   = usePipelineStore((s) => s.selectNode)
  const updatePos    = usePipelineStore((s) => s.updateNodePosition)

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  const onConnect: OnConnect = useCallback(
    (connection: Connection) => {
      const edgeId = `edge_${connection.source}_${connection.target}`
      const newEdge: PipelineEdge = {
        id: edgeId,
        source: connection.source!,
        target: connection.target!,
        sourceHandle: connection.sourceHandle ?? undefined,
        targetHandle: connection.targetHandle ?? undefined,
        layer: 'bronze',
      }
      addStoreEdge(newEdge)
      const rfEdge: Edge = {
        id: edgeId,
        source: connection.source!,
        target: connection.target!,
        sourceHandle: connection.sourceHandle,
        targetHandle: connection.targetHandle,
        style: { stroke: LAYER_COLORS['bronze'], strokeWidth: 2 },
        animated: true,
      }
      setEdges((eds) => addEdge(rfEdge, eds))
    },
    [addStoreEdge, setEdges]
  )

  const onNodeDragStop = useCallback(
    (_: React.MouseEvent, node: Node) => { updatePos(node.id, node.position) },
    [updatePos]
  )

  const onNodesDelete = useCallback(
    (deleted: Node[]) => { deleted.forEach((n) => removeNode(n.id)) },
    [removeNode]
  )

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => { deleted.forEach((e) => removeEdge(e.id)) },
    [removeEdge]
  )

  const onNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => { selectNode(node.id) },
    [selectNode]
  )

  const onPaneClick = useCallback(() => { selectNode(null) }, [selectNode])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()
      if (!rfInstance || !reactFlowWrapper.current) return

      const raw = event.dataTransfer.getData('application/pipeline-node')
      if (!raw) return

      let paletteItem: {
        kind: string
        subtype: string
        label: string
        defaultLayer: MedallionLayer
        defaultConfig: NodeConfig
      }
      try { paletteItem = JSON.parse(raw) }
      catch { console.error('Invalid drag data'); return }

      const bounds = reactFlowWrapper.current.getBoundingClientRect()
      const position = rfInstance.screenToFlowPosition({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      })

      const id = generateId()
      const newNode: PipelineNode = {
        id,
        kind:    paletteItem.kind    as PipelineNode['kind'],
        subtype: paletteItem.subtype as PipelineNode['subtype'],
        label:   paletteItem.label,
        layer:   paletteItem.defaultLayer,
        config:  paletteItem.defaultConfig,
        position,
      }

      addStoreNode(newNode)
      setNodes((nds) => [
        ...nds,
        {
          id,
          type: newNode.kind,
          position,
          data: {
            label:   newNode.label,
            subtype: newNode.subtype,
            layer:   newNode.layer,
            config:  newNode.config,
          },
        } as Node,
      ])
    },
    [rfInstance, addStoreNode, setNodes]
  )

  const isEmpty = storeNodes.length === 0

  return (
    <div ref={reactFlowWrapper} className="pipeline-canvas">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStop={onNodeDragStop}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onInit={setRfInstance}
        deleteKeyCode="Delete"
        fitView
        snapToGrid
        snapGrid={[16, 16]}
        proOptions={{ hideAttribution: true }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1.5} />
        <Controls className="canvas-controls" />
        <MiniMap
          className="canvas-minimap"
          nodeColor={(n) => LAYER_COLORS[(n.data?.layer as MedallionLayer) ?? 'bronze']}
          maskColor="rgba(15, 17, 23, 0.7)"
        />
      </ReactFlow>
      {isEmpty && <EmptyCanvasHint />}
    </div>
  )
}