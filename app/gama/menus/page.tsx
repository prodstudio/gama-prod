import { Suspense } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Plus, Calendar, Users } from "lucide-react"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface MenuSemanal {
  id: string
  fecha_inicio: string
  fecha_fin: string
  activo: boolean
  publicado: boolean
  created_at: string
  platos_count: number
}

async function getMenusSemanales(): Promise<MenuSemanal[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("menus_semanales")
      .select(`
        id,
        fecha_inicio,
        fecha_fin,
        activo,
        publicado,
        created_at,
        menu_platos(count)
      `)
      .order("fecha_inicio", { ascending: false })

    if (error) {
      console.error("Error fetching menus:", error)
      return []
    }

    return (data || []).map((menu: any) => ({
      ...menu,
      platos_count: menu.menu_platos?.[0]?.count || 0,
    }))
  } catch (error) {
    console.error("Error fetching menus:", error)
    return []
  }
}

function MenuCard({ menu }: { menu: MenuSemanal }) {
  const fechaInicio = new Date(menu.fecha_inicio)
  const fechaFin = new Date(menu.fecha_fin)

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Semana del {format(fechaInicio, "d MMM", { locale: es })} al{" "}
            {format(fechaFin, "d MMM yyyy", { locale: es })}
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant={menu.activo ? "default" : "secondary"}>{menu.activo ? "Activo" : "Inactivo"}</Badge>
            <Badge variant={menu.publicado ? "default" : "outline"}>{menu.publicado ? "Publicado" : "Borrador"}</Badge>
          </div>
        </div>
        <CardDescription>Creado el {format(new Date(menu.created_at), "d MMM yyyy", { locale: es })}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{Math.ceil((fechaFin.getTime() - fechaInicio.getTime()) / (1000 * 60 * 60 * 24))} días</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{menu.platos_count} platos</span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/gama/menus/${menu.id}`}>Ver</Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href={`/gama/menus/${menu.id}/editar`}>Editar</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function MenusSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-6 w-48" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
            <Skeleton className="h-4 w-32" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex gap-4">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-4 w-20" />
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 w-12" />
                <Skeleton className="h-8 w-16" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

async function MenusList() {
  const menus = await getMenusSemanales()

  if (menus.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No hay menús semanales</h3>
          <p className="text-muted-foreground text-center mb-4">
            Comienza creando tu primer menú semanal para organizar los platos por días.
          </p>
          <Button asChild>
            <Link href="/gama/menus/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Crear Primer Menú
            </Link>
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {menus.map((menu) => (
        <MenuCard key={menu.id} menu={menu} />
      ))}
    </div>
  )
}

export default function MenusPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menús Semanales</h1>
          <p className="text-muted-foreground">Gestiona los menús semanales y organiza los platos por días</p>
        </div>
        <Button asChild>
          <Link href="/gama/menus/nuevo">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Menú
          </Link>
        </Button>
      </div>

      <Suspense fallback={<MenusSkeleton />}>
        <MenusList />
      </Suspense>
    </div>
  )
}
