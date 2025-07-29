"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { ingredienteSchema } from "@/lib/validations/ingredientes"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createIngredienteAction(formData: FormData) {
  // TODO: Cuando reactivemos auth, validar que user.role === 'gama_admin'

  const rawData = {
    nombre: (formData.get("nombre") as string)?.trim() || "",
    unidad_de_medida: (formData.get("unidad_de_medida") as string)?.trim() || "",
    categoria: (formData.get("categoria") as string)?.trim() || "",
    activo: formData.get("activo") !== "false",
  }

  console.log("Creating ingrediente with data:", rawData)

  // Validar datos
  const validatedFields = ingredienteSchema.safeParse(rawData)

  if (!validatedFields.success) {
    console.error("Validation errors:", validatedFields.error.flatten())
    return {
      error: "Datos inválidos",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // Limpiar campos opcionales
  const cleanData = {
    nombre: validatedFields.data.nombre,
    unidad_de_medida: validatedFields.data.unidad_de_medida,
    categoria: validatedFields.data.categoria || null,
    activo: validatedFields.data.activo,
  }

  const { data, error } = await supabaseAdmin.from("ingredientes").insert(cleanData).select()

  if (error) {
    console.error("Supabase error creating ingrediente:", error)
    return {
      error: `Error al crear el ingrediente: ${error.message}`,
    }
  }

  console.log("Ingrediente created successfully:", data)

  revalidatePath("/gama/ingredientes")
  redirect("/gama/ingredientes")
}

export async function updateIngredienteAction(id: string, formData: FormData) {
  // TODO: Cuando reactivemos auth, validar que user.role === 'gama_admin'

  const rawData = {
    nombre: (formData.get("nombre") as string)?.trim() || "",
    unidad_de_medida: (formData.get("unidad_de_medida") as string)?.trim() || "",
    categoria: (formData.get("categoria") as string)?.trim() || "",
    activo: formData.get("activo") !== "false",
  }

  const validatedFields = ingredienteSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      error: "Datos inválidos",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const cleanData = {
    nombre: validatedFields.data.nombre,
    unidad_de_medida: validatedFields.data.unidad_de_medida,
    categoria: validatedFields.data.categoria || null,
    activo: validatedFields.data.activo,
  }

  const { data, error } = await supabaseAdmin.from("ingredientes").update(cleanData).eq("id", id).select()

  if (error) {
    console.error("Error updating ingrediente:", error)
    return {
      error: `Error al actualizar el ingrediente: ${error.message}`,
    }
  }

  revalidatePath("/gama/ingredientes")
  revalidatePath(`/gama/ingredientes/${id}`)
  redirect("/gama/ingredientes")
}

export async function deleteIngredienteAction(id: string) {
  // TODO: Cuando reactivemos auth, validar que user.role === 'gama_admin'

  // Verificar si el ingrediente está siendo usado en algún plato
  const { data: platosUsandoIngrediente } = await supabaseAdmin
    .from("plato_ingredientes")
    .select("plato_id")
    .eq("ingrediente_id", id)
    .limit(1)

  if (platosUsandoIngrediente && platosUsandoIngrediente.length > 0) {
    return {
      error: "No se puede eliminar el ingrediente porque está siendo usado en uno o más platos.",
    }
  }

  const { error } = await supabaseAdmin.from("ingredientes").delete().eq("id", id)

  if (error) {
    console.error("Error deleting ingrediente:", error)
    return {
      error: "Error al eliminar el ingrediente. Intenta nuevamente.",
    }
  }

  revalidatePath("/gama/ingredientes")
  return { success: true }
}

export async function toggleIngredienteStatusAction(id: string) {
  // TODO: Cuando reactivemos auth, validar que user.role === 'gama_admin'

  // Obtener el estado actual
  const { data: currentIngrediente } = await supabaseAdmin.from("ingredientes").select("activo").eq("id", id).single()

  if (!currentIngrediente) {
    return { error: "Ingrediente no encontrado" }
  }

  // Cambiar el estado
  const { error } = await supabaseAdmin.from("ingredientes").update({ activo: !currentIngrediente.activo }).eq("id", id)

  if (error) {
    console.error("Error toggling ingrediente status:", error)
    return {
      error: "Error al cambiar el estado del ingrediente.",
    }
  }

  revalidatePath("/gama/ingredientes")
  return { success: true }
}
