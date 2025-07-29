import { supabaseAdmin } from "@/lib/supabase/admin" // Cambiar a cliente admin
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building, Users, UtensilsCrossed, ClipboardList } from "lucide-react"
import { IngredientesStats } from "@/components/ingredientes/ingredientes-stats"

export default async function GamaDashboard() {
  // TODO: Cuando reactivemos auth, validar que user.role === 'gama_admin'

  // Obtener métricas del dashboard usando cliente admin
  const [
    { count: totalEmpresas },
    { count: totalUsuarios },
    { count: totalPlatos },
    { count: totalPedidos },
    { data: empresasRecientes },
    { data: pedidosRecientes },
  ] = await Promise.all([
    supabaseAdmin.from("empresas").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("users").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("platos").select("*", { count: "exact", head: true }),
    supabaseAdmin.from("pedidos").select("*", { count: "exact", head: true }),
    supabaseAdmin
      .from("empresas")
      .select(`
        *,
        plan:planes(nombre)
      `)
      .order("created_at", { ascending: false })
      .limit(5),
    supabaseAdmin
      .from("pedidos")
      .select(`
        *,
        user:users(nombre, apellido),
        plato:platos(nombre),
        sucursal:sucursales(nombre)
      `)
      .order("created_at", { ascending: false })
      .limit(5),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Gama</h1>
        <p className="text-gray-600">Resumen general de la plataforma</p>
      </div>

      {/* Métricas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Empresas</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEmpresas || 0}</div>
            <p className="text-xs text-muted-foreground">Empresas activas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsuarios || 0}</div>
            <p className="text-xs text-muted-foreground">Usuarios registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Platos</CardTitle>
            <UtensilsCrossed className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPlatos || 0}</div>
            <p className="text-xs text-muted-foreground">En el catálogo</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pedidos</CardTitle>
            <ClipboardList className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPedidos || 0}</div>
            <p className="text-xs text-muted-foreground">Pedidos realizados</p>
          </CardContent>
        </Card>
      </div>

      {/* Estadísticas de ingredientes */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Ingredientes</h2>
        <IngredientesStats />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Empresas recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Empresas Recientes</CardTitle>
            <CardDescription>Últimas empresas registradas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {empresasRecientes?.map((empresa) => (
                <div key={empresa.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{empresa.nombre}</p>
                    <p className="text-sm text-muted-foreground">{empresa.email_contacto}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={empresa.activa ? "default" : "secondary"}>
                      {empresa.activa ? "Activa" : "Inactiva"}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{empresa.plan?.nombre || "Sin plan"}</p>
                  </div>
                </div>
              )) || <p className="text-sm text-muted-foreground">No hay empresas registradas</p>}
            </div>
          </CardContent>
        </Card>

        {/* Pedidos recientes */}
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
            <CardDescription>Últimos pedidos realizados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pedidosRecientes?.map((pedido) => (
                <div key={pedido.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {pedido.user?.nombre} {pedido.user?.apellido}
                    </p>
                    <p className="text-sm text-muted-foreground">{pedido.plato?.nombre}</p>
                  </div>
                  <div className="text-right">
                    <Badge
                      variant={
                        pedido.estado === "entregado"
                          ? "default"
                          : pedido.estado === "en_preparacion"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {pedido.estado}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(pedido.fecha_entrega).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )) || <p className="text-sm text-muted-foreground">No hay pedidos registrados</p>}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
