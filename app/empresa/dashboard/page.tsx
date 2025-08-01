import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MapPin, Calendar, DollarSign } from "lucide-react"

export default async function EmpresaDashboard() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Obtener información de la empresa del usuario
  const { data: empresa } = await supabase
    .from("empresas")
    .select(`
      *,
      sucursales (count),
      usuarios (count)
    `)
    .eq("contacto_email", user?.email)
    .single()

  const stats = [
    {
      title: "Empleados",
      value: empresa?.usuarios?.[0]?.count || 0,
      icon: Users,
      description: "Empleados registrados",
    },
    {
      title: "Sucursales",
      value: empresa?.sucursales?.[0]?.count || 0,
      icon: MapPin,
      description: "Ubicaciones activas",
    },
    {
      title: "Plan Actual",
      value: empresa?.plan || "Básico",
      icon: Calendar,
      description: "Plan contratado",
    },
    {
      title: "Estado",
      value: empresa?.activo ? "Activo" : "Inactivo",
      icon: DollarSign,
      description: "Estado de la cuenta",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Empresa</h1>
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
            <CardTitle>Información de la Empresa</CardTitle>
            <CardDescription>Detalles de tu empresa registrada</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <strong>Nombre:</strong> {empresa?.nombre}
            </div>
            <div>
              <strong>RUT:</strong> {empresa?.rut}
            </div>
            <div>
              <strong>Email:</strong> {empresa?.contacto_email}
            </div>
            <div>
              <strong>Teléfono:</strong> {empresa?.contacto_telefono}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Menús de la Semana</CardTitle>
            <CardDescription>Próximos menús disponibles</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">No hay menús programados para esta semana.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
