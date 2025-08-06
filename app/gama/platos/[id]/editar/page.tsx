import { createServerClient } from "@/lib/supabase/server"
import { PlatoForm } from "@/components/forms/plato-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { notFound } from "next/navigation"

interface EditPlatoPageProps {
  params: {
    id: string
  }
}

// Función para validar si el ID es un UUID válido
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

async function getPlato(id: string) {
  const supabase = createServerClient()

  const { data: plato, error } = await supabase
    .from("platos")
    .select(`
      *,
      plato_ingredientes (
        cantidad,
        ingrediente_id,
        ingrediente:ingredientes (
          id,
          nombre,
          unidad_de_medida
        )
      )
    `)
    .eq("id", id)
    .single()

  if (error || !plato) {
    console.error("Error fetching plato:", error)
    return null
  }

  return plato
}

async function getIngredientesDisponibles() {
  const supabase = createServerClient()

  const { data: ingredientes, error } = await supabase
    .from("ingredientes")
    .select("id, nombre, categoria, unidad_de_medida, activo")
    .eq("activo", true)
    .order("nombre")

  if (error) {
    console.error("Error fetching ingredientes:", error)
    return []
  }

  return ingredientes || []
}

export default async function EditarPlatoPage({
  params,
}: {
  params: { id: string }
}) {
  // Verificar si el ID es válido antes de hacer la consulta
  if (!isValidUUID(params.id)) {
    console.error(`Invalid UUID format: ${params.id}`)
    notFound()
  }

  // TODO: Validar que user.role === 'gama_admin'

  // Obtener el plato y los ingredientes disponibles en paralelo
  const [plato, ingredientesDisponibles] = await Promise.all([
    getPlato(params.id),
    getIngredientesDisponibles()
  ])

  if (!plato) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Editar Plato</h1>
        <p className="text-muted-foreground">Modifica la información del plato "{plato.nombre}"</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Información del Plato</CardTitle>
          <CardDescription>Actualiza los datos del plato y sus ingredientes</CardDescription>
        </CardHeader>
        <CardContent>
          <PlatoForm plato={plato} ingredientesDisponibles={ingredientesDisponibles} />
        </CardContent>
      </Card>
    </div>
  )
}
