import type React from "react"
import { DashboardLayout } from "@/components/layouts/dashboard-layout"
import { LayoutDashboard, Building2, ChefHat, UtensilsCrossed, Calendar, Users, Settings } from "lucide-react"

const gamaNavItems = [
  {
    title: "Dashboard",
    href: "/gama/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Gestión Principal",
    icon: Settings,
    items: [
      {
        title: "Empresas",
        href: "/gama/empresas",
        icon: Building2,
      },
      {
        title: "Ingredientes",
        href: "/gama/ingredientes",
        icon: ChefHat,
      },
      {
        title: "Platos",
        href: "/gama/platos",
        icon: UtensilsCrossed,
      },
      {
        title: "Menús Semanales",
        href: "/gama/menus",
        icon: Calendar,
      },
      {
        title: "Planes",
        href: "/gama/planes",
        icon: Users,
      },
    ],
  },
]

export default function GamaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <DashboardLayout navItems={gamaNavItems} userRole="gama">
      {children}
    </DashboardLayout>
  )
}
