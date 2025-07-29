import Link from "next/link"
import { Package2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SidebarNav } from "./sidebar-nav"
import type { NavItem } from "@/lib/types/nav"

interface SidebarProps {
  navItems: NavItem[]
}

export function Sidebar({ navItems }: SidebarProps) {
  return (
    <div className="hidden border-r bg-muted/40 md:block">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <Package2 className="h-6 w-6 text-gama-600" />
            <span className="">Gama Gourmet</span>
          </Link>
        </div>
        <div className="flex-1">
          <SidebarNav items={navItems} />
        </div>
        <div className="mt-auto p-4">
          <Card>
            <CardHeader className="p-2 pt-0 md:p-4">
              <CardTitle>¿Necesitas Ayuda?</CardTitle>
              <CardDescription>Contacta a nuestro equipo de soporte para resolver cualquier duda.</CardDescription>
            </CardHeader>
            <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
              <Button size="sm" className="w-full">
                Contactar Soporte
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
