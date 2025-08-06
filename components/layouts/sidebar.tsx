"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Building2, ChefHat, Calendar, ChevronUp, ChevronDown, LayoutGrid, Package, Utensils, Layers, Briefcase } from 'lucide-react'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname()
  const [catalogosExpanded, setCatalogosExpanded] = useState(true)

  const toggleCatalogos = () => {
    setCatalogosExpanded(!catalogosExpanded)
  }

  return (
    <div className={cn("flex h-full w-64 flex-col bg-white border-r", className)}>
      {/* Header */}
      <div className="flex h-14 items-center border-b px-4">
        <Link className="flex items-center gap-2 font-semibold text-lg" href="/gama/dashboard">
          <Briefcase className="h-6 w-6" />
          <span>Gama Gourmet</span>
        </Link>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-1 p-4">
          {/* Dashboard */}
          <Button
            variant={pathname === "/gama/dashboard" ? "secondary" : "ghost"}
            className="w-full justify-start h-10 px-3 mb-4"
            asChild
          >
            <Link href="/gama/dashboard">
              <LayoutGrid className="h-5 w-5 mr-3" />
              <span className="text-base">Dashboard</span>
            </Link>
          </Button>

          {/* GESTIÓN PRINCIPAL */}
          <div className="space-y-2">
            <div className="px-3 py-2">
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                GESTIÓN PRINCIPAL
              </h3>
            </div>
            
            <Button
              variant={pathname === "/gama/menus" ? "secondary" : "ghost"}
              className="w-full justify-start h-10 px-3"
              asChild
            >
              <Link href="/gama/menus">
                <Calendar className="h-5 w-5 mr-3" />
                <span className="text-base">Menús Semanales</span>
              </Link>
            </Button>

            <Button
              variant={pathname === "/gama/empresas" ? "secondary" : "ghost"}
              className="w-full justify-start h-10 px-3 mb-4"
              asChild
            >
              <Link href="/gama/empresas">
                <Building2 className="h-5 w-5 mr-3" />
                <span className="text-base">Empresas Clientes</span>
              </Link>
            </Button>
          </div>

          {/* CATÁLOGOS */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-between px-3 py-2 h-auto"
              onClick={toggleCatalogos}
            >
              <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                CATÁLOGOS
              </h3>
              {catalogosExpanded ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </Button>

            {catalogosExpanded && (
              <div className="space-y-1 ml-3">
                <Button
                  variant={pathname === "/gama/ingredientes" ? "secondary" : "ghost"}
                  className="w-full justify-start h-10 px-3"
                  asChild
                >
                  <Link href="/gama/ingredientes">
                    <Package className="h-5 w-5 mr-3" />
                    <span className="text-base">Ingredientes</span>
                  </Link>
                </Button>

                <Button
                  variant={pathname === "/gama/platos" ? "secondary" : "ghost"}
                  className="w-full justify-start h-10 px-3"
                  asChild
                >
                  <Link href="/gama/platos">
                    <Utensils className="h-5 w-5 mr-3" />
                    <span className="text-base">Platos</span>
                  </Link>
                </Button>

                <Button
                  variant={pathname === "/gama/planes" ? "secondary" : "ghost"}
                  className="w-full justify-start h-10 px-3"
                  asChild
                >
                  <Link href="/gama/planes">
                    <Layers className="h-5 w-5 mr-3" />
                    <span className="text-base">Planes</span>
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  )
}
