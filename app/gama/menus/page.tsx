import { Suspense } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Calendar, Clock } from "lucide-react"
import Link from "next/link"
import { supabaseAdmin } from "@/lib/supabase/admin"

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
      categoria: string
    }
  }[]
}

async function getMenusSemanales(): Promise<MenuSemanal[]> {
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
          categoria
        )
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching menus semanales:", error)
    return []
  }

  return data || []
}

function MenusSemanalesContent() {
  return (
    <Suspense fallback={<div>Cargando menús...</div>}>
      <MenusSemanalesList />
    </Suspense>
  )
}

async function MenusSemanalesList() {
  const menus = await getMenusSemanales()

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {menus.map((menu) => (
        <Card key={menu.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Menú Semanal</CardTitle>
              <div className="flex gap-2">
                {menu.activo && (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Activo</span>
                )}
                {menu.publicado && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Publicado</span>
                )}
              </div>
            </div>
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              {new Date(menu.fecha_inicio).toLocaleDateString()} - {new Date(menu.fecha_fin).toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {menu.menu_platos.length} platos programados
              </div>
              <div className="text-sm">
                <strong>Platos por día:</strong>
                <div className="mt-1 space-y-1">
                  {[1, 2, 3, 4, 5, 6, 7].map((dia) => {
                    const platosDelDia = menu.menu_platos.filter((mp) => mp.dia_semana === dia)
                    const nombreDia = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"][
                      dia - 1
                    ]
                    return (
                      <div key={dia} className="text-xs">
                        <span className="font-medium">{nombreDia}:</span> {platosDelDia.length} platos
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
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
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Menú
          </Link>
        </Button>
      </div>

      <MenusSemanalesContent />
    </div>
  )
}
