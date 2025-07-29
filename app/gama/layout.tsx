import type React from "react"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { Home, Users, Building, ClipboardList, UtensilsCrossed, CalendarDays, Truck, BarChart3 } from "lucide-react"
import type { NavItem } from "@/lib/types/nav"

const navItems: NavItem[] = [
  { title: "Dashboard", href: "/gama/dashboard", icon: <Home className="h-4 w-4" /> },
  {
    title: "Gestión de Clientes",
    href: "#",
    icon: <Users className="h-4 w-4" />,
    items: [
      { title: "Empresas", href: "/gama/empresas", icon: <Building className="h-4 w-4" /> },
      { title: "Planes", href: "/gama/planes", icon: <ClipboardList className="h-4 w-4" /> },
    ],
  },
  {
    title: "Catálogo",
    href: "#",
    icon: <UtensilsCrossed className="h-4 w-4" />,
    items: [
      { title: "Platos", href: "/gama/platos", icon: <UtensilsCrossed className="h-4 w-4" /> },
      { title: "Ingredientes", href: "/gama/ingredientes", icon: <ClipboardList className="h-4 w-4" /> },
    ],
  },
  { title: "Menús Semanales", href: "/gama/menus", icon: <CalendarDays className="h-4 w-4" /> },
  { title: "Pedidos", href: "/gama/pedidos", icon: <ClipboardList className="h-4 w-4" /> },
  { title: "Logística", href: "/gama/logistica", icon: <Truck className="h-4 w-4" /> },
  { title: "Reportes", href: "/gama/reportes", icon: <BarChart3 className="h-4 w-4" /> },
]

export default function GamaLayout({ children }: { children: React.ReactNode }) {
  return <DashboardLayout navItems={navItems}>{children}</DashboardLayout>
}
