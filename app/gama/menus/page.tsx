import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Calendar, Clock, Users } from "lucide-react"
import Link from "next/link"
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
  menu_platos: {
    id: string
    dia_semana: number
    plato: {
      id: string
      nombre: string
      tipo: string
    }
  }[]
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
          plato:platos (
            id,
            nombre,
            tipo
          )
        )
      `)
      .order("fecha_inicio", { ascending: false })

    if (error) {
      console.error("Error fetching menus semanales:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error fetching menus semanales:", error)
    throw error
  }
}

function MenusSemanalesList({ menus }: { menus: MenuSemanal[] }) {
  const diasSemana = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {menus.map((menu) => {
        const platosCount = menu.menu_platos.length
        const diasConPlatos = new Set(menu.menu_platos.map((mp) => mp.dia_semana)).size

        return (
          <Card key={menu.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Menú Semanal</CardTitle>
                <div className="flex gap-2">
                  {menu.activo && (
                    <Badge variant="default" className="bg-green-500">
                      Activo
                    </Badge>
                  )}
                  {menu.publicado && <Badge variant="secondary">Publicado</Badge>}
                </div>
              </div>
              <CardDescription>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(menu.fecha_inicio), "dd MMM", { locale: es })} -{" "}
                  {format(new Date(menu.fecha_fin), "dd MMM yyyy", { locale: es })}
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{platosCount} platos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{diasConPlatos} días</span>
                  </div>
                </div>

                {menu.menu_platos.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Platos incluidos:</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {diasSemana.map((dia, index) => {
                        const platosDelDia = menu.menu_platos.filter((mp) => mp.dia_semana === index + 1)
                        if (platosDelDia.length === 0) return null

                        return (
                          <div key={index} className="text-xs">
                            <span className="font-medium text-muted-foreground">{dia}:</span>
                            <div className="ml-2">
                              {platosDelDia.map((mp, idx) => (
                                <div key={mp.id} className="flex items-center gap-1">
                                  <span>{mp.plato.nombre}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {mp.plato.tipo}
                                  </Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/gama/menus/${menu.id}`}>Ver detalles</Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/gama/menus/${menu.id}/editar`}>Editar</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

async function MenusSemanalesContent() {
  const menus = await getMenusSemanales()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Menús Semanales</h1>
          <p className="text-muted-foreground">Gestiona los menús semanales para las empresas</p>
        </div>
        <Button asChild>
          <Link href="/gama/menus/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Menú
          </Link>
        </Button>
      </div>

      {menus.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No hay menús semanales</h3>
            <p className="text-muted-foreground text-center mb-4">Comienza creando tu primer menú semanal</p>
            <Button asChild>
              <Link href="/gama/menus/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Crear Menú Semanal
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <MenusSemanalesList menus={menus} />
      )}
    </div>
  )
}

export default function MenusSemanalesPage() {
  return (
    <div className="container mx-auto py-6">
      <Suspense
        fallback={
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Menús Semanales</h1>
                <p className="text-muted-foreground">Cargando...</p>
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted rounded"></div>
                      <div className="h-4 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        }
      >
        <MenusSemanalesContent />
      </Suspense>
    </div>
  )
}
