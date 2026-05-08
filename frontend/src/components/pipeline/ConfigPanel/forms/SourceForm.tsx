import React from 'react'
import type { CsvConfig, PostgreSQLSourceConfig, ApiRestConfig, S3Config, NodeSubtype } from '../../../../types/pipeline.types'

interface Props {
  subtype: NodeSubtype
  config: Record<string, unknown>
  onChange: (config: Record<string, unknown>) => void
}

function CsvForm({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <div className="config-form__section">
      <p className="config-form__section-title">Fichier</p>
      <div className="config-field">
        <label className="config-field__label">Chemin <span className="config-field__required">*</span></label>
        <input className="config-field__input" placeholder="/data/sales.csv"
          value={(config.path as string) ?? ''}
          onChange={(e) => onChange({ ...config, path: e.target.value })} />
      </div>
      <div className="config-field">
        <label className="config-field__label">Délimiteur</label>
        <select className="config-field__select"
          value={(config.delimiter as string) ?? ','}
          onChange={(e) => onChange({ ...config, delimiter: e.target.value })}>
          <option value=",">Virgule ( , )</option>
          <option value=";">Point-virgule ( ; )</option>
          <option value="\t">Tabulation ( \t )</option>
        </select>
      </div>
      <label className="config-toggle">
        <input type="checkbox" className="config-toggle__input"
          checked={(config.has_header as boolean) ?? true}
          onChange={(e) => onChange({ ...config, has_header: e.target.checked })} />
        <span className="config-toggle__label">Première ligne = en-tête</span>
      </label>
    </div>
  )
}

function PostgreSQLSourceForm({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
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
        <p className="config-form__section-title">Table</p>
        <div className="config-field">
          <label className="config-field__label">Schéma</label>
          <input className="config-field__input" placeholder="public"
            value={(config.schema as string) ?? 'public'}
            onChange={(e) => onChange({ ...config, schema: e.target.value })} />
        </div>
        <div className="config-field">
          <label className="config-field__label">Table <span className="config-field__required">*</span></label>
          <input className="config-field__input" placeholder="orders"
            value={(config.table as string) ?? ''}
            onChange={(e) => onChange({ ...config, table: e.target.value })} />
        </div>
        <div className="config-field">
          <label className="config-field__label">Requête SQL (optionnel)</label>
          <textarea className="config-field__textarea" placeholder="SELECT * FROM orders WHERE ..."
            value={(config.query as string) ?? ''}
            onChange={(e) => onChange({ ...config, query: e.target.value })} />
          <span className="config-field__hint">Surcharge la table si définie</span>
        </div>
      </div>
    </>
  )
}

function ApiRestForm({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <>
      <div className="config-form__section">
        <p className="config-form__section-title">Endpoint</p>
        <div className="config-field">
          <label className="config-field__label">URL <span className="config-field__required">*</span></label>
          <input className="config-field__input" placeholder="https://api.example.com/data"
            value={(config.url as string) ?? ''}
            onChange={(e) => onChange({ ...config, url: e.target.value })} />
        </div>
        <div className="config-field">
          <label className="config-field__label">Méthode</label>
          <select className="config-field__select"
            value={(config.method as string) ?? 'GET'}
            onChange={(e) => onChange({ ...config, method: e.target.value })}>
            <option value="GET">GET</option>
            <option value="POST">POST</option>
          </select>
        </div>
      </div>
      <div className="config-form__section">
        <p className="config-form__section-title">Authentification</p>
        <div className="config-field">
          <label className="config-field__label">Type</label>
          <select className="config-field__select"
            value={(config.auth_type as string) ?? 'none'}
            onChange={(e) => onChange({ ...config, auth_type: e.target.value })}>
            <option value="none">Aucune</option>
            <option value="bearer">Bearer Token</option>
            <option value="basic">Basic Auth</option>
          </select>
        </div>
        {!!(config.auth_type) && config.auth_type !== 'none' && (
          <div className="config-field">
            <label className="config-field__label">Token</label>
            <input className="config-field__input" type="password" placeholder="••••••••"
              value={(config.token as string) ?? ''}
              onChange={(e) => onChange({ ...config, token: e.target.value })} />
          </div>
        )}
      </div>
    </>
  )
}

function S3Form({ config, onChange }: { config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }) {
  return (
    <div className="config-form__section">
      <p className="config-form__section-title">Bucket</p>
      <div className="config-field">
        <label className="config-field__label">Nom du bucket <span className="config-field__required">*</span></label>
        <input className="config-field__input" placeholder="my-data-bucket"
          value={(config.bucket as string) ?? ''}
          onChange={(e) => onChange({ ...config, bucket: e.target.value })} />
      </div>
      <div className="config-field">
        <label className="config-field__label">Préfixe / Chemin</label>
        <input className="config-field__input" placeholder="raw/2024/"
          value={(config.prefix as string) ?? ''}
          onChange={(e) => onChange({ ...config, prefix: e.target.value })} />
      </div>
      <div className="config-field">
        <label className="config-field__label">Région</label>
        <select className="config-field__select"
          value={(config.region as string) ?? 'eu-west-1'}
          onChange={(e) => onChange({ ...config, region: e.target.value })}>
          {['eu-west-1','eu-west-3','eu-central-1','us-east-1','us-west-2','ap-southeast-1'].map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      </div>
      <div className="config-field">
        <label className="config-field__label">Format de fichier</label>
        <select className="config-field__select"
          value={(config.file_format as string) ?? 'parquet'}
          onChange={(e) => onChange({ ...config, file_format: e.target.value })}>
          <option value="parquet">Parquet</option>
          <option value="csv">CSV</option>
          <option value="json">JSON</option>
        </select>
      </div>
    </div>
  )
}

export default function SourceForm({ subtype, config, onChange }: Props) {
  switch (subtype) {
    case 'csv':        return <CsvForm              config={config} onChange={onChange} />
    case 'postgresql': return <PostgreSQLSourceForm config={config} onChange={onChange} />
    case 'api_rest':   return <ApiRestForm          config={config} onChange={onChange} />
    case 's3':         return <S3Form               config={config} onChange={onChange} />
    default:           return <p style={{ color: '#8b90a0', fontSize: '0.8rem' }}>Type non supporté</p>
  }
}