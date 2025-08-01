import { LayoutDashboard, Building2, Package, ChefHat, Calendar, ClipboardList } from "lucide-react"
import type { NavItem } from "@/lib/types/nav"

export const gamaNavigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/gama/dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    title: "Gestión Principal",
    items: [
      {
        title: "Menús Semanales",
        href: "/gama/menus",
        icon: <Calendar className="h-4 w-4" />,
      },
      {
        title: "Empresas Clientes",
        href: "/gama/empresas",
        icon: <Building2 className="h-4 w-4" />,
      },
    ],
  },
  {
    title: "Catálogos",
    items: [
      {
        title: "Platos",
        href: "/gama/platos",
        icon: <ChefHat className="h-4 w-4" />,
      },
      {
        title: "Ingredientes",
        href: "/gama/ingredientes",
        icon: <Package className="h-4 w-4" />,
      },
      {
        title: "Planes",
        href: "/gama/planes",
        icon: <ClipboardList className="h-4 w-4" />,
      },
    ],
  },
]
