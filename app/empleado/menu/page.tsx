import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function EmpleadoMenuPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>No autorizado</div>
  }

  // Obtener el menú del día para el empleado
  const { data: menuHoy } = await supabase
    .from("menus_semanales")
    .select(`
      *,
      menu_platos (
        platos (
          id,
          nombre,
          descripcion,
          categoria,
          precio,
          plato_ingredientes (
            ingredientes (
              nombre,
              tipo
            )
          )
        )
      )
    `)
    .eq("activo", true)
    .single()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Menú del Día</h1>
        <p className="text-muted-foreground">Selecciona tus opciones para hoy</p>
      </div>

      {menuHoy ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {menuHoy.menu_platos?.map((menuPlato: any) => (
            <Card key={menuPlato.platos.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{menuPlato.platos.nombre}</CardTitle>
                  <Badge variant="secondary">{menuPlato.platos.categoria}</Badge>
                </div>
                <CardDescription>{menuPlato.platos.descripcion}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Ingredientes:</p>
                  <div className="flex flex-wrap gap-1">
                    {menuPlato.platos.plato_ingredientes?.map((pi: any, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {pi.ingredientes.nombre}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-lg font-bold text-primary">${menuPlato.platos.precio}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex items-center justify-center h-32">
            <p className="text-muted-foreground">No hay menú disponible para hoy</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
