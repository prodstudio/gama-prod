import { Suspense } from "react"
import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, ChefHat, Edit, Eye } from "lucide-react"
import Link from "next/link"
import { PlatoFilters } from "@/components/platos/plato-filters"
import { DeletePlatoButton } from "@/components/forms/delete-plato-button"

async function getPlatosWithIngredientes() {
  const supabase = createServerClient()

  const { data: platos, error } = await supabase
    .from("platos")
    .select(`
      *,
      plato_ingredientes (
        cantidad,
        ingrediente:ingredientes (
          id,
          nombre,
          unidad_de_medida
        )
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching platos:", error)
    return []
  }

  return platos || []
}

function PlatoCard({ plato }: { plato: any }) {
  const ingredientesCount = plato.plato_ingredientes?.length || 0

  return (
    <Card className={`hover:shadow-md transition-shadow ${!plato.activo ? "opacity-60" : ""}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1 flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <ChefHat className="h-5 w-5" />
              {plato.nombre}
            </CardTitle>
            <CardDescription className="line-clamp-2">{plato.descripcion || "Sin descripción"}</CardDescription>
          </div>
          <div className="flex flex-col items-end gap-2">
            {plato.tipo && <Badge variant="outline">{plato.tipo.charAt(0).toUpperCase() + plato.tipo.slice(1)}</Badge>}
            <Badge variant={plato.activo ? "default" : "secondary"}>{plato.activo ? "Activo" : "Inactivo"}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Información del plato */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              {ingredientesCount} ingrediente{ingredientesCount !== 1 ? "s" : ""}
            </span>
            {plato.calorias && <span>{plato.calorias} cal</span>}
          </div>

          {/* Ingredientes preview */}
          {plato.plato_ingredientes && plato.plato_ingredientes.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Ingredientes:</h4>
              <div className="flex flex-wrap gap-1">
                {plato.plato_ingredientes.slice(0, 3).map((pi: any) => (
                  <Badge key={pi.ingrediente.id} variant="secondary" className="text-xs">
                    {pi.ingrediente.nombre}
                  </Badge>
                ))}
                {plato.plato_ingredientes.length > 3 && (
                  <Badge variant="secondary" className="text-xs">
                    +{plato.plato_ingredientes.length - 3} más
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Acciones */}
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
              <Link href={`/gama/platos/${plato.id}/editar`}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href={`/gama/platos/${plato.id}`}>
                <Eye className="h-4 w-4" />
              </Link>
            </Button>
            <DeletePlatoButton platoId={plato.id} platoNombre={plato.nombre} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

async function PlatosList() {
  const platos = await getPlatosWithIngredientes()

  if (platos.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ChefHat className="h-12 w-12 text-gray-400 mb-4" />
          <div className="text-center space-y-2">
            <h3 className="text-lg font-semibold">No hay platos registrados</h3>
            <p className="text-muted-foreground">Comienza creando tu primer plato</p>
            <Button asChild className="mt-4">
              <Link href="/gama/platos/nuevo">
                <Plus className="mr-2 h-4 w-4" />
                Crear Plato
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {platos.map((plato) => (
          <PlatoCard key={plato.id} plato={plato} />
        ))}
      </div>

      <div className="text-center text-sm text-gray-500">
        Mostrando {platos.length} plato{platos.length !== 1 ? "s" : ""}
      </div>
    </div>
  )
}

export default function PlatosPage() {
  // TODO: Validar que user.role === 'gama_admin'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platos</h1>
          <p className="text-muted-foreground">Gestiona el catálogo de platos disponibles</p>
        </div>
        <Button asChild>
          <Link href="/gama/platos/nuevo">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Plato
          </Link>
        </Button>
      </div>

      <PlatoFilters />

      <Suspense
        fallback={
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        }
      >
        <PlatosList />
      </Suspense>
    </div>
  )
}
