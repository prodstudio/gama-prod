import type { UserRole } from "@/lib/types/database"

export const ROLE_PERMISSIONS = {
  gama_admin: {
    name: "Super Administrador",
    routes: ["/gama"],
    permissions: ["manage_all", "view_all", "create_all", "edit_all", "delete_all"],
  },
  empresa_admin: {
    name: "Administrador de Empresa",
    routes: ["/empresa"],
    permissions: ["manage_employees", "view_company_orders", "view_billing"],
  },
  empleado: {
    name: "Empleado",
    routes: ["/empleado"],
    permissions: ["create_orders", "view_own_orders", "view_menu"],
  },
} as const

export function hasPermission(userRole: UserRole, permission: string): boolean {
  return ROLE_PERMISSIONS[userRole]?.permissions.includes(permission as any) || false
}

export function canAccessRoute(userRole: UserRole, route: string): boolean {
  return ROLE_PERMISSIONS[userRole]?.routes.some((allowedRoute) => route.startsWith(allowedRoute)) || false
}

export function getDefaultRoute(userRole: UserRole): string {
  switch (userRole) {
    case "gama_admin":
      return "/gama/dashboard"
    case "empresa_admin":
      return "/empresa/dashboard"
    case "empleado":
      return "/empleado/menu"
    default:
      return "/login"
  }
}
