"use client"

import type React from "react"

import { useState, useEffect, createContext, useContext } from "react"
import type { User } from "@supabase/auth-helpers-nextjs"
import { supabase } from "@/lib/supabase/client"
import type { UserProfile } from "@/lib/types/database"

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const refreshProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    try {
      const { data: userProfileData, error } = await supabase
        .from("users")
        .select(`
          *,
          empresa:empresas(
            id,
            nombre,
            plan:planes(*)
          )
        `)
        .eq("id", user.id)

      if (error) {
        console.error("Error fetching profile:", error)
        // Si hay un error, cerramos sesión para evitar un estado inconsistente
        await signOut()
        return
      }

      // Verificamos si se encontró un perfil. Si no, es un problema de datos.
      if (userProfileData && userProfileData.length > 0) {
        setProfile(userProfileData[0])
      } else {
        // No se encontró perfil para este usuario autenticado.
        console.warn("ADVERTENCIA: No se encontró perfil para el usuario:", user.id, ". Cerrando sesión.")
        setProfile(null)
        // Cerramos la sesión para forzar al usuario a volver al login y evitar un estado roto.
        await signOut()
      }
    } catch (error) {
      console.error("Error catastrófico en refreshProfile:", error)
      await signOut()
    }
  }

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getInitialSession()

    // Escuchar cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)

      if (session?.user) {
        await refreshProfile()
      } else {
        setProfile(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user && !profile) {
      refreshProfile()
    }
  }, [user, profile])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile }}>{children}</AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
