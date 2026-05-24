import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../../../store/authStore'

export default function UserMenu() {
  const user     = useAuthStore((s) => s.user)
  const logout   = useAuthStore((s) => s.logout)
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  if (!user) return null

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f1f3f9' }}>
          {user.full_name}
        </div>
        <div style={{
          fontSize: '0.6875rem', color: '#6366f1',
          background: 'rgba(99,102,241,0.15)',
          padding: '1px 6px', borderRadius: '999px', display: 'inline-block',
        }}>
          {user.role}
        </div>
      </div>
      <button onClick={handleLogout} style={{
        background: 'rgba(239,68,68,0.1)',
        border: '1px solid rgba(239,68,68,0.3)',
        color: '#fca5a5',
        borderRadius: '8px',
        padding: '0.375rem 0.75rem',
        fontSize: '0.8125rem',
        fontWeight: 500,
        cursor: 'pointer',
        fontFamily: 'DM Sans, system-ui, sans-serif',
        transition: 'background 0.15s',
      }}>
        🚪 Déconnexion
      </button>
    </div>
  )
}