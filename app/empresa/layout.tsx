import type React from "react"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { Home, Users, ClipboardList, FileText } from "lucide-react"
import type { NavItem } from "@/lib/types/nav"

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/empresa/dashboard", icon: <Home className="h-4 w-4" /> },
  { title: "Gestionar Empleados", href: "/empresa/empleados", icon: <Users className="h-4 w-4" /> },
  { title: "Pedidos de Empleados", href: "/empresa/pedidos", icon: <ClipboardList className="h-4 w-4" /> },
  { title: "Facturación", href: "/empresa/facturacion", icon: <FileText className="h-4 w-4" /> },
]

export default function EmpresaLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout navItems={navItems}>{children}</DashboardLayout>
}
