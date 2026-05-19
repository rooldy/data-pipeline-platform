import type { NodeSubtype } from '../../../../types/pipeline.types'

interface Props {
  subtype: NodeSubtype
  config: Record<string, unknown>
  onChange: (config: Record<string, unknown>) => void
}

function DeltaLakeForm({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <div className="config-form__section">
      <p className="config-form__section-title">Delta Lake</p>
      <div className="config-field">
        <label className="config-field__label">Chemin S3 <span className="config-field__required">*</span></label>
        <input className="config-field__input" placeholder="s3a://bucket/path/table"
          value={(config.path as string) ?? ''}
          onChange={(e) => onChange({ ...config, path: e.target.value })} />
      </div>
      <div className="config-field">
        <label className="config-field__label">Nom de la table <span className="config-field__required">*</span></label>
        <input className="config-field__input" placeholder="gold.sales_aggregated"
          value={(config.table_name as string) ?? ''}
          onChange={(e) => onChange({ ...config, table_name: e.target.value })} />
      </div>
      <div className="config-field">
        <label className="config-field__label">Mode d'écriture</label>
        <select className="config-field__select"
          value={(config.mode as string) ?? 'append'}
          onChange={(e) => onChange({ ...config, mode: e.target.value })}>
          <option value="append">Append</option>
          <option value="overwrite">Overwrite</option>
          <option value="merge">Merge (upsert)</option>
        </select>
      </div>
      {config.mode === 'merge' && (
        <div className="config-field">
          <label className="config-field__label">Clé de merge <span className="config-field__required">*</span></label>
          <input className="config-field__input" placeholder="id"
            value={(config.merge_key as string) ?? ''}
            onChange={(e) => onChange({ ...config, merge_key: e.target.value })} />
        </div>
      )}
    </div>
  )
}

function PostgreSQLOutputForm({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <>
      <div className="config-form__section">
        <p className="config-form__section-title">Connexion</p>
        <div className="config-field">
          <label className="config-field__label">Hôte <span className="config-field__required">*</span></label>
          <input className="config-field__input" placeholder="localhost"
            value={(config.host as string) ?? ''}
            onChange={(e) => onChange({ ...config, host: e.target.value })} />
        </div>
        <div className="config-field">
          <label className="config-field__label">Port</label>
          <input className="config-field__input" type="number" placeholder="5432"
            value={(config.port as number) ?? 5432}
            onChange={(e) => onChange({ ...config, port: parseInt(e.target.value) })} />
        </div>
        <div className="config-field">
          <label className="config-field__label">Base de données <span className="config-field__required">*</span></label>
          <input className="config-field__input" placeholder="my_database"
            value={(config.database as string) ?? ''}
            onChange={(e) => onChange({ ...config, database: e.target.value })} />
        </div>
      </div>
      <div className="config-form__section">
        <p className="config-form__section-title">Destination</p>
        <div className="config-field">
          <label className="config-field__label">Schéma</label>
          <input className="config-field__input" placeholder="public"
            value={(config.schema as string) ?? 'public'}
            onChange={(e) => onChange({ ...config, schema: e.target.value })} />
        </div>
        <div className="config-field">
          <label className="config-field__label">Table <span className="config-field__required">*</span></label>
          <input className="config-field__input" placeholder="gold_sales"
            value={(config.table as string) ?? ''}
            onChange={(e) => onChange({ ...config, table: e.target.value })} />
        </div>
        <div className="config-field">
          <label className="config-field__label">Mode d'écriture</label>
          <select className="config-field__select"
            value={(config.mode as string) ?? 'append'}
            onChange={(e) => onChange({ ...config, mode: e.target.value })}>
            <option value="append">Append</option>
            <option value="overwrite">Overwrite</option>
            <option value="upsert">Upsert</option>
          </select>
        </div>
        {config.mode === 'upsert' && (
          <div className="config-field">
            <label className="config-field__label">Clés d'upsert <span className="config-field__required">*</span></label>
            <input className="config-field__input" placeholder="id,date"
              value={((config.upsert_keys as string[]) ?? []).join(',')}
              onChange={(e) => onChange({ ...config, upsert_keys: e.target.value.split(',').map((s) => s.trim()) })} />
            <span className="config-field__hint">Sépare les clés par des virgules</span>
          </div>
        )}
      </div>
    </>
  )
}

export default function OutputForm({ subtype, config, onChange }: Props) {
  switch (subtype) {
    case 'delta_lake': return <DeltaLakeForm       config={config} onChange={onChange} />
    case 'postgresql': return <PostgreSQLOutputForm config={config} onChange={onChange} />
    default:           return <p style={{ color: '#8b90a0', fontSize: '0.8rem' }}>Type non supporté</p>
  }
}