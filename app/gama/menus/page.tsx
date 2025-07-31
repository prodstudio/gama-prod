import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { Calendar, Plus, Eye, Edit } from "lucide-react"
import Link from "next/link"

interface MenuSemanal {
  id: string
  fecha_inicio: string
  fecha_fin: string
  activo: boolean
  publicado: boolean
  created_at: string
  menu_platos: Array<{
    id: string
    dia_semana: number
    platos: {
      id: string
      nombre: string
      tipo: string
    }
  }>
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
        menu_platos (
          id,
          dia_semana,
          platos (
            id,
            nombre,
            tipo
          )
        )
      `)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching menus:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error fetching menus:", error)
    return []
  }
}

function MenusSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex gap-2 mt-4">
                <Skeleton className="h-8 w-16" />
                <Skeleton className="h-8 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}

function getDiaNombre(dia: number) {
  const dias = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
  return dias[dia] || "Día desconocido"
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
            Comienza creando tu primer menú semanal para las empresas.
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
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {menus.map((menu) => (
        <Card key={menu.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Menú {formatDate(menu.fecha_inicio)}</CardTitle>
              <div className="flex gap-2">
                {menu.activo && (
                  <Badge variant="default" className="text-xs">
                    Activo
                  </Badge>
                )}
                {menu.publicado && (
                  <Badge variant="secondary" className="text-xs">
                    Publicado
                  </Badge>
                )}
              </div>
            </div>
            <CardDescription>
              {formatDate(menu.fecha_inicio)} - {formatDate(menu.fecha_fin)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium mb-2">Platos programados ({menu.menu_platos?.length || 0})</p>
                {menu.menu_platos && menu.menu_platos.length > 0 ? (
                  <div className="space-y-1">
                    {menu.menu_platos.slice(0, 3).map((menuPlato) => (
                      <div key={menuPlato.id} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline" className="text-xs">
                          {getDiaNombre(menuPlato.dia_semana)}
                        </Badge>
                        <span className="truncate">{menuPlato.platos?.nombre || "Plato desconocido"}</span>
                      </div>
                    ))}
                    {menu.menu_platos.length > 3 && (
                      <p className="text-xs text-muted-foreground">+{menu.menu_platos.length - 3} platos más</p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Sin platos asignados</p>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/gama/menus/${menu.id}`}>
                    <Eye className="h-4 w-4 mr-1" />
                    Ver
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/gama/menus/${menu.id}/editar`}>
                    <Edit className="h-4 w-4 mr-1" />
                    Editar
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
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
          <p className="text-muted-foreground">Gestiona los menús semanales para las empresas</p>
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
