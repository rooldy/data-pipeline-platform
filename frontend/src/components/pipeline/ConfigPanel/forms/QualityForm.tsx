import type { QualityRule, QualityRuleType } from '../../../../types/pipeline.types'

interface Props {
  config: Record<string, unknown>
  onChange: (config: Record<string, unknown>) => void
}

const RULE_TYPES: { value: QualityRuleType; label: string; desc: string }[] = [
  { value: 'not_null',  label: 'Not Null',  desc: 'Vérifie que les valeurs ne sont pas nulles' },
  { value: 'regex',     label: 'Regex',     desc: 'Vérifie que les valeurs correspondent à un pattern' },
  { value: 'range',     label: 'Range',     desc: 'Vérifie que les valeurs sont dans un intervalle' },
  { value: 'in_set',    label: 'In Set',    desc: "Vérifie que les valeurs sont dans un ensemble" },
]

function generateRuleId() {
  return `rule_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`
}

export default function QualityForm({ config, onChange }: Props) {
  const rules         = (config.rules as QualityRule[]) ?? []
  const failOnError   = (config.fail_on_error as boolean) ?? true

  const addRule = () => {
    const newRule: QualityRule = {
      id: generateRuleId(), column: '', rule_type: 'not_null', threshold: 100,
    }
    onChange({ ...config, rules: [...rules, newRule] })
  }

  const updateRule = (id: string, updates: Partial<QualityRule>) => {
    onChange({
      ...config,
      rules: rules.map((r) => r.id === id ? { ...r, ...updates } : r),
    })
  }

  const removeRule = (id: string) => {
    onChange({ ...config, rules: rules.filter((r) => r.id !== id) })
  }

  return (
    <>
      <div className="config-form__section">
        <p className="config-form__section-title">Comportement</p>
        <label className="config-toggle">
          <input
            type="checkbox"
            className="config-toggle__input"
            checked={failOnError}
            onChange={(e) => onChange({ ...config, fail_on_error: e.target.checked })}
          />
          <span className="config-toggle__label">
            Bloquer le pipeline si une règle échoue
          </span>
        </label>
        <span className="config-field__hint">
          Si désactivé, les erreurs sont loggées mais le pipeline continue
        </span>
      </div>

      <div className="config-form__section">
        <p className="config-form__section-title">Règles de qualité</p>

        {rules.length === 0 && (
          <p className="config-field__hint" style={{ textAlign: 'center', padding: '0.5rem' }}>
            Aucune règle — ajoute-en une ci-dessous
          </p>
        )}

        {rules.map((rule, i) => (
          <div key={rule.id} style={{
            background: 'rgba(255,255,255,0.04)',
            borderRadius: 8,
            padding: '0.75rem',
            marginBottom: '0.625rem',
            border: '1px solid rgba(255,255,255,0.08)',
          }}>
            {/* Header règle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#8b5cf6' }}>
                Règle {i + 1}
              </span>
              <button onClick={() => removeRule(rule.id)} style={{
                background: 'rgba(248,113,113,0.15)', border: '1px solid rgba(248,113,113,0.3)',
                color: '#f87171', borderRadius: 4, padding: '1px 6px', cursor: 'pointer', fontSize: '0.75rem',
              }}>✕</button>
            </div>

            {/* Type + Colonne */}
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
              <select className="config-field__select" style={{ flex: 1 }}
                value={rule.rule_type}
                onChange={(e) => updateRule(rule.id, { rule_type: e.target.value as QualityRuleType })}>
                {RULE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <input className="config-field__input" placeholder="colonne" style={{ flex: 1 }}
                value={rule.column}
                onChange={(e) => updateRule(rule.id, { column: e.target.value.trim() })} />
            </div>

            {/* Paramètres selon le type */}
            {rule.rule_type === 'regex' && (
              <input className="config-field__input" placeholder="^[\w\.-]+@[\w\.-]+\.\w+$"
                value={rule.pattern ?? ''}
                onChange={(e) => updateRule(rule.id, { pattern: e.target.value })}
                style={{ marginBottom: '0.4rem' }} />
            )}

            {rule.rule_type === 'range' && (
              <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
                <input className="config-field__input" placeholder="min" type="number" style={{ flex: 1 }}
                  value={rule.min_value ?? ''}
                  onChange={(e) => updateRule(rule.id, { min_value: e.target.value ? parseFloat(e.target.value) : undefined })} />
                <input className="config-field__input" placeholder="max" type="number" style={{ flex: 1 }}
                  value={rule.max_value ?? ''}
                  onChange={(e) => updateRule(rule.id, { max_value: e.target.value ? parseFloat(e.target.value) : undefined })} />
              </div>
            )}

            {rule.rule_type === 'in_set' && (
              <div style={{ marginBottom: '0.4rem' }}>
                <input className="config-field__input"
                  placeholder="val1,val2,val3"
                  value={Array.isArray(rule.values) ? rule.values.join(',') : (rule.values ?? '')}
                  onChange={(e) => updateRule(rule.id, {
                    values: e.target.value.split(',').map((v) => v.trim()).filter(Boolean)
                  })} />
                <span className="config-field__hint">Valeurs séparées par des virgules</span>
              </div>
            )}

            {/* Seuil */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', color: '#8b90a0', minWidth: '60px' }}>
                Seuil min
              </span>
              <input className="config-field__input" type="number" min="0" max="100"
                style={{ flex: 1 }}
                value={rule.threshold}
                onChange={(e) => updateRule(rule.id, { threshold: parseFloat(e.target.value) || 0 })} />
              <span style={{ fontSize: '0.75rem', color: '#8b90a0' }}>%</span>
            </div>
          </div>
        ))}

        <button onClick={addRule} style={{
          width: '100%', padding: '0.375rem',
          background: 'rgba(139,92,246,0.1)',
          border: '1px dashed rgba(139,92,246,0.4)',
          borderRadius: 6, color: '#c4b5fd', cursor: 'pointer', fontSize: '0.8125rem',
        }}>
          + Ajouter une règle
        </button>
      </div>
    </>
  )
}