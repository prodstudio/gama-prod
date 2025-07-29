"use server"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { empresaSchema, sucursalSchema } from "@/lib/validations/empresas"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createEmpresaAction(formData: FormData) {
  // TODO: Cuando reactivemos auth, validar que user.role === 'gama_admin'

  const rawData = {
    nombre: formData.get("nombre") as string,
    email_contacto: (formData.get("email_contacto") as string) || "",
    telefono: (formData.get("telefono") as string) || "",
    direccion: (formData.get("direccion") as string) || "",
    plan_id: (formData.get("plan_id") as string) || "",
    activa: formData.get("activa") !== "false",
  }

  // Validar datos
  const validatedFields = empresaSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      error: "Datos inválidos",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  // Limpiar campos vacíos - convertir strings vacíos a null
  const cleanData = {
    nombre: validatedFields.data.nombre,
    email_contacto: validatedFields.data.email_contacto || null,
    telefono: validatedFields.data.telefono || null,
    direccion: validatedFields.data.direccion || null,
    plan_id: validatedFields.data.plan_id || null,
    activa: validatedFields.data.activa,
  }

  try {
    const { data, error } = await supabaseAdmin.from("empresas").insert(cleanData).select()

    if (error) {
      console.error("Error creating empresa:", error)
      return {
        error: "Error al crear la empresa. Intenta nuevamente.",
      }
    }

    revalidatePath("/gama/empresas")
    redirect("/gama/empresas")
  } catch (err) {
    console.error("Unexpected error creating empresa:", err)
    return {
      error: "Error inesperado al crear la empresa.",
    }
  }
}

export async function updateEmpresaAction(id: string, formData: FormData) {
  // TODO: Cuando reactivemos auth, validar que user.role === 'gama_admin'

  const rawData = {
    nombre: formData.get("nombre") as string,
    email_contacto: (formData.get("email_contacto") as string) || "",
    telefono: (formData.get("telefono") as string) || "",
    direccion: (formData.get("direccion") as string) || "",
    plan_id: (formData.get("plan_id") as string) || "",
    activa: formData.get("activa") !== "false",
  }

  const validatedFields = empresaSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      error: "Datos inválidos",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const cleanData = {
    nombre: validatedFields.data.nombre,
    email_contacto: validatedFields.data.email_contacto || null,
    telefono: validatedFields.data.telefono || null,
    direccion: validatedFields.data.direccion || null,
    plan_id: validatedFields.data.plan_id || null,
    activa: validatedFields.data.activa,
  }

  try {
    const { data, error } = await supabaseAdmin.from("empresas").update(cleanData).eq("id", id).select()

    if (error) {
      console.error("Error updating empresa:", error)
      return {
        error: "Error al actualizar la empresa. Intenta nuevamente.",
      }
    }

    revalidatePath("/gama/empresas")
    redirect("/gama/empresas")
  } catch (err) {
    console.error("Unexpected error updating empresa:", err)
    return {
      error: "Error inesperado al actualizar la empresa.",
    }
  }
}

export async function deleteEmpresaAction(id: string) {
  // TODO: Cuando reactivemos auth, validar que user.role === 'gama_admin'

  try {
    // Verificar si la empresa tiene usuarios asociados
    const { data: usuariosAsociados } = await supabaseAdmin.from("users").select("id").eq("empresa_id", id).limit(1)

    if (usuariosAsociados && usuariosAsociados.length > 0) {
      return {
        error: "No se puede eliminar la empresa porque tiene usuarios asociados.",
      }
    }

    // Verificar si la empresa tiene pedidos a través de sus sucursales
    const { data: sucursales } = await supabaseAdmin.from("sucursales").select("id").eq("empresa_id", id)

    if (sucursales && sucursales.length > 0) {
      const sucursalIds = sucursales.map((s) => s.id)
      const { data: pedidosAsociados } = await supabaseAdmin
        .from("pedidos")
        .select("id")
        .in("sucursal_id", sucursalIds)
        .limit(1)

      if (pedidosAsociados && pedidosAsociados.length > 0) {
        return {
          error: "No se puede eliminar la empresa porque tiene pedidos asociados.",
        }
      }
    }

    const { error } = await supabaseAdmin.from("empresas").delete().eq("id", id)

    if (error) {
      console.error("Error deleting empresa:", error)
      return {
        error: "Error al eliminar la empresa. Intenta nuevamente.",
      }
    }

    revalidatePath("/gama/empresas")
    return { success: true }
  } catch (err) {
    console.error("Unexpected error deleting empresa:", err)
    return {
      error: "Error inesperado al eliminar la empresa.",
    }
  }
}

// Actions para sucursales
export async function createSucursalAction(empresaId: string, formData: FormData) {
  // TODO: Cuando reactivemos auth, validar permisos

  const rawData = {
    nombre: formData.get("nombre") as string,
    direccion: formData.get("direccion") as string,
    telefono: (formData.get("telefono") as string) || "",
    activa: formData.get("activa") !== "false",
  }

  const validatedFields = sucursalSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      error: "Datos inválidos",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const sucursalData = {
    nombre: validatedFields.data.nombre,
    direccion: validatedFields.data.direccion,
    telefono: validatedFields.data.telefono || null,
    empresa_id: empresaId,
    activa: validatedFields.data.activa,
  }

  try {
    const { data, error } = await supabaseAdmin.from("sucursales").insert(sucursalData).select()

    if (error) {
      console.error("Error creating sucursal:", error)
      return {
        error: "Error al crear la sucursal. Intenta nuevamente.",
      }
    }

    revalidatePath(`/gama/empresas/${empresaId}`)
    return { success: true, data: data[0] }
  } catch (err) {
    console.error("Unexpected error creating sucursal:", err)
    return {
      error: "Error inesperado al crear la sucursal.",
    }
  }
}

export async function updateSucursalAction(id: string, formData: FormData) {
  // TODO: Cuando reactivemos auth, validar permisos

  const rawData = {
    nombre: formData.get("nombre") as string,
    direccion: formData.get("direccion") as string,
    telefono: (formData.get("telefono") as string) || "",
    activa: formData.get("activa") !== "false",
  }

  const validatedFields = sucursalSchema.safeParse(rawData)

  if (!validatedFields.success) {
    return {
      error: "Datos inválidos",
      fieldErrors: validatedFields.error.flatten().fieldErrors,
    }
  }

  const cleanData = {
    nombre: validatedFields.data.nombre,
    direccion: validatedFields.data.direccion,
    telefono: validatedFields.data.telefono || null,
    activa: validatedFields.data.activa,
  }

  try {
    const { data, error } = await supabaseAdmin.from("sucursales").update(cleanData).eq("id", id).select()

    if (error) {
      console.error("Error updating sucursal:", error)
      return {
        error: "Error al actualizar la sucursal. Intenta nuevamente.",
      }
    }

    // Obtener empresa_id para revalidar
    const { data: sucursal } = await supabaseAdmin.from("sucursales").select("empresa_id").eq("id", id).single()

    if (sucursal) {
      revalidatePath(`/gama/empresas/${sucursal.empresa_id}`)
    }

    return { success: true, data: data[0] }
  } catch (err) {
    console.error("Unexpected error updating sucursal:", err)
    return {
      error: "Error inesperado al actualizar la sucursal.",
    }
  }
}

export async function deleteSucursalAction(id: string) {
  // TODO: Cuando reactivemos auth, validar permisos

  try {
    // Verificar si la sucursal tiene pedidos
    const { data: pedidosAsociados } = await supabaseAdmin.from("pedidos").select("id").eq("sucursal_id", id).limit(1)

    if (pedidosAsociados && pedidosAsociados.length > 0) {
      return {
        error: "No se puede eliminar la sucursal porque tiene pedidos asociados.",
      }
    }

    // Obtener empresa_id antes de eliminar
    const { data: sucursal } = await supabaseAdmin.from("sucursales").select("empresa_id").eq("id", id).single()

    const { error } = await supabaseAdmin.from("sucursales").delete().eq("id", id)

    if (error) {
      console.error("Error deleting sucursal:", error)
      return {
        error: "Error al eliminar la sucursal. Intenta nuevamente.",
      }
    }

    if (sucursal) {
      revalidatePath(`/gama/empresas/${sucursal.empresa_id}`)
    }

    return { success: true }
  } catch (err) {
    console.error("Unexpected error deleting sucursal:", err)
    return {
      error: "Error inesperado al eliminar la sucursal.",
    }
  }
}
