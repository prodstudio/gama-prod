import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

export default async function PlanesPage() {
  const supabase = createServerClient()

  const { data: planes, error } = await supabase.from("planes").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching planes:", error)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Planes</h1>
          <p className="text-gray-600">Administra los planes de contratación disponibles</p>
        </div>
        <Button asChild>
          <Link href="/gama/planes/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Plan
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {planes?.map((plan) => (
          <Card key={plan.id} className={!plan.activo ? "opacity-60" : ""}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{plan.nombre}</CardTitle>
                  <CardDescription className="mt-2">{plan.descripcion}</CardDescription>
                </div>
                <Badge variant={plan.activo ? "default" : "secondary"}>{plan.activo ? "Activo" : "Inactivo"}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-gama-600">
                  ${plan.precio_mensual?.toLocaleString() || "0"}
                  <span className="text-sm font-normal text-gray-500">/mes</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center text-sm">
                    <span className={`mr-2 ${plan.incluye_entrada ? "text-green-600" : "text-gray-400"}`}>
                      {plan.incluye_entrada ? "✓" : "✗"}
                    </span>
                    Incluye entrada
                  </div>
                  <div className="flex items-center text-sm">
                    <span className={`mr-2 ${plan.incluye_postre ? "text-green-600" : "text-gray-400"}`}>
                      {plan.incluye_postre ? "✓" : "✗"}
                    </span>
                    Incluye postre
                  </div>
                  <div className="flex items-center text-sm">
                    <span className={`mr-2 ${plan.incluye_bebida ? "text-green-600" : "text-gray-400"}`}>
                      {plan.incluye_bebida ? "✓" : "✗"}
                    </span>
                    Incluye bebida
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" size="sm" asChild className="flex-1 bg-transparent">
                    <Link href={`/gama/planes/${plan.id}/editar`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Editar
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700 bg-transparent">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )) || (
          <div className="col-span-full">
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500 mb-4">No hay planes registrados</p>
                <Button asChild>
                  <Link href="/gama/planes/nuevo">
                    <Plus className="mr-2 h-4 w-4" />
                    Crear primer plan
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
