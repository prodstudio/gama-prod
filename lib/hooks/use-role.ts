"use client"

import { useAuth } from "./use-auth"
import type { UserRole } from "@/lib/types/database"

export function useRole() {
  const { profile } = useAuth()

  const hasRole = (role: UserRole): boolean => {
    return profile?.role === role
  }

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return profile ? roles.includes(profile.role) : false
  }

  const isGamaAdmin = (): boolean => hasRole("gama_admin")
  const isEmpresaAdmin = (): boolean => hasRole("empresa_admin")
  const isEmpleado = (): boolean => hasRole("empleado")

  const canAccessRoute = (route: string): boolean => {
    if (!profile) return false

    const roleRoutes = {
      gama_admin: ["/gama"],
      empresa_admin: ["/empresa"],
      empleado: ["/empleado"],
    }

    const allowedRoutes = roleRoutes[profile.role] || []
    return allowedRoutes.some((allowedRoute) => route.startsWith(allowedRoute))
  }

  return {
    profile,
    role: profile?.role,
    hasRole,
    hasAnyRole,
    isGamaAdmin,
    isEmpresaAdmin,
    isEmpleado,
    canAccessRoute,
  }
}
