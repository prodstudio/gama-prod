"use server"

import { createServerClient } from "@/lib/supabase/server"
import { planSchema } from "@/lib/validations/planes"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createPlanAction(formData: FormData) {
  const supabase = createServerClient()

  // Convertir FormData a objeto y parsear números/booleanos
  const rawData = {
    nombre: formData.get("nombre") as string,
    descripcion: formData.get("descripcion") as string,
    incluye_entrada: formData.get("incluye_entrada") === "true",
    incluye_postre: formData.get("incluye_postre") === "true",
    incluye_bebida: formData.get("incluye_bebida") === "true",
    precio_mensual: formData.get("precio_mensual")
      ? Number.parseFloat(formData.get("precio_mensual") as string)
      : undefined,
    activo: formData.get("activo") !== "false", // Por defecto true
  }

  // Validar datos
  const validatedFields = planSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      error: "Datos inválidos",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { data, error } = await supabase.from("planes").insert(validatedFields.data).select()

  if (error) {
    console.error("Error creating plan:", error)
    return {
      error: "Error al crear el plan. Intenta nuevamente.",
    }
  }

  revalidatePath("/gama/planes")
  redirect("/gama/planes")
}

export async function updatePlanAction(id: string, formData: FormData) {
  const supabase = createServerClient()

  // Convertir FormData a objeto
  const rawData = {
    nombre: formData.get("nombre") as string,
    descripcion: formData.get("descripcion") as string,
    incluye_entrada: formData.get("incluye_entrada") === "true",
    incluye_postre: formData.get("incluye_postre") === "true",
    incluye_bebida: formData.get("incluye_bebida") === "true",
    precio_mensual: formData.get("precio_mensual")
      ? Number.parseFloat(formData.get("precio_mensual") as string)
      : undefined,
    activo: formData.get("activo") !== "false",
  }

  // Validar datos
  const validatedFields = planSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      error: "Datos inválidos",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const { data, error } = await supabase.from("planes").update(validatedFields.data).eq("id", id).select()

  if (error) {
    console.error("Error updating plan:", error)
    return {
      error: "Error al actualizar el plan. Intenta nuevamente.",
    }
  }

  revalidatePath("/gama/planes")
  redirect("/gama/planes")
}

export async function deletePlanAction(id: string) {
  const supabase = createServerClient()

  // Verificar si el plan está siendo usado por alguna empresa
  const { data: empresasUsandoPlan } = await supabase.from("empresas").select("id").eq("plan_id", id).limit(1)

  if (empresasUsandoPlan && empresasUsandoPlan.length > 0) {
    return {
      error: "No se puede eliminar el plan porque está siendo usado por una o más empresas.",
    }
  }

  const { error } = await supabase.from("planes").delete().eq("id", id)

  if (error) {
    console.error("Error deleting plan:", error)
    return {
      error: "Error al eliminar el plan. Intenta nuevamente.",
    }
  }

  revalidatePath("/gama/planes")
  return { success: true }
}

export async function togglePlanStatusAction(id: string) {
  const supabase = createServerClient()

  // Obtener el estado actual
  const { data: currentPlan } = await supabase.from("planes").select("activo").eq("id", id).single()

  if (!currentPlan) {
    return { error: "Plan no encontrado" }
  }

  // Cambiar el estado
  const { error } = await supabase.from("planes").update({ activo: !currentPlan.activo }).eq("id", id)

  if (error) {
    console.error("Error toggling plan status:", error)
    return {
      error: "Error al cambiar el estado del plan.",
    }
  }

  revalidatePath("/gama/planes")
  return { success: true }
}
