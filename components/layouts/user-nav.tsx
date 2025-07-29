"use client"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/lib/hooks/use-auth"
import { signOutAction } from "@/lib/actions/auth-actions"
import Link from "next/link"

export function UserNav() {
  const { profile } = useAuth()

  const getInitials = (name: string, lastname: string) => {
    return `${name.charAt(0)}${lastname.charAt(0)}`.toUpperCase()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="rounded-full">
          <Avatar>
            <AvatarImage src={profile?.avatar_url || ""} alt={profile?.nombre || ""} />
            <AvatarFallback>
              {profile?.nombre && profile?.apellido ? getInitials(profile.nombre, profile.apellido) : "GG"}
            </AvatarFallback>
          </Avatar>
          <span className="sr-only">Toggle user menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{`${profile?.nombre} ${profile?.apellido}`}</p>
            <p className="text-xs leading-none text-muted-foreground">{profile?.email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/perfil">Perfil</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/configuracion">Configuración</Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <form action={signOutAction}>
          <Button type="submit" variant="ghost" className="w-full justify-start font-normal px-2">
            Cerrar Sesión
          </Button>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
