import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, Eye, Edit } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { supabaseAdmin } from "@/lib/supabase/admin"

interface MenuSemanal {
  id: string
  fecha_inicio: string
  fecha_fin: string
  activo: boolean
  publicado: boolean
  created_at: string
  updated_at: string
}

interface MenuPlato {
  dia_semana: number
  platos: {
    id: string
    nombre: string
    tipo: string
  }
}

async function getMenusSemanales() {
  try {
    // Obtener menús semanales
    const { data: menus, error: menusError } = await supabaseAdmin
      .from("menus_semanales")
      .select("*")
      .order("fecha_inicio", { ascending: false })

    if (menusError) {
      console.error("Error fetching menus:", menusError)
      return []
    }

    if (!menus || menus.length === 0) {
      return []
    }

    // Para cada menú, obtener sus platos
    const menusWithPlatos = await Promise.all(
      menus.map(async (menu) => {
        const { data: menuPlatos, error: platosError } = await supabaseAdmin
          .from("menu_platos")
          .select(`
            dia_semana,
            platos (
              id,
              nombre,
              tipo
            )
          `)
          .eq("menu_semanal_id", menu.id)

        if (platosError) {
          console.error("Error fetching platos for menu:", platosError)
          return { ...menu, menu_platos: [] }
        }

        return {
          ...menu,
          menu_platos: menuPlatos || [],
        }
      }),
    )

    return menusWithPlatos
  } catch (error) {
    console.error("Error in getMenusSemanales:", error)
    return []
  }
}

function MenuCard({
  menu,
}: {
  menu: MenuSemanal & {
    menu_platos: MenuPlato[]
  }
}) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  }

  const getDayName = (day: number) => {
    const days = ["", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
    return days[day] || ""
  }

  const platosCount = menu.menu_platos?.length || 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Semana del {formatDate(menu.fecha_inicio)}
            </CardTitle>
            <CardDescription>
              {formatDate(menu.fecha_inicio)} - {formatDate(menu.fecha_fin)}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Badge variant={menu.publicado ? "default" : "secondary"}>
              {menu.publicado ? "Publicado" : "Borrador"}
            </Badge>
            <Badge variant={menu.activo ? "default" : "destructive"}>{menu.activo ? "Activo" : "Inactivo"}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-sm text-muted-foreground">{platosCount} platos programados</div>

          {menu.menu_platos && menu.menu_platos.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Platos de la semana:</h4>
              <div className="grid gap-2">
                {menu.menu_platos.slice(0, 3).map((menuPlato, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{getDayName(menuPlato.dia_semana)}</span>
                    <span className="font-medium">{menuPlato.platos?.nombre || "Sin nombre"}</span>
                  </div>
                ))}
                {menu.menu_platos.length > 3 && (
                  <div className="text-sm text-muted-foreground">+{menu.menu_platos.length - 3} platos más...</div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button asChild size="sm" variant="outline">
              <Link href={`/gama/menus/${menu.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                Ver
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={`/gama/menus/${menu.id}/editar`}>
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

async function MenusSemanalesList() {
  const menus = await getMenusSemanales()

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {menus.map((menu) => (
        <MenuCard key={menu.id} menu={menu} />
      ))}
      {menus.length === 0 && (
        <div className="col-span-full text-center py-12">
          <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No hay menús semanales</h3>
          <p className="text-muted-foreground mb-4">Comienza creando tu primer menú semanal</p>
          <Button asChild>
            <Link href="/gama/menus/nuevo">
              <Plus className="h-4 w-4 mr-2" />
              Crear Menú Semanal
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}

export default function MenusSemanalesPage() {
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

      <Suspense fallback={<div>Cargando menús...</div>}>
        <MenusSemanalesList />
      </Suspense>
    </div>
  )
}
