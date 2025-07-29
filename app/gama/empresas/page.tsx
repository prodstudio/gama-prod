import { supabaseAdmin } from "@/lib/supabase/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Eye, Building, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { DeleteEmpresaButton } from "@/components/forms/delete-empresa-button"

export default async function EmpresasPage() {
  // TODO: Cuando reactivemos auth, validar que user.role === 'gama_admin'

  const { data: empresas, error } = await supabaseAdmin
    .from("empresas")
    .select(`
      *,
      plan:planes(nombre, precio_mensual),
      sucursales(id),
      usuarios:users(id)
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching empresas:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Empresas</h1>
          <p className="text-gray-600">Administra las empresas clientes y sus configuraciones</p>
        </div>
        <Button asChild>
          <Link href="/gama/empresas/nueva">
            <Plus className="mr-2 h-4 w-4" />
            Nueva Empresa
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        {empresas?.map((empresa) => (
          <Card key={empresa.id} className={!empresa.activa ? "opacity-60" : ""}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl">{empresa.nombre}</CardTitle>
                    <Badge variant={empresa.activa ? "default" : "secondary"}>
                      {empresa.activa ? "Activa" : "Inactiva"}
                    </Badge>
                  </div>
                  <CardDescription className="space-y-1">
                    {empresa.email_contacto && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs">📧</span>
                        {empresa.email_contacto}
                      </div>
                    )}
                    {empresa.telefono && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs">📞</span>
                        {empresa.telefono}
                      </div>
                    )}
                    {empresa.direccion && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        {empresa.direccion}
                      </div>
                    )}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-gama-600 mb-1">{empresa.plan?.nombre || "Sin plan"}</div>
                  {empresa.plan?.precio_mensual && (
                    <div className="text-xs text-gray-500">${empresa.plan.precio_mensual.toLocaleString()}/mes</div>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex gap-6 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Building className="h-4 w-4" />
                    <span>{empresa.sucursales?.length || 0} sucursales</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{empresa.usuarios?.length || 0} usuarios</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/gama/empresas/${empresa.id}`}>
                      <Eye className="mr-2 h-4 w-4" />
                      Ver Detalles
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/gama/empresas/${empresa.id}/editar`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Link>
                  </Button>
                  <DeleteEmpresaButton empresaId={empresa.id} empresaNombre={empresa.nombre} />
                </div>
              </div>
            </CardContent>
          </Card>
        )) || (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-gray-500 mb-4">No hay empresas registradas</p>
              <Button asChild>
                <Link href="/gama/empresas/nueva">
                  <Plus className="mr-2 h-4 w-4" />
                  Crear primera empresa
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
