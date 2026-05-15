// ─── Enums & Unions ────────────────────────────────────────────────────────

export type NodeKind = 'source' | 'transform' | 'output' | 'quality'

export type SourceSubtype    = 'csv' | 'postgresql' | 'api_rest' | 's3'
export type TransformSubtype = 'filter' | 'aggregate' | 'join' | 'cast'
export type OutputSubtype    = 'delta_lake' | 'postgresql'

// Nouveau sous-type
export type QualitySubtype = 'data_quality'

// Mettre à jour NodeSubtype
export type NodeSubtype = SourceSubtype | TransformSubtype | OutputSubtype | QualitySubtype

export type MedallionLayer = 'bronze' | 'silver' | 'gold'

export type PipelineStatus = 'draft' | 'running' | 'success' | 'failed' | 'paused'

// ─── Node Configs ──────────────────────────────────────────────────────────

export interface CsvConfig {
  path: string
  delimiter?: ',' | ';' | '\t'
  has_header?: boolean
}

export interface PostgreSQLSourceConfig {
  host: string
  port: number
  database: string
  schema: string
  table: string
  query?: string
}

export interface ApiRestConfig {
  url: string
  method: 'GET' | 'POST'
  headers?: Record<string, string>
  auth_type?: 'none' | 'bearer' | 'basic'
  token?: string
}

export interface S3Config {
  bucket: string
  prefix: string
  region: string
  file_format: 'parquet' | 'csv' | 'json'
}

export interface FilterConfig {
  column: string
  operator: '==' | '!=' | '>' | '>=' | '<' | '<=' | 'in' | 'is_null' | 'is_not_null'
  value?: string | number | boolean | string[]
}

export interface AggregateConfig {
  group_by: string[]
  aggregations: Array<{
    column: string
    function: 'sum' | 'avg' | 'count' | 'min' | 'max' | 'count_distinct'
    alias: string
  }>
}

export interface JoinConfig {
  join_type: 'inner' | 'left' | 'right' | 'full'
  left_key: string
  right_key: string
}

export interface CastConfig {
  columns: Array<{
    name: string
    target_type: 'string' | 'integer' | 'float' | 'boolean' | 'date' | 'timestamp'
  }>
}

export interface DeltaLakeConfig {
  path: string
  table_name: string
  mode: 'append' | 'overwrite' | 'merge'
  merge_key?: string
}

export interface PostgreSQLOutputConfig {
  host: string
  port: number
  database: string
  schema: string
  table: string
  mode: 'append' | 'overwrite' | 'upsert'
  upsert_keys?: string[]
}

export type NodeConfig =
  | CsvConfig
  | PostgreSQLSourceConfig
  | ApiRestConfig
  | S3Config
  | FilterConfig
  | AggregateConfig
  | JoinConfig
  | CastConfig
  | DeltaLakeConfig
  | PostgreSQLOutputConfig
  | Record<string, unknown>

// ─── Pipeline Node & Edge ──────────────────────────────────────────────────

export interface PipelineNode {
  id: string
  kind: NodeKind
  subtype: NodeSubtype
  label: string
  layer: MedallionLayer
  config: NodeConfig
  position: { x: number; y: number }
  isValid?: boolean
  errors?: string[]
}

export interface PipelineEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
  layer: MedallionLayer
}

// ─── Pipeline Definition ───────────────────────────────────────────────────

export interface PipelineDefinition {
  id?: string
  name: string
  description?: string
  nodes: PipelineNode[]
  edges: PipelineEdge[]
  schedule?: string
  created_at?: string
  updated_at?: string
}

// ─── API Responses ─────────────────────────────────────────────────────────

export interface CreatePipelineResponse {
  id: string
  dag_id: string
  status: 'created' | 'error'
  message?: string
}

export interface PipelineRun {
  run_id: string
  pipeline_id: string
  status: PipelineStatus
  start_date?: string
  end_date?: string
  duration_seconds?: number
  rows_processed?: number
  error_message?: string
}

// ─── UI Helper ─────────────────────────────────────────────────────────────

export interface NodePaletteItem {
  kind: NodeKind
  subtype: NodeSubtype
  label: string
  description: string
  icon: string
  defaultLayer: MedallionLayer
  defaultConfig: Partial<NodeConfig>
}

// ─── Config Data Quality ───────────────────────────────────────────────────────

export type QualityRuleType = 'not_null' | 'regex' | 'range' | 'in_set'

export interface QualityRule {
  id:         string
  column:     string
  rule_type:  QualityRuleType
  threshold:  number        // 0-100 (pourcentage)
  pattern?:   string        // pour regex
  min_value?: number        // pour range
  max_value?: number        // pour range
  values?:    string[]      // pour in_set
}

export interface DataQualityConfig {
  rules:          QualityRule[]
  fail_on_error:  boolean
}