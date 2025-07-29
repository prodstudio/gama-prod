import { supabaseAdmin } from "@/lib/supabase/admin"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Edit, MapPin, Phone, Mail, Building, Users } from "lucide-react"
import Link from "next/link"
import { notFound } from "next/navigation"
import { SucursalesList } from "@/components/empresas/sucursales-list"

interface EmpresaDetailPageProps {
  params: {
    id: string
  }
}

export default async function EmpresaDetailPage({ params }: EmpresaDetailPageProps) {
  // TODO: Cuando reactivemos auth, validar que user.role === 'gama_admin'

  const { data: empresa, error } = await supabaseAdmin
    .from("empresas")
    .select(`
      *,
      plan:planes(*),
      sucursales(*),
      usuarios:users(id, nombre, apellido, email, activo)
    `)
    .eq("id", params.id)
    .single()

  if (error || !empresa) {
    notFound()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link href="/gama/empresas">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver
          </Link>
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-gray-900">{empresa.nombre}</h1>
            <Badge variant={empresa.activa ? "default" : "secondary"}>{empresa.activa ? "Activa" : "Inactiva"}</Badge>
          </div>
          <p className="text-gray-600">Detalles y configuración de la empresa</p>
        </div>
        <Button asChild>
          <Link href={`/gama/empresas/${empresa.id}/editar`}>
            <Edit className="mr-2 h-4 w-4" />
            Editar Empresa
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Información general */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Información General</CardTitle>
              <CardDescription>Datos básicos de la empresa</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {empresa.email_contacto && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Email de Contacto</p>
                      <p className="text-sm text-gray-600">{empresa.email_contacto}</p>
                    </div>
                  </div>
                )}

                {empresa.telefono && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium">Teléfono</p>
                      <p className="text-sm text-gray-600">{empresa.telefono}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3">
                  <Building className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Sucursales</p>
                    <p className="text-sm text-gray-600">{empresa.sucursales?.length || 0} ubicaciones</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium">Usuarios</p>
                    <p className="text-sm text-gray-600">{empresa.usuarios?.length || 0} empleados</p>
                  </div>
                </div>
              </div>

              {empresa.direccion && (
                <div className="flex items-start gap-3 pt-2">
                  <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Dirección</p>
                    <p className="text-sm text-gray-600">{empresa.direccion}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Sucursales */}
          <SucursalesList empresaId={empresa.id} sucursales={empresa.sucursales || []} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Plan contratado */}
          <Card>
            <CardHeader>
              <CardTitle>Plan Contratado</CardTitle>
            </CardHeader>
            <CardContent>
              {empresa.plan ? (
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-lg">{empresa.plan.nombre}</h3>
                    <p className="text-sm text-gray-600">{empresa.plan.descripcion}</p>
                  </div>

                  <div className="text-2xl font-bold text-gama-600">
                    ${empresa.plan.precio_mensual?.toLocaleString() || "0"}
                    <span className="text-sm font-normal text-gray-500">/mes</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <span className={`mr-2 ${empresa.plan.incluye_entrada ? "text-green-600" : "text-gray-400"}`}>
                        {empresa.plan.incluye_entrada ? "✓" : "✗"}
                      </span>
                      Incluye entrada
                    </div>
                    <div className="flex items-center text-sm">
                      <span className={`mr-2 ${empresa.plan.incluye_postre ? "text-green-600" : "text-gray-400"}`}>
                        {empresa.plan.incluye_postre ? "✓" : "✗"}
                      </span>
                      Incluye postre
                    </div>
                    <div className="flex items-center text-sm">
                      <span className={`mr-2 ${empresa.plan.incluye_bebida ? "text-green-600" : "text-gray-400"}`}>
                        {empresa.plan.incluye_bebida ? "✓" : "✗"}
                      </span>
                      Incluye bebida
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-3">Sin plan asignado</p>
                  <Button size="sm" asChild>
                    <Link href={`/gama/empresas/${empresa.id}/editar`}>Asignar Plan</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Estadísticas rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Usuarios activos</span>
                <span className="font-medium">{empresa.usuarios?.filter((u) => u.activo).length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Sucursales activas</span>
                <span className="font-medium">{empresa.sucursales?.filter((s) => s.activa).length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Fecha de registro</span>
                <span className="font-medium text-sm">{new Date(empresa.created_at).toLocaleDateString()}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
