import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'
const api = axios.create({ baseURL: BASE_URL, timeout: 10000 })

export interface LoginResponse {
  access_token: string
  token_type:   string
  username:     string
  role:         string
  full_name:    string
}

export interface UserInfo {
  username:  string
  role:      string
  full_name: string
  email:     string
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const form = new URLSearchParams()
  form.append('username', username)
  form.append('password', password)
  const { data } = await api.post<LoginResponse>('/api/v1/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return data
}

export async function getMe(token: string): Promise<UserInfo> {
  const { data } = await api.get<UserInfo>('/api/v1/auth/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return data
}

// Axios intercepteur — ajoute le token automatiquement
export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}