import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import axios from 'axios'
import PipelineBuilder from './components/pipeline/PipelineBuilder/PipelineBuilder'
import Monitoring from './pages/Monitoring/Monitoring'

// ─── Dashboard (page d'accueil existante) ────────────────────────────────────

interface ApiInfo {
  message: string
  version: string
  status: string
  architecture: string
}

function Dashboard() {
  const [apiInfo, setApiInfo] = useState<ApiInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    axios.get('http://localhost:8000/')
      .then((res) => { setApiInfo(res.data); setLoading(false) })
      .catch(() => { setError('Failed to connect to backend'); setLoading(false) })
  }, [])

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🚀 Data Pipeline Platform</h1>
        <p style={styles.subtitle}>Architecture Medallion - Bronze / Silver / Gold</p>

        {/* ── Lien vers le Pipeline Builder ── */}
        <Link to="/pipeline/new" style={styles.builderBtn}>
          ⬡ Ouvrir le Pipeline Builder →
        </Link>
        <Link to="/monitoring" style={styles.builderBtn}>
          📊 Ouvrir le Monitoring →
        </Link>
      </header>

      <main style={styles.main}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Status</h2>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p style={styles.error}>{error}</p>
          ) : (
            <ul style={styles.statusList}>
              <li>✅ Frontend: Running</li>
              <li>✅ Backend: Connected (v{apiInfo?.version})</li>
              <li>✅ Architecture: {apiInfo?.architecture}</li>
            </ul>
          )}
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Medallion Layers</h2>
          <div style={styles.layers}>
            {[
              { icon: '🥉', label: 'Bronze', desc: 'Raw data ingestion' },
              { icon: '🥈', label: 'Silver', desc: 'Cleaned & validated data' },
              { icon: '🥇', label: 'Gold',   desc: 'Business-ready aggregations' },
            ].map((l) => (
              <div key={l.label} style={styles.layer}>
                <span style={styles.layerIcon}>{l.icon}</span>
                <div>
                  <strong>{l.label}</strong>
                  <p style={styles.layerDesc}>{l.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Next Steps</h2>
          <ol style={styles.stepsList}>
            <li>Create your first Bronze pipeline</li>
            <li>Add transformations in Silver layer</li>
            <li>Build business metrics in Gold layer</li>
            <li>Monitor and schedule your pipelines</li>
          </ol>
        </div>
      </main>
    </div>
  )
}

// ─── App + Router ─────────────────────────────────────────────────────────────

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                element={<Dashboard />} />
        <Route path="/pipeline/new"    element={<PipelineBuilder />} />
        <Route path="/pipeline/:id"    element={<PipelineBuilder />} />
        <Route path="/monitoring" element={<Monitoring />} />
      </Routes>
    </BrowserRouter>
  )
}

// ─── Styles dashboard (inchangés) ────────────────────────────────────────────

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    padding: '3rem 2rem',
    textAlign: 'center' as const,
    color: 'white',
  },
  title: {
    fontSize: '3rem',
    margin: '0 0 0.5rem 0',
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: '1.2rem',
    margin: '0 0 1.5rem 0',
    opacity: 0.9,
  },
  builderBtn: {
    display: 'inline-block',
    marginTop: '0.5rem',
    padding: '0.75rem 1.75rem',
    background: 'rgba(255,255,255,0.15)',
    border: '2px solid rgba(255,255,255,0.5)',
    borderRadius: '10px',
    color: 'white',
    fontWeight: '600',
    fontSize: '1rem',
    textDecoration: 'none',
    backdropFilter: 'blur(8px)',
    transition: 'background 0.2s',
  },
  main: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '2rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '2rem',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    padding: '2rem',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
  },
  cardTitle: {
    margin: '0 0 1.5rem 0',
    fontSize: '1.5rem',
    color: '#333',
  },
  statusList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    fontSize: '1.1rem',
    lineHeight: '2',
  },
  error: { color: '#e74c3c', fontWeight: 'bold' },
  layers: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  layer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    padding: '1rem',
    background: '#f8f9fa',
    borderRadius: '8px',
  },
  layerIcon: { fontSize: '2rem' },
  layerDesc: { margin: '0.25rem 0 0 0', color: '#666', fontSize: '0.9rem' },
  stepsList: { paddingLeft: '1.5rem', lineHeight: '2', color: '#555' },
}