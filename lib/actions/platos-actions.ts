"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { platoSchema } from "@/lib/validations/platos"
import { revalidatePath } from "next/cache"

export async function createPlatoAction(formData: FormData) {
  // TODO: Cuando reactivemos auth, validar que user.role === 'gama_admin'

  const rawData = {
    nombre: (formData.get("nombre") as string)?.trim() || "",
    descripcion: (formData.get("descripcion") as string)?.trim() || "",
    tipo: (formData.get("tipo") as string)?.trim() || "",
    imagen_url: (formData.get("imagen_url") as string)?.trim() || "",
    activo: formData.get("activo") !== "false",
  }

  // Obtener ingredientes del FormData
  const ingredientesRaw = formData.get("ingredientes") as string
  let ingredientes: Array<{ ingrediente_id: string; cantidad: number }> = []

  if (ingredientesRaw) {
    try {
      ingredientes = JSON.parse(ingredientesRaw)
    } catch (error) {
      console.error("Error parsing ingredientes:", error)
    }
  }

  console.log("Creating plato with data:", rawData)
  console.log("Ingredientes:", ingredientes)

  // Validar datos básicos del plato
  const validatedFields = platoSchema.safeParse(rawData)

  if (!validatedFields.success) {
    console.error("Validation errors:", validatedFields.error.flatten())
    throw new Error("Datos inválidos")
  }

  // Limpiar campos opcionales
  const cleanData = {
    nombre: validatedFields.data.nombre,
    descripcion: validatedFields.data.descripcion || null,
    tipo: validatedFields.data.tipo || null,
    imagen_url: validatedFields.data.imagen_url || null,
    activo: validatedFields.data.activo,
  }

  // Crear el plato
  const { data: platoCreado, error: platoError } = await supabaseAdmin
    .from("platos")
    .insert(cleanData)
    .select()
    .single()

  if (platoError) {
    console.error("Supabase error creating plato:", platoError)
    throw new Error(`Error al crear el plato: ${platoError.message}`)
  }

  console.log("Plato created successfully:", platoCreado)

  // Si hay ingredientes, crear las relaciones
  if (ingredientes.length > 0) {
    const relacionesIngredientes = ingredientes.map((ing) => ({
      plato_id: platoCreado.id,
      ingrediente_id: ing.ingrediente_id,
      cantidad: ing.cantidad,
      unidad_medida: "gramos", // valor por defecto
    }))

    const { error: ingredientesError } = await supabaseAdmin.from("plato_ingredientes").insert(relacionesIngredientes)

    if (ingredientesError) {
      console.error("Error creating plato-ingredientes relations:", ingredientesError)
      // Eliminar el plato si falló la creación de ingredientes
      await supabaseAdmin.from("platos").delete().eq("id", platoCreado.id)
      throw new Error(`Error al asociar ingredientes: ${ingredientesError.message}`)
    } else {
      console.log("Plato-ingredientes relations created successfully")
    }
  }

  revalidatePath("/gama/platos")
  return { success: true, data: platoCreado }
}

export async function updatePlatoAction(id: string, formData: FormData) {
  // TODO: Cuando reactivemos auth, validar que user.role === 'gama_admin'

  const rawData = {
    nombre: (formData.get("nombre") as string)?.trim() || "",
    descripcion: (formData.get("descripcion") as string)?.trim() || "",
    tipo: (formData.get("tipo") as string)?.trim() || "",
    imagen_url: (formData.get("imagen_url") as string)?.trim() || "",
    activo: formData.get("activo") !== "false",
  }

  // Obtener ingredientes del FormData
  const ingredientesRaw = formData.get("ingredientes") as string
  let ingredientes: Array<{ ingrediente_id: string; cantidad: number }> = []

  if (ingredientesRaw) {
    try {
      ingredientes = JSON.parse(ingredientesRaw)
    } catch (error) {
      console.error("Error parsing ingredientes:", error)
    }
  }

  const validatedFields = platoSchema.safeParse(rawData)

  if (!validatedFields.success) {
    throw new Error("Datos inválidos")
  }

  const cleanData = {
    nombre: validatedFields.data.nombre,
    descripcion: validatedFields.data.descripcion || null,
    tipo: validatedFields.data.tipo || null,
    imagen_url: validatedFields.data.imagen_url || null,
    activo: validatedFields.data.activo,
  }

  // Actualizar el plato
  const { data: platoActualizado, error: platoError } = await supabaseAdmin
    .from("platos")
    .update(cleanData)
    .eq("id", id)
    .select()
    .single()

  if (platoError) {
    console.error("Error updating plato:", platoError)
    throw new Error(`Error al actualizar el plato: ${platoError.message}`)
  }

  // Eliminar relaciones existentes
  const { error: deleteError } = await supabaseAdmin.from("plato_ingredientes").delete().eq("plato_id", id)

  if (deleteError) {
    console.error("Error deleting existing plato-ingredientes relations:", deleteError)
    throw new Error(`Error al actualizar ingredientes: ${deleteError.message}`)
  }

  // Crear nuevas relaciones si hay ingredientes
  if (ingredientes.length > 0) {
    const relacionesIngredientes = ingredientes.map((ing) => ({
      plato_id: id,
      ingrediente_id: ing.ingrediente_id,
      cantidad: ing.cantidad,
      unidad_medida: "gramos", // valor por defecto
    }))

    const { error: ingredientesError } = await supabaseAdmin.from("plato_ingredientes").insert(relacionesIngredientes)

    if (ingredientesError) {
      console.error("Error creating new plato-ingredientes relations:", ingredientesError)
      throw new Error(`Error al asociar ingredientes: ${ingredientesError.message}`)
    }
  }

  revalidatePath("/gama/platos")
  revalidatePath(`/gama/platos/${id}`)
  return { success: true, data: platoActualizado }
}

export async function deletePlato(id: string) {
  // TODO: Cuando reactivemos auth, validar que user.role === 'gama_admin'

  // Las relaciones en plato_ingredientes se eliminan automáticamente por CASCADE
  const { error } = await supabaseAdmin.from("platos").delete().eq("id", id)

  if (error) {
    console.error("Error deleting plato:", error)
    throw new Error("Error al eliminar el plato. Intenta nuevamente.")
  }

  revalidatePath("/gama/platos")
}

export async function togglePlatoStatus(id: string) {
  // TODO: Cuando reactivemos auth, validar que user.role === 'gama_admin'

  // Obtener el estado actual
  const { data: currentPlato } = await supabaseAdmin.from("platos").select("activo").eq("id", id).single()

  if (!currentPlato) {
    throw new Error("Plato no encontrado")
  }

  // Cambiar el estado
  const { error } = await supabaseAdmin.from("platos").update({ activo: !currentPlato.activo }).eq("id", id)

  if (error) {
    console.error("Error toggling plato status:", error)
    throw new Error("Error al cambiar el estado del plato.")
  }

  revalidatePath("/gama/platos")
}
