import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, ChefHat, Calendar } from "lucide-react"

export default async function GamaDashboardPage() {
  const supabase = await createClient()

  // Obtener estadísticas generales
  const [{ count: totalEmpresas }, { count: totalUsuarios }, { count: totalPlatos }, { count: totalMenus }] =
    await Promise.all([
      supabase.from("empresas").select("*", { count: "exact", head: true }),
      supabase.from("usuarios").select("*", { count: "exact", head: true }),
      supabase.from("platos").select("*", { count: "exact", head: true }),
      supabase.from("menus_semanales").select("*", { count: "exact", head: true }),
    ])

  const stats = [
    {
      title: "Empresas",
      value: totalEmpresas || 0,
      description: "Clientes activos",
      icon: Building2,
    },
    {
      title: "Usuarios",
      value: totalUsuarios || 0,
      description: "Total en plataforma",
      icon: Users,
    },
    {
      title: "Platos",
      value: totalPlatos || 0,
      description: "Opciones disponibles",
      icon: ChefHat,
    },
    {
      title: "Menús",
      value: totalMenus || 0,
      description: "Menús creados",
      icon: Calendar,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Vista general de la plataforma GAMA Gourmet</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones en la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">• Nueva empresa registrada</p>
              <p className="text-sm">• Menú semanal actualizado</p>
              <p className="text-sm">• 5 nuevos platos agregados</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Próximas Tareas</CardTitle>
            <CardDescription>Acciones pendientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-sm">• Revisar menús de la próxima semana</p>
              <p className="text-sm">• Actualizar precios de ingredientes</p>
              <p className="text-sm">• Generar reportes mensuales</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
