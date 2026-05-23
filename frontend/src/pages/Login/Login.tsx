import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../../api/auth.api'
import { useAuthStore } from '../../store/authStore'
import './Login.css'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)

  const loginStore = useAuthStore((s) => s.login)
  const navigate   = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) { setError('Remplis tous les champs'); return }

    setLoading(true)
    setError(null)

    try {
      const data = await login(username, password)
      loginStore({
        username:  data.username,
        role:      data.role,
        full_name: data.full_name,
        token:     data.access_token,
      })
      navigate('/')
    } catch (err: unknown) {
      const axiosErr = err as { response?: { status?: number; data?: { detail?: string } } }
      if (axiosErr?.response?.status === 401) {
        setError('Identifiants incorrects')
      } else if (axiosErr?.response?.data?.detail){
        setError(axiosErr.response.data.detail)
      } else {
        setError('Impossible de contacter le serveur')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__logo">⬡</div>
        <h1 className="login-card__title">Data Pipeline Platform</h1>
        <p className="login-card__subtitle">Connectez-vous pour accéder à la plateforme</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-field__label">Nom d'utilisateur</label>
            <input
              className="login-field__input"
              type="text"
              placeholder="admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              autoFocus
            />
          </div>
          <div className="login-field">
            <label className="login-field__label">Mot de passe</label>
            <input
              className="login-field__input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>
          {error && <div className="login-error">⚠️ {error}</div>}
          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? <><span className="login-btn__spinner" />Connexion…</> : '🔐 Se connecter'}
          </button>
        </form>

        <div className="login-card__hint">
          <p>Comptes disponibles</p>
          <div className="login-credentials">
            <div className="login-credential">
              <span>admin</span><span>admin123 — Administrateur</span>
            </div>
            <div className="login-credential">
              <span>analyst</span><span>analyst123 — Viewer</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}