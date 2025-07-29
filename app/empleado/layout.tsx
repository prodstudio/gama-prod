import type React from "react"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { CalendarDays, ClipboardList, History, User } from "lucide-react"
import type { NavItem } from "@/lib/types/nav"

const navItems: NavItem[] = [
  { title: "Menú Semanal", href: "/empleado/menu", icon: <CalendarDays className="h-4 w-4" /> },
  { title: "Mis Pedidos", href: "/empleado/pedidos", icon: <ClipboardList className="h-4 w-4" /> },
  { title: "Historial", href: "/empleado/historial", icon: <History className="h-4 w-4" /> },
  { title: "Mi Perfil", href: "/empleado/perfil", icon: <User className="h-4 w-4" /> },
]

export default function EmpleadoLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout navItems={navItems}>{children}</DashboardLayout>
}
