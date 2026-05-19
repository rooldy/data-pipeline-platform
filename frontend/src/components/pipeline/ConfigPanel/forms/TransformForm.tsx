import type { AggregateConfig, CastConfig, NodeSubtype } from '../../../../types/pipeline.types'

interface Props {
  subtype: NodeSubtype
  config: Record<string, unknown>
  onChange: (config: Record<string, unknown>) => void
}

function FilterForm({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const op = (config.operator as string) ?? '=='
  const noValue = op === 'is_null' || op === 'is_not_null'

  return (
    <div className="config-form__section">
      <p className="config-form__section-title">Condition</p>
      <div className="config-field">
        <label className="config-field__label">Colonne <span className="config-field__required">*</span></label>
        <input className="config-field__input" placeholder="amount"
          value={(config.column as string) ?? ''}
          onChange={(e) => onChange({ ...config, column: e.target.value })} />
      </div>
      <div className="config-field">
        <label className="config-field__label">Opérateur</label>
        <select className="config-field__select" value={op}
          onChange={(e) => onChange({ ...config, operator: e.target.value })}>
          <option value="==">== (égal)</option>
          <option value="!=">!= (différent)</option>
          <option value=">">&gt; (supérieur)</option>
          <option value=">=">&gt;= (supérieur ou égal)</option>
          <option value="<">&lt; (inférieur)</option>
          <option value="<=">&lt;= (inférieur ou égal)</option>
          <option value="in">in (dans la liste)</option>
          <option value="is_null">is_null</option>
          <option value="is_not_null">is_not_null</option>
        </select>
      </div>
      {!noValue && (
        <div className="config-field">
          <label className="config-field__label">Valeur <span className="config-field__required">*</span></label>
          <input className="config-field__input"
            placeholder={op === 'in' ? 'val1,val2,val3' : '100'}
            value={(config.value as string) ?? ''}
            onChange={(e) => onChange({ ...config, value: e.target.value })} />
          {op === 'in' && <span className="config-field__hint">Sépare les valeurs par des virgules</span>}
        </div>
      )}
    </div>
  )
}

function AggregateForm({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const groupBy = (config.group_by as string[]) ?? []
  const aggs    = (config.aggregations as AggregateConfig['aggregations']) ?? []

  const addAgg = () => onChange({ ...config, aggregations: [...aggs, { column: '', function: 'sum', alias: '' }] })
  const updateAgg = (i: number, key: string, value: string) =>
    onChange({ ...config, aggregations: aggs.map((a, idx) => idx === i ? { ...a, [key]: value } : a) })
  const removeAgg = (i: number) =>
    onChange({ ...config, aggregations: aggs.filter((_, idx) => idx !== i) })

  return (
    <>
      <div className="config-form__section">
        <p className="config-form__section-title">Group By</p>
        <div className="config-field">
          <label className="config-field__label">Colonnes <span className="config-field__required">*</span></label>
          <input className="config-field__input" placeholder="region,category"
            value={groupBy.join(',')}
            onChange={(e) => onChange({ ...config, group_by: e.target.value.split(',').map((s) => s.trim()).filter(Boolean) })} />
          <span className="config-field__hint">Sépare les colonnes par des virgules</span>
        </div>
      </div>
      <div className="config-form__section">
        <p className="config-form__section-title">Agrégations</p>
        {aggs.map((agg, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 6, padding: '0.5rem', marginBottom: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <input className="config-field__input" placeholder="colonne" style={{ flex: 1 }}
                value={agg.column} onChange={(e) => updateAgg(i, 'column', e.target.value)} />
              <select className="config-field__select" style={{ flex: 1 }}
                value={agg.function} onChange={(e) => updateAgg(i, 'function', e.target.value)}>
                {['sum','avg','count','min','max','count_distinct'].map((f) => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
              <input className="config-field__input" placeholder="alias" style={{ flex: 1 }}
                value={agg.alias} onChange={(e) => updateAgg(i, 'alias', e.target.value)} />
              <button onClick={() => removeAgg(i)}
                style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', borderRadius: 6, padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}>✕</button>
            </div>
          </div>
        ))}
        <button onClick={addAgg}
          style={{ width: '100%', padding: '0.375rem', background: 'rgba(99,102,241,0.1)', border: '1px dashed rgba(99,102,241,0.4)', borderRadius: 6, color: '#a5b4fc', cursor: 'pointer', fontSize: '0.8125rem' }}>
          + Ajouter une agrégation
        </button>
      </div>
    </>
  )
}

function JoinForm({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <div className="config-form__section">
      <p className="config-form__section-title">Jointure</p>
      <div className="config-field">
        <label className="config-field__label">Type de jointure</label>
        <select className="config-field__select"
          value={(config.join_type as string) ?? 'inner'}
          onChange={(e) => onChange({ ...config, join_type: e.target.value })}>
          <option value="inner">INNER JOIN</option>
          <option value="left">LEFT JOIN</option>
          <option value="right">RIGHT JOIN</option>
          <option value="full">FULL OUTER JOIN</option>
        </select>
      </div>
      <div className="config-field">
        <label className="config-field__label">Clé gauche <span className="config-field__required">*</span></label>
        <input className="config-field__input" placeholder="customer_id"
          value={(config.left_key as string) ?? ''}
          onChange={(e) => onChange({ ...config, left_key: e.target.value })} />
      </div>
      <div className="config-field">
        <label className="config-field__label">Clé droite <span className="config-field__required">*</span></label>
        <input className="config-field__input" placeholder="id"
          value={(config.right_key as string) ?? ''}
          onChange={(e) => onChange({ ...config, right_key: e.target.value })} />
      </div>
    </div>
  )
}

function CastForm({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  const columns = (config.columns as CastConfig['columns']) ?? []
  const addCol = () => onChange({ ...config, columns: [...columns, { name: '', target_type: 'string' }] })
  const updateCol = (i: number, key: string, value: string) =>
    onChange({ ...config, columns: columns.map((c, idx) => idx === i ? { ...c, [key]: value } : c) })
  const removeCol = (i: number) =>
    onChange({ ...config, columns: columns.filter((_, idx) => idx !== i) })

  return (
    <div className="config-form__section">
      <p className="config-form__section-title">Conversions de types</p>
      {columns.map((col, i) => (
        <div key={i} style={{ display: 'flex', gap: '0.4rem', alignItems: 'center', marginBottom: '0.4rem' }}>
          <input className="config-field__input" placeholder="colonne" style={{ flex: 1 }}
            value={col.name} onChange={(e) => updateCol(i, 'name', e.target.value)} />
          <select className="config-field__select" style={{ flex: 1 }}
            value={col.target_type} onChange={(e) => updateCol(i, 'target_type', e.target.value)}>
            {['string','integer','float','boolean','date','timestamp'].map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <button onClick={() => removeCol(i)}
            style={{ background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)', color: '#f87171', borderRadius: 6, padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}>✕</button>
        </div>
      ))}
      <button onClick={addCol}
        style={{ width: '100%', padding: '0.375rem', background: 'rgba(99,102,241,0.1)', border: '1px dashed rgba(99,102,241,0.4)', borderRadius: 6, color: '#a5b4fc', cursor: 'pointer', fontSize: '0.8125rem' }}>
        + Ajouter une colonne
      </button>
    </div>
  )
}

export default function TransformForm({ subtype, config, onChange }: Props) {
  switch (subtype) {
    case 'filter':    return <FilterForm    config={config} onChange={onChange} />
    case 'aggregate': return <AggregateForm config={config} onChange={onChange} />
    case 'join':      return <JoinForm      config={config} onChange={onChange} />
    case 'cast':      return <CastForm      config={config} onChange={onChange} />
    default:          return <p style={{ color: '#8b90a0', fontSize: '0.8rem' }}>Type non supporté</p>
  }
}