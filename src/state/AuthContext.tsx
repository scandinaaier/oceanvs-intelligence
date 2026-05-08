import React, { createContext, useContext, useEffect, useState } from 'react'
import { AUTHORIZED_EMAILS } from '../config/api'

interface AuthState {
  email: string | null
  login: (email: string) => { ok: true } | { ok: false; reason: string }
  logout: () => void
}

const Ctx = createContext<AuthState | null>(null)

const STORAGE_KEY = 'oceanvs_auth_email'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [email, setEmail] = useState<string | null>(() => localStorage.getItem(STORAGE_KEY))

  useEffect(() => {
    if (email) localStorage.setItem(STORAGE_KEY, email)
    else localStorage.removeItem(STORAGE_KEY)
  }, [email])

  const login = (raw: string) => {
    const e = raw.trim().toLowerCase()
    if (!e || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) {
      return { ok: false as const, reason: 'Please enter a valid email.' }
    }
    if (!AUTHORIZED_EMAILS.includes(e)) {
      return { ok: false as const, reason: 'This email is not authorised. Contact the Oceanvs team for access.' }
    }
    setEmail(e)
    return { ok: true as const }
  }

  const logout = () => setEmail(null)

  return <Ctx.Provider value={{ email, login, logout }}>{children}</Ctx.Provider>
}

export const useAuth = (): AuthState => {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAuth outside provider')
  return v
}
