import { createServerClient } from "@/lib/supabase/server"
import { PlatoForm } from "@/components/forms/plato-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

async function getIngredientesDisponibles() {
  const supabase = createServerClient()

  const { data: ingredientes, error } = await supabase
    .from("ingredientes")
    .select("*")
    .eq("activo", true)
    .order("nombre")

  if (error) {
    console.error("Error fetching ingredientes:", error)
    return []
  }

  return ingredientes || []
}

export default async function NuevoPlatoPage() {
  const ingredientesDisponibles = await getIngredientesDisponibles()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Crear Nuevo Plato</h1>
        <p className="text-muted-foreground">Agrega un nuevo plato al menú con sus ingredientes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Plato</CardTitle>
          <CardDescription>Completa los datos del nuevo plato</CardDescription>
        </CardHeader>
        <CardContent>
          <PlatoForm ingredientesDisponibles={ingredientesDisponibles} />
        </CardContent>
      </Card>
    </div>
  )
}
