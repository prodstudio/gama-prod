import { Suspense } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getMenusSemanales } from "@/lib/actions/menus-actions"

async function MenusList() {
  const menus = await getMenusSemanales()

  if (!menus || menus.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No hay menús semanales</h3>
        <p className="text-gray-500 mb-4">Comienza creando tu primer menú semanal</p>
        <Link href="/gama/menus/nuevo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Crear Menú
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {menus.map((menu) => (
        <Card key={menu.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{menu.nombre}</CardTitle>
              <Badge variant={menu.publicado ? "default" : "secondary"}>
                {menu.publicado ? "Publicado" : "Borrador"}
              </Badge>
            </div>
            <CardDescription>
              {new Date(menu.fecha_inicio).toLocaleDateString("es-ES")} -{" "}
              {new Date(menu.fecha_fin).toLocaleDateString("es-ES")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-sm text-gray-600">
                <strong>Platos asignados:</strong> {menu.menu_platos?.length || 0}
              </div>
              <div className="text-sm text-gray-600">
                <strong>Estado:</strong> {menu.activo ? "Activo" : "Inactivo"}
              </div>
              <div className="text-sm text-gray-600">
                <strong>Creado:</strong> {new Date(menu.created_at).toLocaleDateString("es-ES")}
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Link href={`/gama/menus/${menu.id}`}>
                <Button variant="outline" size="sm">
                  Ver Detalles
                </Button>
              </Link>
              <Link href={`/gama/menus/${menu.id}/editar`}>
                <Button variant="outline" size="sm">
                  Editar
                </Button>
              </Link>
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
          <p className="text-muted-foreground">Gestiona los menús semanales de tu empresa</p>
        </div>
        <Link href="/gama/menus/nuevo">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Menú
          </Button>
        </Link>
      </div>

      <Suspense
        fallback={
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        }
      >
        <MenusList />
      </Suspense>
    </div>
  )
}
