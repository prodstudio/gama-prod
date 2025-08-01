import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, ChefHat, Calendar } from "lucide-react"

export default async function GamaDashboard() {
  const supabase = createClient()

  // Obtener estadísticas generales
  const [{ count: empresasCount }, { count: usuariosCount }, { count: platosCount }, { count: menusCount }] =
    await Promise.all([
      supabase.from("empresas").select("*", { count: "exact", head: true }),
      supabase.from("usuarios").select("*", { count: "exact", head: true }),
      supabase.from("platos").select("*", { count: "exact", head: true }),
      supabase.from("menus_semanales").select("*", { count: "exact", head: true }),
    ])

  const stats = [
    {
      title: "Empresas",
      value: empresasCount || 0,
      icon: Building2,
      description: "Empresas registradas",
    },
    {
      title: "Usuarios",
      value: usuariosCount || 0,
      icon: Users,
      description: "Usuarios totales",
    },
    {
      title: "Platos",
      value: platosCount || 0,
      icon: ChefHat,
      description: "Platos disponibles",
    },
    {
      title: "Menús",
      value: menusCount || 0,
      icon: Calendar,
      description: "Menús semanales",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard GAMA</h1>
        <p className="text-muted-foreground">Panel de control principal del sistema</p>
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
            <CardDescription>Últimas acciones en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No hay actividad reciente para mostrar.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Métricas del Sistema</CardTitle>
            <CardDescription>Rendimiento y estadísticas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Empresas Activas</span>
                <span className="font-semibold">{empresasCount || 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Menús Esta Semana</span>
                <span className="font-semibold">{menusCount || 0}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
