"use client"

import type React from "react"
import { useState, useEffect, createContext, useContext } from "react"
import type { User } from "@supabase/supabase-js"
import { createBrowserClient } from "@supabase/ssr"
import type { Database, UserProfile } from "@/lib/types/database"
import { cookieOptions } from "@/lib/supabase/config"

const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  { cookieOptions },
)

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
        .select(
          `
          *,
          empresa:empresas(
            id,
            nombre,
            plan:planes(*)
          )
        `,
        )
        .eq("id", user.id)
        .single()

      if (error) {
        console.error("Error fetching profile:", error)
        await signOut()
        return
      }

      setProfile(userProfileData)
    } catch (error) {
      console.error("Error catastrófico en refreshProfile:", error)
      await signOut()
    }
  }

  useEffect(() => {
    const getInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
      if (session?.user) {
        await refreshProfile()
      }
      setLoading(false)
    }

    getInitialSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        await refreshProfile()
      } else {
        setProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setProfile(null)
  }

  const contextValue: AuthContextType = {
    user,
    profile,
    loading,
    signOut,
    refreshProfile,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
