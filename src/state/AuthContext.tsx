import React, { createContext, useContext, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

interface AuthState {
  user: User | null
  session: Session | null
  email: string | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ ok: true } | { ok: false; reason: string }>
  signOut: () => Promise<void>
}

const Ctx = createContext<AuthState | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      setUser(s?.user ?? null)
    })

    return () => { sub.subscription.unsubscribe() }
  }, [])

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim().toLowerCase(), password })
    if (error) {
      return { ok: false as const, reason: error.message }
    }
    return { ok: true as const }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <Ctx.Provider value={{ user, session, email: user?.email ?? null, loading, signIn, signOut }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = (): AuthState => {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAuth outside provider')
  return v
}
