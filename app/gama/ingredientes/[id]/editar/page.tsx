import { supabaseAdmin } from "@/lib/supabase/admin"
import { IngredienteForm } from "@/components/forms/ingrediente-form"
import { notFound } from "next/navigation"

interface EditIngredientePageProps {
  params: {
    id: string
  }
}

// Función para validar si el ID es un UUID válido
function isValidUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

export default async function EditIngredientePage({ params }: EditIngredientePageProps) {
  // Verificar si el ID es válido antes de hacer la consulta
  if (!isValidUUID(params.id)) {
    console.error(`Invalid UUID format: ${params.id}`)
    notFound()
  }

  // TODO: Cuando reactivemos auth, validar que user.role === 'gama_admin'

  try {
    const { data: ingrediente, error } = await supabaseAdmin
      .from("ingredientes")
      .select("*")
      .eq("id", params.id)
      .single()

    if (error || !ingrediente) {
      console.error("Error fetching ingrediente:", error)
      notFound()
    }

    return <IngredienteForm ingrediente={ingrediente} mode="edit" />
  } catch (error) {
    console.error("Unexpected error in EditIngredientePage:", error)
    notFound()
  }
}
