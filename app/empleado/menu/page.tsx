import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function EmpleadoMenuPage() {
  const supabase = createClient()

  // Obtener menús disponibles para el empleado
  const { data: menus } = await supabase
    .from("menus_semanales")
    .select(`
      *,
      menu_platos (
        platos (
          nombre,
          descripcion,
          categoria,
          precio
        )
      )
    `)
    .order("fecha_inicio", { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Menús Disponibles</h1>
        <p className="text-muted-foreground">Selecciona tus comidas de la semana</p>
      </div>

      <div className="grid gap-6">
        {menus?.map((menu) => (
          <Card key={menu.id}>
            <CardHeader>
              <CardTitle>{menu.nombre}</CardTitle>
              <CardDescription>
                Semana del {new Date(menu.fecha_inicio).toLocaleDateString()} al{" "}
                {new Date(menu.fecha_fin).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {menu.menu_platos?.map((menuPlato: any, index: number) => (
                  <Card key={index} className="p-4">
                    <h4 className="font-semibold">{menuPlato.platos.nombre}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{menuPlato.platos.descripcion}</p>
                    <div className="flex justify-between items-center">
                      <Badge variant="secondary">{menuPlato.platos.categoria}</Badge>
                      <span className="font-semibold">${menuPlato.platos.precio}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
