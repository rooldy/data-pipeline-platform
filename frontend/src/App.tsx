import React, { useEffect, useState } from 'react'
import axios from 'axios'

interface ApiInfo {
  message: string
  version: string
  status: string
  architecture: string
}

function App() {
  const [apiInfo, setApiInfo] = useState<ApiInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchApiInfo = async () => {
      try {
        const response = await axios.get('http://localhost:8000/')
        setApiInfo(response.data)
        setLoading(false)
      } catch (err) {
        setError('Failed to connect to backend')
        setLoading(false)
      }
    }

    fetchApiInfo()
  }, [])

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>🚀 Data Pipeline Platform</h1>
        <p style={styles.subtitle}>Architecture Medallion - Bronze / Silver / Gold</p>
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
            <div style={styles.layer}>
              <span style={styles.layerIcon}>🥉</span>
              <div>
                <strong>Bronze</strong>
                <p style={styles.layerDesc}>Raw data ingestion</p>
              </div>
            </div>
            <div style={styles.layer}>
              <span style={styles.layerIcon}>🥈</span>
              <div>
                <strong>Silver</strong>
                <p style={styles.layerDesc}>Cleaned & validated data</p>
              </div>
            </div>
            <div style={styles.layer}>
              <span style={styles.layerIcon}>🥇</span>
              <div>
                <strong>Gold</strong>
                <p style={styles.layerDesc}>Business-ready aggregations</p>
              </div>
            </div>
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
    margin: 0,
    opacity: 0.9,
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
  error: {
    color: '#e74c3c',
    fontWeight: 'bold',
  },
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
  layerIcon: {
    fontSize: '2rem',
  },
  layerDesc: {
    margin: '0.25rem 0 0 0',
    color: '#666',
    fontSize: '0.9rem',
  },
  stepsList: {
    paddingLeft: '1.5rem',
    lineHeight: '2',
    color: '#555',
  },
}

export default App
