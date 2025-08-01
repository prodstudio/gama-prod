"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Building2,
  ChefHat,
  Calendar,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Home,
  Package,
} from "lucide-react"

interface SidebarProps {
  className?: string
}

const navigation = [
  {
    name: "Dashboard",
    href: "/gama/dashboard",
    icon: Home,
  },
  {
    name: "Operaciones",
    icon: BarChart3,
    children: [
      {
        name: "Menús Semanales",
        href: "/gama/menus",
        icon: Calendar,
      },
    ],
  },
  {
    name: "Gestión Principal",
    icon: Settings,
    children: [
      {
        name: "Empresas Clientes",
        href: "/gama/empresas",
        icon: Building2,
      },
      {
        name: "Planes",
        href: "/gama/planes",
        icon: Package,
      },
    ],
  },
  {
    name: "Catálogos",
    icon: ChefHat,
    children: [
      {
        name: "Platos",
        href: "/gama/platos",
        icon: ChefHat,
      },
      {
        name: "Ingredientes",
        href: "/gama/ingredientes",
        icon: Package,
      },
    ],
  },
]

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [expandedSections, setExpandedSections] = useState<string[]>(["Operaciones", "Gestión Principal", "Catálogos"])

  const toggleSection = (sectionName: string) => {
    setExpandedSections((prev) =>
      prev.includes(sectionName) ? prev.filter((name) => name !== sectionName) : [...prev, sectionName],
    )
  }

  return (
    <div className={cn("flex h-full w-64 flex-col bg-white border-r", className)}>
      <div className="flex h-14 items-center border-b px-4">
        <Link className="flex items-center gap-2 font-semibold" href="/gama/dashboard">
          <ChefHat className="h-6 w-6" />
          <span>Gama Gourmet</span>
        </Link>
      </div>
      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
          {navigation.map((item) => {
            if (item.children) {
              const isExpanded = expandedSections.includes(item.name)
              return (
                <div key={item.name} className="space-y-1">
                  <Button variant="ghost" className="w-full justify-between" onClick={() => toggleSection(item.name)}>
                    <div className="flex items-center gap-2">
                      <item.icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </div>
                    {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </Button>
                  {isExpanded && (
                    <div className="ml-4 space-y-1">
                      {item.children.map((child) => (
                        <Button
                          key={child.href}
                          variant={pathname === child.href ? "secondary" : "ghost"}
                          className="w-full justify-start"
                          asChild
                        >
                          <Link href={child.href}>
                            <child.icon className="h-4 w-4 mr-2" />
                            {child.name}
                          </Link>
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )
            }

            return (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className="w-full justify-start"
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              </Button>
            )
          })}
        </div>
      </ScrollArea>
    </div>
  )
}
