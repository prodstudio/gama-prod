import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MapPin, Calendar, TrendingUp } from "lucide-react"

export default async function EmpresaDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <div>No autorizado</div>
  }

  // Obtener datos de la empresa del usuario
  const { data: empresa } = await supabase
    .from("empresas")
    .select(`
      *,
      sucursales (count),
      usuarios (count)
    `)
    .eq("usuario_id", user.id)
    .single()

  const stats = [
    {
      title: "Sucursales",
      value: empresa?.sucursales?.[0]?.count || 0,
      description: "Ubicaciones activas",
      icon: MapPin,
    },
    {
      title: "Empleados",
      value: empresa?.usuarios?.[0]?.count || 0,
      description: "Usuarios registrados",
      icon: Users,
    },
    {
      title: "Menús Activos",
      value: "5",
      description: "Esta semana",
      icon: Calendar,
    },
    {
      title: "Satisfacción",
      value: "94%",
      description: "Promedio mensual",
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Bienvenido, {empresa?.nombre}</p>
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
            <CardTitle>Menú de la Semana</CardTitle>
            <CardDescription>Opciones disponibles para tus empleados</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Próximamente: Vista previa del menú semanal</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones en tu cuenta</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Próximamente: Log de actividades</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
