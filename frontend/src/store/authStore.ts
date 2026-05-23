import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface AuthUser {
  username:  string
  role:      string
  full_name: string
  token:     string
}

interface AuthState {
  user:      AuthUser | null
  isLoading: boolean
  error:     string | null
  login:     (user: AuthUser) => void
  logout:    () => void
  setError:  (error: string | null) => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user:      null,
        isLoading: false,
        error:     null,
        login:     (user) => set({ user, error: null }),
        logout:    () => set({ user: null }),
        setError:  (error) => set({ error }),
      }),
      { name: 'auth-store' }
    )
  )
)

export const selectIsAuthenticated = (s: AuthState) => !!s.user
export const selectIsAdmin = (s: AuthState) => s.user?.role === 'admin'