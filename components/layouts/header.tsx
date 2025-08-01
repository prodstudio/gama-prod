"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { UserNav } from "./user-nav"
import { Menu, Search } from "lucide-react"

interface HeaderProps {
  onMenuClick?: () => void
  userRole?: string
}

export function Header({ onMenuClick, userRole }: HeaderProps) {
  return (
    <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-gray-100/40 px-6">
      <Button variant="outline" size="icon" className="lg:hidden bg-transparent" onClick={onMenuClick}>
        <Menu className="h-4 w-4" />
        <span className="sr-only">Toggle Menu</span>
      </Button>

      <div className="w-full flex-1">
        <form>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar en la plataforma..."
              className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
            />
          </div>
        </form>
      </div>

      <UserNav />
    </header>
  )
}
